import { UserProfile } from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  totalAnalyses: 7,
  problemsExplored: 4,
  lensesUsedCount: 22,
  topPerspectives: [
    'Environmental Science',
    'Civil Engineering',
    'Law & Public Policy',
    'Sociology',
    'Economics',
  ],
  disclaimer:
    'This profile describes your approach to the problems you explored. It is not a prediction of your career, major, intelligence, personality, or future performance.',
  dimensions: [
    {
      id: 'systems-thinking',
      title: 'Systems Thinking',
      signal: 'Strong signal',
      description:
        'You consistently account for second- and third-order feedback loops, resource flows, and interactions between physical and social subsystems rather than isolating isolated components.',
      evidenceNotes: [
        'Integrated ecological brine treatment with agricultural salt-sinks in desalination proposal',
        'Linked urban thermal comfort directly to municipal zoning constraints and neighborhood transit corridors',
        'Anticipated ripple effects of energy subsidies on localized groundwater pumping',
      ],
      relatedDisciplineInteractions: [
        'Environmental Science',
        'Systems Engineering',
        'Civil Engineering',
      ],
    },
    {
      id: 'trade-off-awareness',
      title: 'Trade-off Awareness',
      signal: 'Strong signal',
      description:
        'You explicitly recognize where optimizing one dimension (such as low upfront cost or computational simplicity) compromises another (such as spatial footprint or user maintenance overhead).',
      evidenceNotes: [
        'Weighed passive thermal still footprint against high-pressure reverse osmosis electricity demands',
        'Acknowledged offline cryptographic recording kits sacrifice massive cloud compute scale for tribal privacy',
        'Directly documented yield risks versus environmental soil preservation in agricultural solutions',
      ],
      relatedDisciplineInteractions: [
        'Economics',
        'Operations',
        'Philosophy',
      ],
    },
    {
      id: 'user-people-focus',
      title: 'User / People Focus',
      signal: 'Developing strength',
      description:
        'You design around human habits, cultural dignity, and frontline caregiver/operator workflows, though technical mechanics occasionally overshadow daily user incentives.',
      evidenceNotes: [
        'Highlighted elder dignity and vernacular interface needs in oral language preservation',
        'Grounded hospital data privacy proposals in pediatric patient caregiver realities',
        'Opportunity to further explore day-to-day incentive structures for municipal maintenance volunteers',
      ],
      relatedDisciplineInteractions: [
        'Sociology',
        'UX/UI Design',
        'Nursing',
      ],
    },
    {
      id: 'risk-awareness',
      title: 'Risk Awareness',
      signal: 'Developing strength',
      description:
        'You proactively forecast failure vectors, material degradation, and external climatic hazards, showing healthy skepticism toward unverified assumptions.',
      evidenceNotes: [
        'Identified salt fog corrosion and monsoon humidity degradation as primary equipment risks',
        'Spotted potential re-identification hazards in cross-border rare genomic datasets',
        'Documented community dispute risks over water ration quotas',
      ],
      relatedDisciplineInteractions: [
        'Cybersecurity',
        'Law',
        'Mechanical Engineering',
      ],
    },
    {
      id: 'evidence-based-thinking',
      title: 'Evidence-Based Thinking',
      signal: 'Developing strength',
      description:
        'You seek quantifiable verification metrics (WHO potability parts-per-million, ambient temperature deltas) and ground assertions in empirical testing standards.',
      evidenceNotes: [
        'Specified concrete water potability targets (<200 ppm TDS) and biological bio-indicator audits',
        'Cited thermal drone imaging and emergency hospital admission metrics for urban heat models',
        'Can deepen use of formal statistical power calculations when framing clinical trial queries',
      ],
      relatedDisciplineInteractions: [
        'Statistics',
        'Data Science',
        'Chemistry',
      ],
    },
    {
      id: 'sustainability-awareness',
      title: 'Sustainability Awareness',
      signal: 'Strong signal',
      description:
        'You evaluate proposals through ecological cycles, material circularity, non-toxic outputs, and multi-decade planetary boundaries.',
      evidenceNotes: [
        'Eliminated synthetic disposable reverse-osmosis membranes in favor of biodegradable capillary wicks',
        'Designed halophyte bio-filtration ponds to eliminate toxic ocean brine dumping',
        'Favored passive architectural night-flushing over high-emission mechanical HVAC compressors',
      ],
      relatedDisciplineInteractions: [
        'Sustainability Science',
        'Environmental Science',
        'Agronomy',
      ],
    },
    {
      id: 'business-awareness',
      title: 'Business Awareness',
      signal: 'Worth exploring',
      description:
        'You grasp capital expenditure boundaries and replacement costs, but business model viability, recurring operating unit economics, and customer acquisition channels remain less developed.',
      evidenceNotes: [
        'Focused heavily on community stewardship rather than commercial self-sustaining revenue models',
        'Could examine artisan culinary sea-salt sales as a reliable operating income stream for water kiosks',
        'Opportunity to analyze supply chain vendor leverage and spare-part replenishment contracts',
      ],
      relatedDisciplineInteractions: [
        'Business',
        'Finance',
        'Supply Chain',
      ],
    },
    {
      id: 'operational-thinking',
      title: 'Operational Thinking',
      signal: 'In the mix',
      description:
        'You outline sequential rollout phases and necessary toolkits, with emerging attention to daily maintenance rosters, technician training, and supply bottlenecks.',
      evidenceNotes: [
        'Detailed modular assembly phases using standard carpentry tools',
        'Identified need for localized plumbing maintenance training',
        'Can further specify emergency replacement dispatch protocols and maintenance SLAs',
      ],
      relatedDisciplineInteractions: [
        'Operations',
        'Management',
        'Public Administration',
      ],
    },
    {
      id: 'design-thinking',
      title: 'Design Thinking',
      signal: 'Worth exploring',
      description:
        'You value intuitive usability and physical affordances, with promising room to explore rapid low-fidelity physical prototyping and empathetic co-design sessions.',
      evidenceNotes: [
        'Considered physical grip and weatherproofing in ruggedized audio vaults',
        'Incorporated plain-language symbology for non-literate agricultural soil strip readers',
        'Room to bring participatory community sketch charrettes earlier into problem definitions',
      ],
      relatedDisciplineInteractions: [
        'Product Design',
        'Graphic Design',
        'UX/UI Design',
      ],
    },
    {
      id: 'long-term-thinking',
      title: 'Long-Term Thinking',
      signal: 'Strong signal',
      description:
        'You frame solutions for 20- to 50-year horizon resilience, resisting quick-fix band-aids that create deferred societal debt or legacy lock-in.',
      evidenceNotes: [
        'Designed solar stills with 25-year structural glass lifespans avoiding fast electronic obsolescence',
        'Addressed format obsolescence risk in indigenous audio preservation archives',
        'Respected municipal landmark preservation mandates intended to protect multi-century civic fabric',
      ],
      relatedDisciplineInteractions: [
        'History',
        'Civil Engineering',
        'Architecture',
      ],
    },
  ],
  recentSnapshots: [
    {
      id: 'snap-4',
      date: 'September 14, 2026',
      problemTitle: 'Decentralized Solar Desalination for Island Micro-Communities',
      lensesExamined: ['Environmental Science', 'Civil Engineering', 'Economics', 'Sociology', 'Law'],
      dominantSignals: ['Systems Thinking', 'Sustainability Awareness', 'Trade-off Awareness'],
      reflectionNote:
        'Noticeable shift: You balanced the ecological brine cycle with legal water rights and local community governance structures.',
    },
    {
      id: 'snap-3',
      date: 'September 2, 2026',
      problemTitle: 'Cross-Border Genomic Data Sharing for Ultra-Rare Pediatric Conditions',
      lensesExamined: ['Data Science', 'Law', 'Medicine', 'Cybersecurity', 'Public Health'],
      dominantSignals: ['Risk Awareness', 'Evidence-Based Thinking', 'Trade-off Awareness'],
      reflectionNote:
        'Demonstrated acute awareness of patient re-identification threats under GDPR and HIPAA statutory barriers.',
    },
    {
      id: 'snap-2',
      date: 'August 25, 2026',
      problemTitle: 'Thermal Inequality & Heat Islands in Historic Dense Quarters',
      lensesExamined: ['Architecture', 'Urban Planning', 'Public Health', 'History'],
      dominantSignals: ['Long-Term Thinking', 'Systems Thinking', 'Design Thinking'],
      reflectionNote:
        'Skillfully navigated the tension between passive microclimate cooling and strict architectural preservation guidelines.',
    },
    {
      id: 'snap-1',
      date: 'August 18, 2026',
      problemTitle: 'Sovereign Archival Preservation of Endangered Indigenous Oral Dialects',
      lensesExamined: ['Anthropology', 'Computer Science', 'Cybersecurity', 'Education', 'Literature'],
      dominantSignals: ['User / People Focus', 'Long-Term Thinking', 'Risk Awareness'],
      reflectionNote:
        'Strong ethical sensitivity to community data sovereignty and cultural elder access rights over commercial cloud AI ingestion.',
    },
  ],
};
