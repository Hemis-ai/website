// HemisX Chatbot Knowledge Base — shared across all pages
const websiteKnowledge = [
  // ── Greetings & Small Talk ──
  { keywords: ['hello', 'hi', 'hey', 'sup', 'yo', 'good morning', 'good afternoon', 'good evening', 'whats up', 'howdy'],
    response: "Hey! I'm the HemisX AI Copilot. I can help you explore our products, understand features, get pricing info, or point you to the right team. What can I help with?" },
  { keywords: ['how are you', 'hows it going', 'how do you do'],
    response: "I'm running at full capacity — zero incidents detected. How can I help you today?" },
  { keywords: ['thanks', 'thank you', 'thx', 'cheers', 'appreciate'],
    response: "Anytime! Let me know if there's anything else I can help with." },
  { keywords: ['bye', 'goodbye', 'see you', 'later', 'cya'],
    response: "Stay secure out there! Reach us at info@hemisx.com if you need anything." },
  { keywords: ['who are you', 'what are you', 'are you ai', 'are you a bot', 'are you real'],
    response: "I'm the HemisX AI Copilot — a hardcoded assistant built to help you navigate our platform, understand our tools, and connect with our team. Not sentient yet, but working on it." },

  // ── Company & Team ──
  { keywords: ['founder', 'founders', 'who made', 'who built', 'who created', 'who started', 'behind hemisx', 'your team'],
    response: "HemisX was forged in the shadows by a crew of security engineers who believe offense is the best defense. The team stays stealth — but the tech speaks for itself. Check out our About page → <a href='about.html'>about.html</a>" },
  { keywords: ['about', 'company', 'who is hemisx', 'what is hemisx', 'tell me about'],
    response: "HemisX is an AI-powered cybersecurity platform with 12 tools across 3 suites — Offensive (HEMIS), Cloud Scanner, and Blue Team. We automate everything from code scanning to incident response. → <a href='about.html'>Learn more</a>" },
  { keywords: ['mission', 'vision', 'why hemisx', 'purpose', 'goal'],
    response: "Our mission: make enterprise-grade security accessible at startup speed. We believe AI should hunt threats autonomously so your team can focus on building, not firefighting." },
  { keywords: ['location', 'address', 'where are you', 'office', 'hq', 'headquarter', 'based'],
    response: "We're headquartered in San Francisco, CA. But our code runs everywhere your infrastructure does." },

  // ── Products Overview ──
  { keywords: ['product', 'products', 'suite', 'suites', 'what do you do', 'services', 'offerings', 'platform', 'what do you offer', 'what can you do'],
    response: "We have 3 suites with 12 tools: 1) <b>HEMIS Red Team</b> — SAST, DAST, White Box & Black Box Red Teaming, 2) <b>Cloud Scanner</b> — IAM, Data, Network checks + Compliance, 3) <b>AI Blue Team</b> — XDR, SOAR, DECT. → <a href='products.html'>See all products</a>" },
  { keywords: ['how many tools', 'how many products', 'tool count'],
    response: "12 tools across 3 suites, all in one brutalist console. HEMIS has 6 tools, Cloud Scanner has 3, Blue Team has 3. → <a href='products.html'>Explore them</a>" },
  { keywords: ['console', 'dashboard', 'ui', 'interface', 'portal', 'login', 'app', 'launch'],
    response: "The HemisX Console is our unified web dashboard — high-contrast, brutalist design, built for speed. 12 tools, 3 suites, one screen. → <a href='https://console.hemisx.com' target='_blank'>Try the live demo</a>" },
  { keywords: ['demo', 'try', 'test', 'free trial', 'sandbox', 'playground'],
    response: "You can try our live demo right now — no signup needed. → <a href='https://console.hemisx.com' target='_blank'>Launch Console Demo</a>" },

  // ── SAST ──
  { keywords: ['sast', 'static analysis', 'static application', 'source code scan', 'code review', 'code scan'],
    response: "Our SAST engine has 55+ rules covering SQL injection, command injection, XSS, and more. It includes secret detection (20+ patterns), dependency scanning (SCA), AST parsing, taint analysis, entropy scanning, and an LLM scanner powered by Gemini 2.0 Flash. Supports JS, TS, Python, PHP, Java, Go, Ruby, C#, Swift, Kotlin, Rust + IaC. → <a href='products.html#red'>Learn more</a>" },
  { keywords: ['secret detection', 'secrets', 'api key', 'leaked key', 'hardcoded', 'credential leak'],
    response: "We detect 20+ secret patterns: AWS keys, GitHub tokens, Stripe keys, Slack tokens, JWT secrets, PEM keys, Twilio, SendGrid, and more. Plus Shannon entropy detection catches random-looking API keys that regex misses. → <a href='products.html#red'>SAST details</a>" },
  { keywords: ['dependency', 'sca', 'supply chain', 'package', 'npm', 'pip', 'cve', 'vulnerability database'],
    response: "Our SCA scanner checks package.json, requirements.txt, go.mod, pom.xml, Gemfile, and more against known CVE databases. It flags vulnerable dependencies before they ship. → <a href='products.html#red'>Learn more</a>" },
  { keywords: ['taint', 'taint analysis', 'data flow', 'source to sink'],
    response: "Our taint analysis engine traces data from sources (HTTP input, URL params, request body) to dangerous sinks (eval, SQL queries, innerHTML, exec). If user input reaches a sink unsanitized — we flag it. → <a href='products.html#red'>SAST details</a>" },
  { keywords: ['sarif', 'report', 'export', 'pdf report'],
    response: "We export findings in SARIF format for CI/CD integration, plus PDF reports for stakeholders. Trend tracking over time is built in. → <a href='products.html#red'>Learn more</a>" },
  { keywords: ['build gate', 'ci cd', 'cicd', 'pipeline', 'block build', 'gate'],
    response: "Our build gate blocks CI/CD pipelines if severity thresholds are exceeded. Set your own thresholds — if a critical vuln is found, the build stops. → <a href='products.html#red'>Learn more</a>" },

  // ── DAST ──
  { keywords: ['dast', 'dynamic', 'dynamic scan', 'runtime scan', 'active scan', 'web app scan', 'zap'],
    response: "Our DAST scanner integrates with OWASP ZAP for spider crawling + active scanning, with a built-in fallback scanner. Features CVSS scoring, OWASP Top 10 mapping, Claude AI enrichment for executive summaries and remediation code, cron scheduling, and real-time telemetry. → <a href='products.html#red'>Learn more</a>" },

  // ── WBRT ──
  { keywords: ['wbrt', 'white box', 'whitebox', 'insider threat', 'insider simulation'],
    response: "White Box Red Teaming (WBRT) simulates insider threats using full code knowledge. It imports SAST findings, maps your architecture, generates AI attack graphs with MITRE ATT&CK mapping, and produces kill chains with time-to-exploit estimates and detection difficulty scores. → <a href='products.html#red'>Learn more</a>" },
  { keywords: ['attack graph', 'kill chain', 'attack path', 'exploit chain'],
    response: "Our AI generates attack graphs with probability scoring per node, then chains them into sequential kill chains mapped to MITRE ATT&CK tactics. Each step shows estimated time to exploit and detection difficulty. → <a href='products.html#red'>Learn more</a>" },

  // ── BBRT ──
  { keywords: ['bbrt', 'black box', 'blackbox', 'external recon', 'recon', 'reconnaissance', 'osint'],
    response: "Black Box Red Teaming (BBRT) simulates external attackers with zero prior knowledge. It does subdomain/DNS recon (crt.sh, HackerTarget, AlienVault OTX), port scanning (73 ports), tech fingerprinting (Wappalyzer), vuln intel (NVD, CISA KEV, OSV), cloud asset detection, and Wayback Machine historical recon. → <a href='products.html#red'>Learn more</a>" },
  { keywords: ['subdomain', 'dns', 'takeover', 'crt sh'],
    response: "We enumerate subdomains via crt.sh, HackerTarget, AlienVault OTX, and URLscan. We also detect subdomain takeover vulnerabilities and enumerate DNS records (A, MX, TXT, CNAME). → <a href='products.html#red'>BBRT details</a>" },
  { keywords: ['port scan', 'port', 'service discovery', 'nmap'],
    response: "Our port scanner covers 73 known ports with risk classification per service. We map running services and flag high-risk exposures like open databases and admin panels. → <a href='products.html#red'>BBRT details</a>" },

  // ── Cloud Scanner ──
  { keywords: ['cloud', 'cspm', 'cloud scanner', 'cloud scan', 'misconfiguration', 'cloud security'],
    response: "Cloud Scanner finds misconfigurations across AWS. 10 IAM checks (root keys, MFA, credential rotation, wildcard policies), data checks (S3, RDS, KMS, secrets), network checks (security groups, VPC flow logs), plus compliance scoring and attack scenario generation. → <a href='products.html#cloud'>Learn more</a>" },
  { keywords: ['iam', 'identity', 'access management', 'root account', 'mfa', 'credential rotation'],
    response: "Our IAM module runs 10 checks: root account keys, MFA enforcement, credential rotation (flags 90+ day old keys), wildcard IAM policies, password policy, and Access Analyzer integration. → <a href='products.html#cloud'>Cloud Scanner details</a>" },
  { keywords: ['s3', 'bucket', 'rds', 'database', 'encryption', 'kms'],
    response: "We check S3 public access, encryption enforcement, RDS encryption & backup, secrets rotation, and KMS key policy compliance. Auto-generates CloudFormation/Terraform remediation templates. → <a href='products.html#cloud'>Cloud Scanner details</a>" },
  { keywords: ['security group', 'vpc', 'flow log', 'network', 'firewall', 'nacl'],
    response: "Network checks include: overpermissive security groups (0.0.0.0/0 detection), VPC Flow Logs validation, public RDS scanning, Internet Gateway misconfiguration, and CloudTrail multi-region enforcement. → <a href='products.html#cloud'>Cloud Scanner details</a>" },
  { keywords: ['aws', 'amazon', 'azure', 'gcp', 'cloud provider'],
    response: "Currently we have deep AWS integration with IAM role assumption and confused-deputy protection. Azure and GCP support is on our roadmap. → <a href='products.html#cloud'>Cloud Scanner details</a>" },

  // ── Compliance ──
  { keywords: ['compliance', 'soc 2', 'soc2', 'hipaa', 'pci', 'pci-dss', 'iso 27001', 'iso', 'gdpr', 'nist', 'cis', 'framework', 'regulation'],
    response: "We map findings to CIS Benchmark, PCI-DSS, SOC 2, HIPAA, ISO 27001, GDPR, and NIST. Each finding gets a risk score (0-100) with estimated breach cost in USD and a prioritized remediation queue with effort estimates (5min to 1 week). → <a href='products.html#cloud'>Compliance details</a>" },
  { keywords: ['audit', 'risk score', 'breach cost', 'risk assessment'],
    response: "Every scan generates a risk score (0-100) with estimated breach cost in USD. Findings are mapped to compliance controls so your audit prep is automated. → <a href='products.html#cloud'>Learn more</a>" },

  // ── XDR ──
  { keywords: ['xdr', 'extended detection', 'detection and response', 'threat detection', 'alert', 'correlation'],
    response: "XDR correlates alerts from endpoint, network, cloud, identity, email, SaaS, and deception sources. Features UEBA scoring (0-100), Claude AI threat hunting with natural language queries, kill chain analysis, and response actions (isolate, block, quarantine, revoke, rollback). Real-time streaming via SSE/WebSocket. → <a href='products.html#blue'>Learn more</a>" },
  { keywords: ['ueba', 'behavioral', 'anomaly', 'baseline', 'entity risk'],
    response: "Our UEBA engine scores every entity (user, device, service) from 0-100 based on behavioral deviation from baseline. Impossible travel, unusual login times, privilege escalation patterns — all tracked. → <a href='products.html#blue'>XDR details</a>" },
  { keywords: ['threat hunting', 'hunt', 'investigate', 'investigation'],
    response: "Claude AI powers our threat hunting — ask questions in natural language like 'show me all lateral movement in the last 72 hours' and get correlated results with evidence linking. → <a href='products.html#blue'>XDR details</a>" },

  // ── SOAR ──
  { keywords: ['soar', 'orchestration', 'automation', 'playbook', 'incident response', 'ir', 'triage', 'auto triage'],
    response: "SOAR automates alert triage and incident response. OCSF-aligned ingestion, Claude AI auto-triage with entity criticality scoring, DAG-based playbooks with human approval gates, P1-P4 case management with SLA tracking, and SHA-256 evidence chain-of-custody. → <a href='products.html#blue'>Learn more</a>" },
  { keywords: ['mttr', 'mean time', 'response time', 'sla', 'metrics'],
    response: "We track MTTR, automation rate, false positive rate, and playbook execution stats. Our average MTTR is under 5 minutes with 70%+ automation rate. → <a href='products.html#blue'>SOAR details</a>" },
  { keywords: ['case', 'case management', 'incident', 'ticket', 'priority'],
    response: "Cases are managed P1-P4 with SLA tracking and breach detection. Full audit trail, related case linking, and evidence management with integrity verification (SHA-256 hashing). → <a href='products.html#blue'>SOAR details</a>" },

  // ── DECT ──
  { keywords: ['dect', 'deception', 'honeypot', 'honeytoken', 'canary', 'trap', 'decoy', 'breadcrumb'],
    response: "DECT deploys fake endpoints, ghost S3 buckets, shadow APIs, canary tokens (URL, DNS, document, AWS keys, K8s secrets), and honey credentials (fake AD users, SSH keys, OAuth tokens). Attacker interactions are profiled for sophistication, dwell time, and lateral movement — all mapped to MITRE ATT&CK. → <a href='products.html#blue'>Learn more</a>" },
  { keywords: ['canary token', 'canary', 'token', 'trigger'],
    response: "We support URL, DNS, document (Word/Excel), AWS key, Azure SP, GCP SA, API key, and K8s secret canary tokens. When triggered, we capture geo-location, user agent, source IP, and timestamp — then auto-create SOAR cases. → <a href='products.html#blue'>DECT details</a>" },
  { keywords: ['attacker profile', 'attribution', 'sophistication', 'dwell time'],
    response: "Every deception interaction builds an attacker profile: IP reputation, infrastructure reuse, technique fingerprinting, sophistication level (script kiddie to APT), dwell time, and lateral movement analysis. → <a href='products.html#blue'>DECT details</a>" },

  // ── MITRE ATT&CK ──
  { keywords: ['mitre', 'att&ck', 'attack', 'tactic', 'technique', 'ttp'],
    response: "MITRE ATT&CK mapping is built into every product. SAST maps to CWE, WBRT generates full tactic→technique→sub-technique chains, XDR tracks kill chain progression, and DECT maps each attacker interaction to specific techniques. → <a href='products.html'>See products</a>" },

  // ── OWASP ──
  { keywords: ['owasp', 'owasp top 10', 'top 10', 'injection', 'xss', 'sql injection', 'broken access'],
    response: "Our SAST and DAST scanners map findings directly to OWASP Top 10 categories. SQL injection, XSS, broken access control, security misconfiguration — all covered with CWE correlation and remediation guidance. → <a href='products.html#red'>Learn more</a>" },

  // ── Pricing ──
  { keywords: ['price', 'pricing', 'cost', 'how much', 'plan', 'plans', 'subscription', 'enterprise', 'free', 'pay', 'billing'],
    response: "We offer flexible pricing based on your environment size. Reach out to our team for a custom quote → <a href='contact.html'>Contact us</a> or email info@hemisx.com" },

  // ── Deployment ──
  { keywords: ['deploy', 'deployment', 'saas', 'on premise', 'on-premise', 'self hosted', 'vpc', 'air gap', 'install', 'setup'],
    response: "Two deployment models: <b>SaaS</b> (cloud-hosted, zero infrastructure, scan in under 15 min) and <b>On-Premise/VPC</b> (for regulated industries — healthcare, fintech — with air-gapped options). → <a href='products.html'>Learn more</a>" },

  // ── Integration ──
  { keywords: ['integration', 'integrate', 'api', 'webhook', 'slack', 'jira', 'github', 'gitlab', 'jenkins', 'ci'],
    response: "HemisX integrates with your CI/CD pipeline (GitHub Actions, Jenkins, GitLab CI), exports SARIF for IDE integration, and connects to SIEM, EDR, and ticketing systems via our integration registry. Build gates block pipelines on severity thresholds. → <a href='products.html#red'>Learn more</a>" },

  // ── Languages & Support ──
  { keywords: ['language', 'languages', 'supported', 'javascript', 'python', 'java', 'go', 'rust', 'typescript', 'php', 'ruby', 'terraform', 'docker', 'kubernetes'],
    response: "SAST supports: JavaScript, TypeScript, Python, PHP, Java, Go, Ruby, C#, Swift, Kotlin, Rust — plus IaC scanning for Terraform, Docker, Kubernetes, and GitHub Actions. → <a href='products.html#red'>Full details</a>" },

  // ── AI / LLM ──
  { keywords: ['ai', 'llm', 'artificial intelligence', 'machine learning', 'gemini', 'claude', 'gpt'],
    response: "We use AI throughout: Gemini 2.0 Flash powers our LLM code scanner (800-line chunks), Claude AI enriches DAST findings with executive summaries and remediation code, Claude AI drives threat hunting in XDR, and auto-triage in SOAR. → <a href='products.html'>See how</a>" },

  // ── Navigation ──
  { keywords: ['contact', 'email', 'sales', 'support', 'reach', 'talk to human', 'talk to someone', 'human', 'speak'],
    response: "For general inquiries: <a href='mailto:info@hemisx.com'>info@hemisx.com</a>. For security incidents: <a href='mailto:contact@hemisx.com'>contact@hemisx.com</a>. Or fill out our → <a href='contact.html'>contact form</a>" },
  { keywords: ['career', 'job', 'hiring', 'work', 'apply', 'join', 'opportunity', 'open position', 'intern'],
    response: "We're growing! Careers are opening soon — keep an eye on our → <a href='careers.html'>Careers page</a> for upcoming roles." },
  { keywords: ['about page', 'about us', 'team page'],
    response: "Check out our About page to learn about our offense and defense divisions → <a href='about.html'>About HemisX</a>" },
  { keywords: ['product page', 'all products', 'features page'],
    response: "See all 12 tools across 3 suites on our → <a href='products.html'>Products page</a>" },
  { keywords: ['home', 'homepage', 'main page', 'landing'],
    response: "Head back to the homepage → <a href='index.html'>HemisX Home</a>" },

  // ── Competitor / Comparison ──
  { keywords: ['competitor', 'vs', 'versus', 'compare', 'comparison', 'alternative', 'better than', 'wiz', 'snyk', 'crowdstrike', 'splunk', 'sentinelone'],
    response: "HemisX is a unified platform — offense, defense, and cloud in one console. Most competitors specialize in one area. We combine SAST, DAST, red teaming, cloud scanning, XDR, SOAR, and deception tech in a single brutalist interface. Reach out for a detailed comparison → <a href='contact.html'>Contact us</a>" },

  // ── Security & Trust ──
  { keywords: ['secure', 'security', 'trust', 'safe', 'data privacy', 'data handling', 'encryption'],
    response: "Security is literally what we do. All data is encrypted in transit and at rest. On-premise deployment keeps everything inside your VPC. We practice what we preach — our own infrastructure is continuously scanned by HemisX." },
  { keywords: ['pentest', 'penetration test', 'pen test', 'bug bounty'],
    response: "Our HEMIS Red Team suite covers both white-box and black-box penetration testing with AI-generated attack graphs and exploit chains. It's like having a red team on autopilot. → <a href='products.html#red'>Learn more</a>" },

  // ── How it works ──
  { keywords: ['how does it work', 'how it works', 'workflow', 'process', 'step', 'getting started', 'start', 'onboard'],
    response: "1) Connect your AWS account via IAM role, 2) HemisX auto-discovers assets and scans for misconfigurations, vulnerabilities, and threats, 3) AI triages findings and auto-remediates. First scan in under 15 minutes. → <a href='index.html#how'>See the workflow</a>" },

  // ── Catch-all patterns ──
  { keywords: ['help', 'what can you help', 'options', 'menu', 'what should i ask'],
    response: "I can help with: <b>Products</b> (SAST, DAST, Cloud Scanner, XDR, SOAR, DECT), <b>Pricing</b>, <b>Deployment</b> (SaaS vs On-Prem), <b>Compliance</b> (SOC2, HIPAA, PCI-DSS), <b>Contact</b> info, or <b>Careers</b>. What interests you?" },
  { keywords: ['cool', 'awesome', 'nice', 'great', 'amazing', 'impressive', 'wow', 'sick', 'dope'],
    response: "Glad you think so! Want to see it in action? → <a href='https://console.hemisx.com' target='_blank'>Try the live demo</a>" }
];

function getBotResponse(input) {
  var query = input.toLowerCase().replace(/[^\w\s]/gi, '');
  for (var i = 0; i < websiteKnowledge.length; i++) {
    var item = websiteKnowledge[i];
    if (item.keywords.some(function(keyword) { return query.includes(keyword); })) {
      return item.response;
    }
  }
  return "Hmm, I don't have a specific answer for that yet. Try asking about our <b>products</b>, <b>pricing</b>, <b>compliance</b>, or <b>deployment</b> — or reach the team at <a href='mailto:info@hemisx.com'>info@hemisx.com</a>";
}
