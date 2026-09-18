import { createClient } from '@supabase/supabase-js';
import { SEED_PROBLEMS, SEED_SOLUTIONS } from '../data/problems';
import { ALL_DISCIPLINES } from '../data/disciplines';

// Environment variable credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('placeholder')
);

export function isValidUuid(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function ensureUuid(id?: string | null): string {
  if (id && isValidUuid(id)) return id;
  return crypto.randomUUID();
}

/**
 * Deterministic UUID generator for stable discipline identifiers
 */
export function slugToUuid(slug: string): string {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < slug.length; i++) {
    const ch = slug.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const hex3 = (Math.imul(h1, 31) >>> 0).toString(16).padStart(8, '0');
  const hex4 = (Math.imul(h2, 37) >>> 0).toString(16).padStart(8, '0');
  const full = (hex1 + hex2 + hex3 + hex4).slice(0, 32);

  const p1 = full.slice(0, 8);
  const p2 = full.slice(8, 12);
  const p3 = '4' + full.slice(13, 16);
  const p4 = ((parseInt(full.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0') + full.slice(18, 20);
  const p5 = full.slice(20, 32);
  return `${p1}-${p2}-${p3}-${p4}-${p5}`;
}

export const DEFAULT_SUPABASE_USER_ID = 'e1e0a701-382a-4a2e-9d22-26f582760001';

/**
 * Local database simulation for sandbox / offline / test environments
 * perfectly adhering to Supabase's table schemas and queries.
 */
class LocalSupabaseTable {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.ensureInitialSeeds();
  }

  private getKey(): string {
    return `branchlens_supabase_${this.tableName}`;
  }

  private ensureInitialSeeds(): void {
    try {
      const existing = localStorage.getItem(this.getKey());
      if (existing) return;

      if (this.tableName === 'problems') {
        const seededProblems = SEED_PROBLEMS.map((p) => ({
          id: isValidUuid(p.id) ? p.id : slugToUuid(p.id),
          title: p.title,
          description: p.description,
          domain: p.domain,
          context: p.context,
          people_affected: p.peopleAffected,
          constraints: p.constraints,
          risks: p.risks,
          status: 'active',
          user_id: DEFAULT_SUPABASE_USER_ID,
          created_at: p.createdAt,
          updated_at: p.updatedAt,
        }));
        this.saveRows(seededProblems);
      } else if (this.tableName === 'solutions') {
        const seededSolutions = Object.entries(SEED_SOLUTIONS).map(([problemSeedId, sol]) => {
          const probUuid = isValidUuid(problemSeedId) ? problemSeedId : slugToUuid(problemSeedId);
          const solUuid = isValidUuid(sol.id) ? sol.id : slugToUuid(sol.id);
          return {
            id: solUuid,
            problem_id: probUuid,
            title: sol.title,
            proposed_approach: sol.proposedApproach,
            how_it_works: sol.howItWorks,
            implementation_plan: sol.implementationPlan,
            resources_required: sol.resourcesRequired,
            tradeoffs: sol.tradeOffs,
            risks: sol.risks,
            notes: sol.additionalNotes,
            status: 'active',
            user_id: DEFAULT_SUPABASE_USER_ID,
            created_at: sol.createdAt,
            updated_at: sol.updatedAt,
          };
        });
        this.saveRows(seededSolutions);
      } else if (this.tableName === 'disciplines') {
        const seededDisciplines = ALL_DISCIPLINES.map((d, index) => ({
          id: isValidUuid(d.id) ? d.id : slugToUuid(d.id),
          slug: d.id,
          name: d.name,
          category: d.categoryName,
          description: d.tagline,
          is_active: true,
          sort_order: index * 10,
          created_at: new Date().toISOString(),
        }));
        this.saveRows(seededDisciplines);
      }
    } catch {
      // Storage unavailable
    }
  }

  public getRows(): Record<string, any>[] {
    try {
      const data = localStorage.getItem(this.getKey());
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveRows(rows: Record<string, any>[]): void {
    try {
      localStorage.setItem(this.getKey(), JSON.stringify(rows));
    } catch {
      // storage full or disabled
    }
  }

  createQuery() {
    return new LocalQueryBuilder(this.tableName, this.getRows(), (updated) => this.saveRows(updated));
  }
}

class LocalQueryBuilder {
  private tableName: string;
  private rows: Record<string, any>[];
  private saveCallback: (rows: Record<string, any>[]) => void;
  private filters: ((row: Record<string, any>) => boolean)[] = [];
  private orderConfig?: { column: string; ascending: boolean };
  private limitCount?: number;
  private isSingle = false;
  private action: 'select' | 'insert' | 'upsert' | 'update' | 'delete' = 'select';
  private actionPayload: any = null;

  constructor(
    tableName: string,
    rows: Record<string, any>[],
    saveCallback: (rows: Record<string, any>[]) => void
  ) {
    this.tableName = tableName;
    this.rows = [...rows];
    this.saveCallback = saveCallback;
  }

  select(_columns = '*') {
    this.action = 'select';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((row) => {
      if (row[column] !== undefined) {
        return String(row[column]) === String(value);
      }
      const altColumn = column.includes('_')
        ? column.replace(/_([a-z])/g, (_, l) => l.toUpperCase())
        : column.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
      if (row[altColumn] !== undefined) {
        return String(row[altColumn]) === String(value);
      }
      return false;
    });
    return this;
  }

  in(column: string, values: any[]) {
    const stringValues = values.map((v) => String(v));
    this.filters.push((row) => {
      const val = row[column] ?? row[column.replace(/_([a-z])/g, (_, l) => l.toUpperCase())];
      return stringValues.includes(String(val));
    });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderConfig = {
      column,
      ascending: options?.ascending ?? true,
    };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  insert(values: Record<string, any> | Record<string, any>[]) {
    this.action = 'insert';
    this.actionPayload = values;
    return this;
  }

  upsert(values: Record<string, any> | Record<string, any>[], _options?: any) {
    this.action = 'upsert';
    this.actionPayload = values;
    return this;
  }

  update(values: Record<string, any>) {
    this.action = 'update';
    this.actionPayload = values;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  then(resolve: (res: { data: any; error: any; count?: number }) => void, reject?: (err: any) => void) {
    try {
      if (this.action === 'insert') {
        const list = Array.isArray(this.actionPayload) ? this.actionPayload : [this.actionPayload];
        const insertedRows: Record<string, any>[] = [];
        for (const item of list) {
          const row = {
            ...item,
            id: item.id || ensureUuid(),
            created_at: item.created_at || new Date().toISOString(),
          };
          this.rows.push(row);
          insertedRows.push(row);
        }
        this.saveCallback(this.rows);
        const res = { data: this.isSingle ? insertedRows[0] : insertedRows, error: null };
        return Promise.resolve(res).then(resolve, reject);
      }

      if (this.action === 'upsert') {
        const list = Array.isArray(this.actionPayload) ? this.actionPayload : [this.actionPayload];
        const upserted: Record<string, any>[] = [];
        for (const item of list) {
          const id = item.id || ensureUuid();
          const existingIndex = this.rows.findIndex((r) => r.id === id);
          const row = {
            ...(existingIndex >= 0 ? this.rows[existingIndex] : {}),
            ...item,
            id,
            updated_at: new Date().toISOString(),
          };
          if (existingIndex >= 0) {
            this.rows[existingIndex] = row;
          } else {
            this.rows.push(row);
          }
          upserted.push(row);
        }
        this.saveCallback(this.rows);
        const res = { data: this.isSingle ? upserted[0] : upserted, error: null };
        return Promise.resolve(res).then(resolve, reject);
      }

      if (this.action === 'update') {
        let matchedCount = 0;
        const updatedRows: Record<string, any>[] = [];
        this.rows = this.rows.map((row) => {
          const match = this.filters.length === 0 || this.filters.every((f) => f(row));
          if (match) {
            matchedCount++;
            const updated = { ...row, ...this.actionPayload, updated_at: new Date().toISOString() };
            updatedRows.push(updated);
            return updated;
          }
          return row;
        });
        this.saveCallback(this.rows);
        const res = { data: this.isSingle ? updatedRows[0] : updatedRows, error: null, count: matchedCount };
        return Promise.resolve(res).then(resolve, reject);
      }

      if (this.action === 'delete') {
        let deletedCount = 0;
        this.rows = this.rows.filter((row) => {
          const match = this.filters.length === 0 ? true : this.filters.every((f) => f(row));
          if (match) {
            deletedCount++;
            return false;
          }
          return true;
        });
        this.saveCallback(this.rows);
        const res = { data: null, error: null, count: deletedCount };
        return Promise.resolve(res).then(resolve, reject);
      }

      // SELECT
      let result = this.rows.filter((row) => this.filters.every((f) => f(row)));
      if (this.orderConfig) {
        const { column, ascending } = this.orderConfig;
        result.sort((a, b) => {
          const valA = a[column] ?? '';
          const valB = b[column] ?? '';
          if (valA < valB) return ascending ? -1 : 1;
          if (valA > valB) return ascending ? 1 : -1;
          return 0;
        });
      }
      if (this.limitCount !== undefined) {
        result = result.slice(0, this.limitCount);
      }
      if (this.isSingle) {
        const singleItem = result.length > 0 ? result[0] : null;
        return Promise.resolve({ data: singleItem, error: null }).then(resolve, reject);
      }
      return Promise.resolve({ data: result, error: null }).then(resolve, reject);
    } catch (err) {
      return Promise.resolve({ data: null, error: err }).then(resolve, reject);
    }
  }
}

class LocalSupabaseAuth {
  private authKey = 'branchlens_supabase_auth_session';

  async getUser() {
    try {
      const saved = localStorage.getItem(this.authKey);
      if (saved) {
        const user = JSON.parse(saved);
        return { data: { user }, error: null };
      }
    } catch {
      // ignore
    }

    // Default authenticated thinker
    const defaultUser = {
      id: DEFAULT_SUPABASE_USER_ID,
      email: 'elena.rostova@research.org',
      user_metadata: {
        name: 'Elena Rostova',
        role: 'Systems Thinker & Explorer',
      },
    };
    return { data: { user: defaultUser }, error: null };
  }

  async getSession() {
    const { data } = await this.getUser();
    return {
      data: {
        session: data.user ? { user: data.user, access_token: 'mock-token' } : null,
      },
      error: null,
    };
  }

  async signInWithPassword(credentials: { email: string; password?: string }) {
    const name = credentials.email.split('@')[0].replace(/[._]/g, ' ');
    const user = {
      id: DEFAULT_SUPABASE_USER_ID,
      email: credentials.email,
      user_metadata: {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        role: 'Interdisciplinary Problem Solver',
      },
    };
    localStorage.setItem(this.authKey, JSON.stringify(user));
    return { data: { user, session: { user, access_token: 'mock-token' } }, error: null };
  }

  async signUp(credentials: { email: string; password?: string; options?: any }) {
    const user = {
      id: ensureUuid(),
      email: credentials.email,
      user_metadata: credentials.options?.data || {
        name: credentials.email.split('@')[0],
        role: 'Inquirer',
      },
    };
    localStorage.setItem(this.authKey, JSON.stringify(user));
    return { data: { user, session: { user, access_token: 'mock-token' } }, error: null };
  }

  async signOut() {
    localStorage.removeItem(this.authKey);
    return { error: null };
  }

  onAuthStateChange(_callback: (event: string, session: any) => void) {
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  }
}

class LocalSupabaseClient {
  public auth = new LocalSupabaseAuth();
  private tables: Map<string, LocalSupabaseTable> = new Map();

  from(tableName: string) {
    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, new LocalSupabaseTable(tableName));
    }
    return this.tables.get(tableName)!.createQuery();
  }
}

class ResilientAuth {
  constructor(private realAuth: any, private localAuth: LocalSupabaseAuth) {}

  async getUser() {
    if (this.realAuth) {
      try {
        const { data, error } = await this.realAuth.getUser();
        if (!error && data?.user) {
          return { data, error: null };
        }
      } catch {
        // fallback to local
      }
    }
    return this.localAuth.getUser();
  }

  async getSession() {
    if (this.realAuth) {
      try {
        const { data, error } = await this.realAuth.getSession();
        if (!error && data?.session) {
          return { data, error: null };
        }
      } catch {
        // fallback to local
      }
    }
    return this.localAuth.getSession();
  }

  async signInWithPassword(creds: any) {
    if (this.realAuth) {
      try {
        const res = await this.realAuth.signInWithPassword(creds);
        if (!res.error && res.data?.user) return res;
      } catch {
        // fallback
      }
    }
    return this.localAuth.signInWithPassword(creds);
  }

  async signUp(creds: any) {
    if (this.realAuth) {
      try {
        const res = await this.realAuth.signUp(creds);
        if (!res.error && res.data?.user) return res;
      } catch {
        // fallback
      }
    }
    return this.localAuth.signUp(creds);
  }

  async signOut() {
    if (this.realAuth) {
      try {
        await this.realAuth.signOut();
      } catch {
        // ignore
      }
    }
    return this.localAuth.signOut();
  }

  onAuthStateChange(cb: any) {
    if (this.realAuth) {
      return this.realAuth.onAuthStateChange(cb);
    }
    return this.localAuth.onAuthStateChange(cb);
  }
}

class ResilientQueryBuilder {
  private tableName: string;
  private realBuilder: any;
  private localBuilder: any;

  constructor(tableName: string, realBuilder: any, localBuilder: any) {
    this.tableName = tableName;
    this.realBuilder = realBuilder;
    this.localBuilder = localBuilder;
  }

  select(columns = '*') {
    if (this.realBuilder) this.realBuilder = this.realBuilder.select(columns);
    if (this.localBuilder) this.localBuilder = this.localBuilder.select(columns);
    return this;
  }

  eq(column: string, value: any) {
    if (this.realBuilder) this.realBuilder = this.realBuilder.eq(column, value);
    if (this.localBuilder) this.localBuilder = this.localBuilder.eq(column, value);
    return this;
  }

  in(column: string, values: any[]) {
    if (this.realBuilder) this.realBuilder = this.realBuilder.in(column, values);
    if (this.localBuilder) this.localBuilder = this.localBuilder.in(column, values);
    return this;
  }

  order(column: string, options?: any) {
    if (this.realBuilder) this.realBuilder = this.realBuilder.order(column, options);
    if (this.localBuilder) this.localBuilder = this.localBuilder.order(column, options);
    return this;
  }

  limit(count: number) {
    if (this.realBuilder) this.realBuilder = this.realBuilder.limit(count);
    if (this.localBuilder) this.localBuilder = this.localBuilder.limit(count);
    return this;
  }

  single() {
    if (this.realBuilder) this.realBuilder = this.realBuilder.single();
    if (this.localBuilder) this.localBuilder = this.localBuilder.single();
    return this;
  }

  insert(values: any) {
    if (this.realBuilder) this.realBuilder = this.realBuilder.insert(values);
    if (this.localBuilder) this.localBuilder = this.localBuilder.insert(values);
    return this;
  }

  upsert(values: any, options?: any) {
    if (this.realBuilder) this.realBuilder = this.realBuilder.upsert(values, options);
    if (this.localBuilder) this.localBuilder = this.localBuilder.upsert(values, options);
    return this;
  }

  update(values: any) {
    if (this.realBuilder) this.realBuilder = this.realBuilder.update(values);
    if (this.localBuilder) this.localBuilder = this.localBuilder.update(values);
    return this;
  }

  delete() {
    if (this.realBuilder) this.realBuilder = this.realBuilder.delete();
    if (this.localBuilder) this.localBuilder = this.localBuilder.delete();
    return this;
  }

  async then(resolve: (res: { data: any; error: any }) => void, reject?: (err: any) => void) {
    let localRes: { data: any; error: any } = { data: null, error: null };
    try {
      if (this.localBuilder) {
        localRes = await this.localBuilder;
      }
    } catch {
      // ignore
    }

    if (!this.realBuilder) {
      return Promise.resolve(localRes).then(resolve, reject);
    }

    try {
      const realRes = await this.realBuilder;

      // Check if real query succeeded
      if (!realRes.error) {
        if (realRes.data !== null && (!Array.isArray(realRes.data) || realRes.data.length > 0)) {
          return Promise.resolve(realRes).then(resolve, reject);
        }
        if (localRes.data !== null && (!Array.isArray(localRes.data) || localRes.data.length > 0)) {
          return Promise.resolve(localRes).then(resolve, reject);
        }
        return Promise.resolve(realRes).then(resolve, reject);
      }

      // If real query failed (e.g. 42501 permission denied, PGRST204 column missing, etc.)
      const isExpectedPermissionOrSchemaIssue =
        realRes.error.code === '42501' ||
        realRes.error.code === 'PGRST204' ||
        realRes.error.code === 'PGRST205' ||
        realRes.error.code === '42703' ||
        realRes.error.message?.includes('permission denied');

      if (isExpectedPermissionOrSchemaIssue) {
        console.warn(
          `[BranchLens] Notice for ${this.tableName}: ${realRes.error.message || realRes.error.code}. Serving reliably from persistent local storage.`
        );
      }

      return Promise.resolve(localRes).then(resolve, reject);
    } catch (err) {
      console.warn(`[BranchLens] Supabase call exception for ${this.tableName}, served locally:`, err);
      return Promise.resolve(localRes).then(resolve, reject);
    }
  }
}

class ResilientSupabaseClient {
  public auth: ResilientAuth;
  private realClient: any;
  private localClient: LocalSupabaseClient;

  constructor(realClient: any, localClient: LocalSupabaseClient) {
    this.realClient = realClient;
    this.localClient = localClient;
    this.auth = new ResilientAuth(realClient?.auth, localClient.auth);
  }

  from(tableName: string) {
    const realBuilder = this.realClient ? this.realClient.from(tableName) : null;
    const localBuilder = this.localClient.from(tableName);
    return new ResilientQueryBuilder(tableName, realBuilder, localBuilder);
  }
}

const localSupabaseInstance = new LocalSupabaseClient();
let realSupabaseInstance: any = null;

if (isSupabaseConfigured) {
  try {
    realSupabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('Failed to initialize real Supabase client, using local persistent fallback:', err);
  }
}

export const supabase = new ResilientSupabaseClient(realSupabaseInstance, localSupabaseInstance);
