import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  const contents = fs.readFileSync(filePath, 'utf8');
  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) return;
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (value.startsWith('"') || value.startsWith("'")) {
      const quote = value[0];
      const endIndex = value.indexOf(quote, 1);
      value = endIndex === -1 ? value.slice(1) : value.slice(1, endIndex);
    } else {
      const commentIndex = value.indexOf('#');
      if (commentIndex !== -1) {
        value = value.slice(0, commentIndex).trim();
      }
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
};

loadEnvFile(path.resolve(process.cwd(), '.env'));

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const apiVersion = process.env.SANITY_API_VERSION || '2024-01-01';
const token = process.env.SANITY_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error('Missing SANITY_PROJECT_ID, SANITY_DATASET, or SANITY_TOKEN in .env');
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

const block = (text, style = 'normal') => ({
  _type: 'block',
  style,
  children: [
    {
      _type: 'span',
      text,
      marks: [],
    },
  ],
  markDefs: [],
});

const tagIds = {
  ai: 'tag.ai',
  benchmarking: 'tag.benchmarking',
  devops: 'tag.devops',
  fluxcd: 'tag.fluxcd',
  gitops: 'tag.gitops',
  golang: 'tag.golang',
  java: 'tag.java',
  kubernetes: 'tag.kubernetes',
  langchain: 'tag.langchain',
  llm: 'tag.llm',
  performance: 'tag.performance',
  rag: 'tag.rag',
  tdd: 'tag.tdd',
  testing: 'tag.testing',
};

const tags = [
  { _id: tagIds.ai, _type: 'tag', name: 'AI', slug: { _type: 'slug', current: 'ai' } },
  { _id: tagIds.benchmarking, _type: 'tag', name: 'Benchmarking', slug: { _type: 'slug', current: 'benchmarking' } },
  { _id: tagIds.devops, _type: 'tag', name: 'DevOps', slug: { _type: 'slug', current: 'devops' } },
  { _id: tagIds.fluxcd, _type: 'tag', name: 'FluxCD', slug: { _type: 'slug', current: 'fluxcd' } },
  { _id: tagIds.gitops, _type: 'tag', name: 'GitOps', slug: { _type: 'slug', current: 'gitops' } },
  { _id: tagIds.golang, _type: 'tag', name: 'Golang', slug: { _type: 'slug', current: 'golang' } },
  { _id: tagIds.java, _type: 'tag', name: 'Java', slug: { _type: 'slug', current: 'java' } },
  { _id: tagIds.kubernetes, _type: 'tag', name: 'Kubernetes', slug: { _type: 'slug', current: 'kubernetes' } },
  { _id: tagIds.langchain, _type: 'tag', name: 'LangChain', slug: { _type: 'slug', current: 'langchain' } },
  { _id: tagIds.llm, _type: 'tag', name: 'LLM', slug: { _type: 'slug', current: 'llm' } },
  { _id: tagIds.performance, _type: 'tag', name: 'Performance', slug: { _type: 'slug', current: 'performance' } },
  { _id: tagIds.rag, _type: 'tag', name: 'RAG', slug: { _type: 'slug', current: 'rag' } },
  { _id: tagIds.tdd, _type: 'tag', name: 'TDD', slug: { _type: 'slug', current: 'tdd' } },
  { _id: tagIds.testing, _type: 'tag', name: 'Testing', slug: { _type: 'slug', current: 'testing' } },
];

const pages = [
  {
    _id: 'page.about',
    _type: 'page',
    title: 'About Benelabs',
    slug: { _type: 'slug', current: 'about' },
    intro:
      'Benelabs builds scalable AI, cloud, and backend solutions with an emphasis on reliability, clarity, and measurable outcomes.',
    content: [
      block(
        'At Benelabs, we blend research-driven innovation with practical engineering to deliver solutions that empower businesses. Founded by Benediktus Satriya, a software engineer passionate about backend systems, cloud automation, and AI, the studio focuses on creating tools that simplify complexity.'
      ),
      block(
        'With experience modernizing enterprise systems for clients like CIMB Niaga and Telkomsel, Benediktus brings a hands-on approach to every project. We are based in Jakarta, Indonesia, and committed to open-source contributions, technical education, and community-driven learning.'
      ),
      block('What we do', 'h2'),
      block(
        'We design high-performance backend systems, automate cloud infrastructure, and build AI-powered tools that increase developer velocity. Every engagement balances short-term delivery with long-term maintainability.'
      ),
      block('How we work', 'h2'),
      block(
        'We translate complex requirements into clean, scalable systems. That means clear architecture diagrams, well-defined service boundaries, and documented operations so teams can evolve the system confidently.'
      ),
      block('Founder profile', 'h2'),
      block(
        'Software Engineer with a proven track record in architecting high-performance backend systems and scalable cloud infrastructure. Specialized in Golang, Java Spring, and Kubernetes, with deep expertise in building PaaS solutions and automating DevOps workflows. Currently expanding into Generative AI Engineering, building multi-agent systems and LLM-powered developer tools using LangChain.',
        'blockquote'
      ),
    ],
    seo: {
      title: 'About | Benelabs',
      description:
        'Meet Benelabs, a Jakarta-based studio building scalable AI, cloud, and backend systems for modern teams.',
    },
  },
  {
    _id: 'page.contact',
    _type: 'page',
    title: 'Contact Benelabs',
    slug: { _type: 'slug', current: 'contact' },
    intro:
      'Share a few details about your project and we will respond within two business days. The first consultation is free.',
    content: [
      block(
        'Ready to build something impactful? Let us discuss your goals, timeline, and current stack so we can propose the right architecture and delivery plan.'
      ),
      block(
        'We can help with backend modernization, cloud platform builds, AI automation, or mobile development. If you are unsure where to start, we will help you scope the first milestone.'
      ),
    ],
    seo: {
      title: 'Contact | Benelabs',
      description: 'Discuss your AI, cloud, or backend project with Benelabs and book a free consultation.',
    },
  },
];

const projects = [
  {
    _id: 'project.kubeletto',
    _type: 'project',
    title: 'Kubeletto - Kubernetes PaaS Platform',
    slug: { _type: 'slug', current: 'kubeletto-kubernetes-paas-platform' },
    summary:
      'Architected a platform-as-a-service to simplify Kubernetes deployments with automated containerization, SSL provisioning, and Git-based releases.',
    publishedAt: '2025-04-01',
    techStack: ['Kubernetes', 'Docker', 'FluxCD', 'GitOps', 'Kong API Gateway', 'AWS EC2'],
    links: [{ label: 'Kubeletto', url: 'https://kubeletto.com' }],
    featured: true,
    content: [
      block('Overview', 'h2'),
      block(
        'Kubeletto is a platform-as-a-service designed to remove friction from Kubernetes adoption. It delivers zero-config deployments, automatic container builds, and secure ingress routing so teams can ship quickly without maintaining bespoke pipelines.'
      ),
      block('What shipped', 'h2'),
      block(
        'We implemented Git-based deployments with FluxCD, automated TLS provisioning, and self-healing infrastructure. The platform supports push-to-deploy workflows via GitHub and GitLab webhooks with clear audit trails.'
      ),
      block('Impact', 'h2'),
      block(
        'Engineering teams gained a faster path to production with consistent environments, predictable releases, and simplified operational playbooks for scaling.'
      ),
    ],
    seo: {
      title: 'Kubeletto PaaS Platform | Benelabs',
      description: 'A Kubernetes PaaS platform with automated deployments, SSL provisioning, and GitOps workflows.',
    },
  },
  {
    _id: 'project.leadgen',
    _type: 'project',
    title: 'LeadGen - AI-Powered Lead Generation Tool',
    slug: { _type: 'slug', current: 'leadgen-ai-powered-lead-generation-tool' },
    summary:
      'Built an AI-driven lead generation tool that automates prospect discovery and enriches outreach workflows for tech teams.',
    publishedAt: '2025-03-10',
    techStack: ['LangChain', 'LLM Integration', 'Pinecone', 'ChromaDB', 'Golang', 'AWS'],
    links: [{ label: 'LeadGen', url: 'https://leadgen.Benelabs.tech' }],
    featured: true,
    content: [
      block('Overview', 'h2'),
      block(
        'LeadGen is a subdomain product that helps tech and consulting teams identify high-quality leads using AI-assisted research and enrichment. It combines automated data collection with curated insights for outreach readiness.'
      ),
      block('Approach', 'h2'),
      block(
        'We designed a retrieval-augmented pipeline with LangChain, vector databases, and structured scoring. The workflow prioritizes accuracy, auditability, and clear handoffs to sales or partnerships teams.'
      ),
      block('Outcome', 'h2'),
      block(
        'The system reduces manual research time while keeping lead quality transparent, making it easier to scale outbound campaigns without sacrificing relevance.'
      ),
    ],
    seo: {
      title: 'LeadGen AI Tool | Benelabs',
      description: 'An AI-powered lead generation platform for research, enrichment, and scalable outreach.',
    },
  },
  {
    _id: 'project.monger',
    _type: 'project',
    title: 'Monger - Money Manager App',
    slug: { _type: 'slug', current: 'monger-money-manager-app' },
    summary:
      'Designed a cross-platform personal finance app for tracking expenses, budgeting, and real-time insights with secure syncing.',
    publishedAt: '2025-02-20',
    techStack: ['Flutter', 'Dart', 'Kotlin', 'PostgreSQL', 'Redis', 'Clean Architecture'],
    links: [
      {
        label: 'Google Play (internal test)',
        url: 'https://play.google.com/apps/internaltest/4701366400843359249',
      },
    ],
    content: [
      block('Overview', 'h2'),
      block(
        'Monger is a personal finance companion focused on fast expense capture, clean visual breakdowns, and actionable budgeting insights. The product emphasizes performance and reliability across devices.'
      ),
      block('What we built', 'h2'),
      block(
        'The app uses Flutter for a consistent UI, Kotlin for native integrations, and a backend designed for secure synchronization and low-latency updates. Clean architecture keeps features modular and testable.'
      ),
      block('Release plan', 'h2'),
      block(
        'The public release is scheduled after the current internal test phase, with a focus on stability, data security, and onboarding polish.'
      ),
    ],
    seo: {
      title: 'Monger Money Manager | Benelabs',
      description: 'A cross-platform personal finance app with real-time sync and clean architecture.',
    },
  },
  {
    _id: 'project.cimb-genesys',
    _type: 'project',
    title: 'CIMB Niaga Genesys CRM Integration',
    slug: { _type: 'slug', current: 'cimb-niaga-genesys-crm-integration' },
    summary:
      'Engineered a Java Spring middleware to integrate Genesys omnichannel services, improving response times for high-volume banking interactions.',
    publishedAt: '2024-10-01',
    techStack: ['Java Spring Boot', 'REST APIs', 'PostgreSQL', 'Nginx'],
    content: [
      block('Overview', 'h2'),
      block(
        'We delivered a middleware layer that unified voice and digital channels through Genesys, ensuring consistent routing and SLA adherence in a regulated banking environment.'
      ),
      block('Execution', 'h2'),
      block(
        'The integration focused on resilient API design, transaction observability, and predictable performance under heavy traffic loads.'
      ),
      block('Outcome', 'h2'),
      block(
        'The result was a reliable omnichannel experience with improved monitoring, faster response times, and clearer escalation paths.'
      ),
    ],
    seo: {
      title: 'Genesys CRM Integration | Benelabs',
      description: 'A banking-grade middleware integration for omnichannel customer experiences.',
    },
  },
  {
    _id: 'project.telkomsel-byu',
    _type: 'project',
    title: 'Telkomsel By.U Legacy Migration',
    slug: { _type: 'slug', current: 'telkomsel-byu-legacy-migration' },
    summary:
      'Migrated legacy monolith services into concurrent Go microservices to support large-scale customer migrations.',
    publishedAt: '2024-09-01',
    techStack: ['Golang', 'Microservices', 'gRPC', 'MySQL', 'Redis'],
    content: [
      block('Overview', 'h2'),
      block(
        'We led a bridging migration to refactor monolithic services into scalable, concurrent Go services, enabling smoother customer migrations without downtime.'
      ),
      block('Approach', 'h2'),
      block(
        'The system leveraged Go routines and channels for high-throughput processing, with gRPC for efficient inter-service communication.'
      ),
      block('Impact', 'h2'),
      block(
        'The migration reduced bottlenecks and created a clearer path for future modernization initiatives.'
      ),
    ],
    seo: {
      title: 'Telkomsel By.U Migration | Benelabs',
      description: 'A Go-based microservices migration for large-scale telecom operations.',
    },
  },
];

const posts = [
  {
    _id: 'post.gitops-fluxcd',
    _type: 'post',
    title: 'CI/CD GitOps with Kubernetes and FluxCD',
    slug: { _type: 'slug', current: 'cicd-gitops-with-kubernetes-and-fluxcd' },
    excerpt:
      'A practical guide to GitOps for Kubernetes teams, covering repository structure, FluxCD bootstrap, and safer rollbacks.',
    publishedAt: '2025-02-10',
    tags: [
      { _type: 'reference', _ref: tagIds.gitops },
      { _type: 'reference', _ref: tagIds.kubernetes },
      { _type: 'reference', _ref: tagIds.fluxcd },
      { _type: 'reference', _ref: tagIds.devops },
    ],
    content: [
      block(
        'GitOps replaces manual cluster changes with audited, version-controlled delivery. The result is less drift, clearer ownership, and faster recovery when something goes wrong.'
      ),
      block('Why GitOps works in real teams', 'h2'),
      block(
        'Most delivery pain comes from hidden state. GitOps makes the repository the source of truth, so promotions, rollbacks, and audits become predictable.'
      ),
      block('Reference architecture', 'h2'),
      block(
        'A common setup uses a shared infrastructure repo for cluster-wide tooling and an application repo per service. FluxCD watches these repositories and reconciles the desired state automatically.'
      ),
      block('Bootstrap flow', 'h2'),
      block(
        'Start by bootstrapping FluxCD into the cluster, then apply separation between platform and application configs. Keep secrets in a dedicated workflow so deployment configs stay readable.'
      ),
      block(
        'Example bootstrap command: `flux bootstrap github --owner=org --repository=platform --path=clusters/prod`',
        'blockquote'
      ),
      block('Promotion and rollback', 'h2'),
      block(
        'Use versioned manifests and immutable tags to promote safely. Rollbacks are a git revert with a clear history instead of a scramble of manual changes.'
      ),
      block('Operational guardrails', 'h2'),
      block(
        'Add policy checks, drift detection, and alerting so you catch failures quickly. GitOps gives you the control plane; observability closes the loop.'
      ),
    ],
    seo: {
      title: 'CI/CD GitOps with Kubernetes and FluxCD | Benelabs',
      description: 'A step-by-step guide to GitOps workflows with Kubernetes and FluxCD.',
    },
  },
  {
    _id: 'post.benchmarking-api-performance',
    _type: 'post',
    title: 'Benchmarking API Performance: Go Fiber vs. Java Spring Boot vs. Express.js',
    slug: { _type: 'slug', current: 'benchmarking-api-performance-go-fiber-java-spring-boot-express' },
    excerpt:
      'Comparing throughput and latency across Go Fiber, Spring Boot, and Express.js to help teams pick the right stack.',
    publishedAt: '2025-01-20',
    tags: [
      { _type: 'reference', _ref: tagIds.benchmarking },
      { _type: 'reference', _ref: tagIds.performance },
      { _type: 'reference', _ref: tagIds.golang },
      { _type: 'reference', _ref: tagIds.java },
    ],
    content: [
      block(
        'Performance benchmarking is only useful when the methodology is consistent. The goal is not to crown a winner, but to understand trade-offs for your workload.'
      ),
      block('Test setup', 'h2'),
      block(
        'We standardized payload sizes, database access patterns, and infrastructure configuration to keep the comparison fair. Each stack was warmed up and tested under increasing concurrency.'
      ),
      block('Results summary', 'h2'),
      block(
        'Go Fiber delivered the lowest latency under high concurrency, Spring Boot maintained stable throughput with predictable resource usage, and Express.js remained easiest to iterate on for small teams.'
      ),
      block(
        'Illustrative breakdown: `Fiber fastest -> Spring steady -> Express fastest to build`',
        'blockquote'
      ),
      block('Profiling insights', 'h2'),
      block(
        'Go benefits from lightweight goroutines, while Spring Boot relies on mature JVM optimizations. Express.js shows more overhead in tight loops but shines when developer velocity matters most.'
      ),
      block('Decision framework', 'h2'),
      block(
        'Choose the stack that matches your constraints: latency targets, team familiarity, and operational complexity. Benchmarks guide the decision, but architecture and maintenance matter even more.'
      ),
    ],
    seo: {
      title: 'API Performance Benchmarks | Benelabs',
      description: 'Benchmarking Go Fiber, Java Spring Boot, and Express.js for high-performance APIs.',
    },
  },
  {
    _id: 'post.tdd-go',
    _type: 'post',
    title: 'Test-Driven Development in Go',
    slug: { _type: 'slug', current: 'test-driven-development-in-go' },
    excerpt:
      'A practical workflow for TDD in Go, from defining contracts to structuring tests and refactoring safely.',
    publishedAt: '2024-12-08',
    tags: [
      { _type: 'reference', _ref: tagIds.golang },
      { _type: 'reference', _ref: tagIds.testing },
      { _type: 'reference', _ref: tagIds.tdd },
    ],
    content: [
      block(
        'TDD keeps Go services reliable by forcing clarity up front. Start with a failing test, make it pass, then refactor until the intent is obvious.'
      ),
      block('Start with the contract', 'h2'),
      block(
        'Define the handler or service contract first. Tests should describe behavior: inputs, outputs, and error cases, not the implementation details.'
      ),
      block('Structure your tests', 'h2'),
      block(
        'Table-driven tests are the backbone of Go. They keep assertions compact and make it easy to add edge cases as the system grows.'
      ),
      block(
        'Sample flow: `go test ./...` for fast feedback and `go test -run TestName` during refactors.',
        'blockquote'
      ),
      block('Layer integration safely', 'h2'),
      block(
        'Once units are solid, add integration tests around the persistence layer and external APIs. Keep fixtures lightweight and reset state on every run.'
      ),
      block('Refactor with confidence', 'h2'),
      block(
        'TDD shines when requirements change. With tests in place, you can restructure packages, swap dependencies, or optimize performance without fear of silent regressions.'
      ),
    ],
    seo: {
      title: 'Test-Driven Development in Go | Benelabs',
      description: 'A tutorial on TDD practices in Go for reliable, maintainable backend services.',
    },
  },
  {
    _id: 'post.multi-agent-langchain',
    _type: 'post',
    title: 'Building Multi-Agent AI Systems with LangChain',
    slug: { _type: 'slug', current: 'building-multi-agent-ai-systems-with-langchain' },
    excerpt:
      'Designing multi-agent LLM systems with planner, executor, and reviewer roles backed by reliable retrieval.',
    publishedAt: '2025-03-03',
    tags: [
      { _type: 'reference', _ref: tagIds.ai },
      { _type: 'reference', _ref: tagIds.llm },
      { _type: 'reference', _ref: tagIds.langchain },
      { _type: 'reference', _ref: tagIds.rag },
    ],
    content: [
      block(
        'Multi-agent systems help LLMs stay focused by separating planning, execution, and verification. Each agent owns a narrow responsibility and hands off structured outputs.'
      ),
      block('Agent roles', 'h2'),
      block(
        'A planner creates the task breakdown, an executor performs tool calls, and a reviewer checks results against requirements. This structure reduces hallucinations and improves traceability.'
      ),
      block('RAG pipeline design', 'h2'),
      block(
        'Retrieval-augmented generation keeps responses grounded. Store trusted documentation in a vector index, then filter by relevance before each agent step.'
      ),
      block('Orchestration patterns', 'h2'),
      block(
        'Queue-driven workflows and explicit state tracking make multi-agent systems predictable. Each handoff should include context, decisions, and known risks.'
      ),
      block('Evaluation and guardrails', 'h2'),
      block(
        'Measure accuracy, latency, and cost. Add policy checks, fallback strategies, and human review where the impact is high.'
      ),
    ],
    seo: {
      title: 'Multi-Agent AI Systems with LangChain | Benelabs',
      description: 'How to design multi-agent LLM workflows with LangChain, RAG, and reliable orchestration.',
    },
  },
];

const seed = async () => {
  const docs = [...tags, ...pages, ...projects, ...posts];
  for (const doc of docs) {
    await client.createOrReplace(doc);
    console.log(`Upserted ${doc._type}: ${doc.title ?? doc.name ?? doc._id}`);
  }
};

seed().catch((error) => {
  console.error('Sanity seeding failed:', error.message);
  process.exit(1);
});
