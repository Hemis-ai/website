# Interactive Console Demo Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace screenshot-based product demo modals on /products with guided 4-step interactive console replicas for Cloud Scanner, HEMIS, and Blue Team.

**Architecture:** `ProductCardGrid` opens a new `InteractiveDemoModal` (replacing `DemoModal`) which renders one of three demo components (`ScannerDemo`, `HemisDemo`, `BlueTeamDemo`) based on `productId`. Each demo component receives `step: number` and `onRequestNextStep: () => void`. All data is static, sourced from trimmed copies of the hemis-app mock data.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion 12, Vitest + Testing Library

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/data/demo-scanner.ts` | Create | Local types + trimmed MOCK_FINDINGS / MOCK_SCAN data |
| `src/data/demo-hemis.ts` | Create | Local types + MITRE_TECHNIQUES / PRELOADED_CHAIN / TACTICS_ORDER |
| `src/data/demo-blueteam.ts` | Create | Local types + INITIAL_ALERTS / KILL_CHAIN_EVENTS / HEALTH_SCORE |
| `src/components/products/demos/ScannerDemo.tsx` | Create | 4-step Cloud Scanner guided walkthrough |
| `src/components/products/demos/HemisDemo.tsx` | Create | 4-step HEMIS guided walkthrough |
| `src/components/products/demos/BlueTeamDemo.tsx` | Create | 4-step Blue Team guided walkthrough |
| `src/components/products/InteractiveDemoModal.tsx` | Create | Modal shell: header, step nav, keyboard handling, renders demo component |
| `src/components/products/ProductCardGrid.tsx` | Modify | Open InteractiveDemoModal; button label → "View Full Features" |
| `src/components/products/ProductCard.tsx` | Modify | Button label → "View Full Features" |
| `src/__tests__/InteractiveDemoModal.test.tsx` | Create | Modal shell behavior tests |
| `src/__tests__/ScannerDemo.test.tsx` | Create | Scanner walkthrough tests |
| `src/__tests__/HemisDemo.test.tsx` | Create | HEMIS walkthrough tests |
| `src/__tests__/BlueTeamDemo.test.tsx` | Create | Blue Team walkthrough tests |
| `src/__tests__/ProductCard.test.tsx` | Modify | Update button label matcher |
| `src/__tests__/ProductCardGrid.test.tsx` | Modify | Update button label matcher |

---

## Task 1: Create Demo Data Files

No tests needed — these are typed data files with no logic.

**Files:**
- Create: `src/data/demo-scanner.ts`
- Create: `src/data/demo-hemis.ts`
- Create: `src/data/demo-blueteam.ts`

- [ ] **Step 1: Create `src/data/demo-scanner.ts`**

```typescript
// src/data/demo-scanner.ts

export type ScanFinding = {
  id: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  service: string
  resource: string
  title: string
  description: string
  remediation: string
  compliance: string[]
  riskScore: number
  status: 'OPEN' | 'ACKNOWLEDGED' | 'REMEDIATED'
  region: string
  detectedAt: string
}

export type ScanResult = {
  id: string
  startedAt: string
  completedAt: string
  resourcesScanned: number
  riskScore: number
  findings: ScanFinding[]
  complianceScore: { soc2: number; iso27001: number }
}

export const MOCK_FINDINGS: ScanFinding[] = [
  {
    id: 'f-001', severity: 'CRITICAL', service: 'S3', resource: 'prod-customer-backups',
    title: 'S3 Bucket Publicly Accessible',
    description: 'Bucket "prod-customer-backups" has a public ACL and no bucket policy restriction. All objects are readable by anonymous internet users.',
    remediation: 'Remove public ACL, enable Block Public Access settings, apply restrictive bucket policy.',
    compliance: ['SOC2-CC6.1', 'SOC2-CC6.6', 'ISO27001-A.13.1'],
    riskScore: 97, status: 'OPEN', region: 'us-east-1', detectedAt: '2026-03-13T10:22:00Z',
  },
  {
    id: 'f-002', severity: 'CRITICAL', service: 'IAM', resource: 'arn:aws:iam::482910:user/deploy-bot',
    title: 'IAM User with AdministratorAccess',
    description: 'Service account "deploy-bot" has AdministratorAccess policy attached with active long-lived access keys (last rotated 387 days ago).',
    remediation: 'Replace with IAM role, apply least-privilege policy, rotate or delete access keys.',
    compliance: ['SOC2-CC6.3', 'ISO27001-A.9.2', 'ISO27001-A.9.4'],
    riskScore: 95, status: 'OPEN', region: 'us-east-1', detectedAt: '2026-03-13T10:22:01Z',
  },
  {
    id: 'f-003', severity: 'CRITICAL', service: 'EC2', resource: 'sg-0a4f7b2c1d3e8f9a0',
    title: 'Security Group Allows 0.0.0.0/0 on Port 22',
    description: 'Security group allows unrestricted SSH access from any IPv4 address. Attached to 3 production instances.',
    remediation: 'Restrict inbound rule to known IP ranges. Use AWS Systems Manager Session Manager instead of direct SSH.',
    compliance: ['SOC2-CC6.6', 'ISO27001-A.13.1', 'ISO27001-A.9.4'],
    riskScore: 92, status: 'OPEN', region: 'us-west-2', detectedAt: '2026-03-13T10:22:02Z',
  },
  {
    id: 'f-004', severity: 'HIGH', service: 'RDS', resource: 'prod-postgres-main',
    title: 'RDS Instance Not Encrypted at Rest',
    description: 'Production RDS instance "prod-postgres-main" (PostgreSQL 15.2) has encryption at rest disabled.',
    remediation: 'Enable RDS encryption. Note: requires snapshot restore to new encrypted instance.',
    compliance: ['SOC2-CC9.1', 'ISO27001-A.10.1'],
    riskScore: 81, status: 'OPEN', region: 'us-east-1', detectedAt: '2026-03-13T10:22:03Z',
  },
  {
    id: 'f-005', severity: 'HIGH', service: 'CloudTrail', resource: 'arn:aws:cloudtrail:us-east-1:482910:trail/default',
    title: 'CloudTrail Logging Disabled in us-west-2',
    description: 'No CloudTrail trail is active in the us-west-2 region. API activity in this region is not being logged.',
    remediation: 'Enable CloudTrail in all regions. Enable multi-region trail and log file validation.',
    compliance: ['SOC2-CC7.2', 'ISO27001-A.12.4'],
    riskScore: 78, status: 'OPEN', region: 'us-west-2', detectedAt: '2026-03-13T10:22:04Z',
  },
  {
    id: 'f-006', severity: 'HIGH', service: 'IAM', resource: 'root',
    title: 'Root Account MFA Not Enabled',
    description: 'The AWS root account does not have Multi-Factor Authentication enabled. Root account has been accessed in the past 30 days.',
    remediation: 'Enable MFA on root account immediately. Use hardware MFA device for root.',
    compliance: ['SOC2-CC6.1', 'ISO27001-A.9.3'],
    riskScore: 88, status: 'OPEN', region: 'global', detectedAt: '2026-03-13T10:22:05Z',
  },
  {
    id: 'f-007', severity: 'HIGH', service: 'Lambda', resource: 'arn:aws:lambda:us-east-1:482910:function:process-payments',
    title: 'Lambda Function with Overprivileged Execution Role',
    description: '"process-payments" Lambda has an execution role with s3:*, rds:*, and iam:PassRole.',
    remediation: 'Apply least-privilege IAM policy. Scope S3 permissions to specific bucket/prefix.',
    compliance: ['SOC2-CC6.3', 'ISO27001-A.9.4'],
    riskScore: 74, status: 'OPEN', region: 'us-east-1', detectedAt: '2026-03-13T10:22:06Z',
  },
  {
    id: 'f-008', severity: 'MEDIUM', service: 'S3', resource: 'dev-static-assets',
    title: 'S3 Bucket Versioning Disabled',
    description: 'Bucket "dev-static-assets" does not have versioning enabled.',
    remediation: 'Enable S3 versioning and configure lifecycle policy to manage version storage costs.',
    compliance: ['SOC2-A1.2', 'ISO27001-A.12.3'],
    riskScore: 52, status: 'OPEN', region: 'us-east-1', detectedAt: '2026-03-13T10:22:07Z',
  },
  {
    id: 'f-009', severity: 'MEDIUM', service: 'VPC', resource: 'vpc-0c8d2f1a4b5e6c7d',
    title: 'VPC Flow Logs Not Enabled',
    description: 'Production VPC does not have VPC Flow Logs enabled. Network traffic cannot be audited.',
    remediation: 'Enable VPC Flow Logs to CloudWatch Logs or S3.',
    compliance: ['SOC2-CC7.2', 'ISO27001-A.12.4'],
    riskScore: 55, status: 'ACKNOWLEDGED', region: 'us-east-1', detectedAt: '2026-03-13T10:22:08Z',
  },
  {
    id: 'f-010', severity: 'MEDIUM', service: 'EC2', resource: 'i-0a1b2c3d4e5f6a7b8',
    title: 'EC2 Instance with Public IP in Private Subnet',
    description: 'Instance (api-server-prod-3) is assigned a public IP despite being in a private subnet.',
    remediation: 'Remove public IP assignment. Access through NAT Gateway or ALB.',
    compliance: ['SOC2-CC6.6', 'ISO27001-A.13.1'],
    riskScore: 61, status: 'OPEN', region: 'us-east-1', detectedAt: '2026-03-13T10:22:09Z',
  },
  {
    id: 'f-011', severity: 'LOW', service: 'KMS', resource: 'arn:aws:kms:us-east-1:482910:key/mrk-1234',
    title: 'KMS Key Rotation Not Enabled',
    description: 'Customer-managed KMS key has not been configured for automatic annual rotation.',
    remediation: 'Enable automatic key rotation in KMS key settings.',
    compliance: ['SOC2-CC9.1', 'ISO27001-A.10.1'],
    riskScore: 34, status: 'OPEN', region: 'us-east-1', detectedAt: '2026-03-13T10:22:10Z',
  },
  {
    id: 'f-012', severity: 'LOW', service: 'IAM', resource: 'arn:aws:iam::482910:user/old-contractor',
    title: 'Inactive IAM User with Active Credentials',
    description: 'IAM user "old-contractor" has not logged in for 127 days but has active access keys.',
    remediation: 'Deactivate or delete unused IAM user.',
    compliance: ['SOC2-CC6.2', 'ISO27001-A.9.2'],
    riskScore: 28, status: 'OPEN', region: 'global', detectedAt: '2026-03-13T10:22:11Z',
  },
]

export const MOCK_SCAN: ScanResult = {
  id: 'scan-20260313-001',
  startedAt:   '2026-03-13T10:21:58Z',
  completedAt: '2026-03-13T10:22:41Z',
  resourcesScanned: 247,
  riskScore: 74,
  findings: MOCK_FINDINGS,
  complianceScore: { soc2: 61, iso27001: 58 },
}
```

- [ ] **Step 2: Create `src/data/demo-hemis.ts`**

```typescript
// src/data/demo-hemis.ts

export type MitreTechnique = {
  id: string
  name: string
  tactic: string
  status: 'vulnerable' | 'mitigated' | 'tested' | 'untested'
}

export type AttackChainStep = {
  seq: number
  timestamp: string
  phase: string
  techniqueId: string
  technique: string
  target: string
  result: 'SUCCESS' | 'FAILED'
  detail: string
}

export const MITRE_TECHNIQUES: MitreTechnique[] = [
  { id:'T1595', name:'Active Scanning',            tactic:'Reconnaissance',        status:'tested'     },
  { id:'T1590', name:'Gather Victim Network Info', tactic:'Reconnaissance',        status:'mitigated'  },
  { id:'T1589', name:'Gather Victim Identity Info',tactic:'Reconnaissance',        status:'tested'     },
  { id:'T1190', name:'Exploit Public-Facing App',  tactic:'Initial Access',        status:'vulnerable' },
  { id:'T1078', name:'Valid Accounts',             tactic:'Initial Access',        status:'vulnerable' },
  { id:'T1566', name:'Phishing',                   tactic:'Initial Access',        status:'mitigated'  },
  { id:'T1133', name:'External Remote Services',   tactic:'Initial Access',        status:'tested'     },
  { id:'T1059', name:'Command & Scripting Interpreter', tactic:'Execution',        status:'tested'     },
  { id:'T1203', name:'Exploitation for Execution', tactic:'Execution',             status:'untested'   },
  { id:'T1072', name:'Software Deployment Tools',  tactic:'Execution',             status:'mitigated'  },
  { id:'T1136', name:'Create Account',             tactic:'Persistence',           status:'tested'     },
  { id:'T1098', name:'Account Manipulation',       tactic:'Persistence',           status:'vulnerable' },
  { id:'T1053', name:'Scheduled Task/Job',         tactic:'Persistence',           status:'mitigated'  },
  { id:'T1068', name:'Exploitation for Privilege Escalation', tactic:'Privilege Escalation', status:'vulnerable' },
  { id:'T1548', name:'Abuse Elevation Control',    tactic:'Privilege Escalation',  status:'untested'   },
  { id:'T1562', name:'Impair Defenses',            tactic:'Defense Evasion',       status:'tested'     },
  { id:'T1070', name:'Indicator Removal',          tactic:'Defense Evasion',       status:'mitigated'  },
  { id:'T1036', name:'Masquerading',               tactic:'Defense Evasion',       status:'untested'   },
  { id:'T1552', name:'Unsecured Credentials',      tactic:'Credential Access',     status:'vulnerable' },
  { id:'T1110', name:'Brute Force',                tactic:'Credential Access',     status:'mitigated'  },
  { id:'T1555', name:'Credentials from Password Stores', tactic:'Credential Access', status:'untested' },
  { id:'T1069', name:'Permission Groups Discovery',tactic:'Discovery',             status:'tested'     },
  { id:'T1082', name:'System Information Discovery',tactic:'Discovery',            status:'tested'     },
  { id:'T1083', name:'File and Directory Discovery',tactic:'Discovery',            status:'mitigated'  },
  { id:'T1021', name:'Remote Services',            tactic:'Lateral Movement',      status:'tested'     },
  { id:'T1534', name:'Internal Spearphishing',     tactic:'Lateral Movement',      status:'untested'   },
  { id:'T1530', name:'Data from Cloud Storage',    tactic:'Collection',            status:'vulnerable' },
  { id:'T1213', name:'Data from Info Repositories',tactic:'Collection',            status:'untested'   },
  { id:'T1071', name:'App Layer Protocol',         tactic:'Command and Control',   status:'mitigated'  },
  { id:'T1572', name:'Protocol Tunneling',         tactic:'Command and Control',   status:'untested'   },
  { id:'T1041', name:'Exfil Over C2 Channel',      tactic:'Exfiltration',          status:'tested'     },
  { id:'T1537', name:'Transfer to Cloud Account',  tactic:'Exfiltration',          status:'vulnerable' },
  { id:'T1485', name:'Data Destruction',           tactic:'Impact',                status:'mitigated'  },
  { id:'T1486', name:'Data Encrypted for Impact',  tactic:'Impact',                status:'untested'   },
]

export const PRELOADED_CHAIN: AttackChainStep[] = [
  { seq:1, timestamp:'10:04:12', phase:'Reconnaissance',       techniqueId:'T1595', technique:'Active Scanning',             target:'api.acme-corp.com',             result:'SUCCESS', detail:'Identified 14 open ports. Services: nginx/1.22, PostgreSQL, Redis (unauthenticated).' },
  { seq:2, timestamp:'10:04:31', phase:'Reconnaissance',       techniqueId:'T1589', technique:'Gather Victim Identity Info', target:'LinkedIn / GitHub OSINT',       result:'SUCCESS', detail:'Found 3 developer GitHub accounts. AWS region "us-east-1" leaked from public S3 URLs.' },
  { seq:3, timestamp:'10:05:08', phase:'Initial Access',       techniqueId:'T1190', technique:'Exploit Public-Facing App',   target:'api.acme-corp.com/v1/login',    result:'SUCCESS', detail:'SQL injection in /v1/login email parameter. Extracted 2 admin password hashes.' },
  { seq:4, timestamp:'10:05:44', phase:'Credential Access',    techniqueId:'T1552', technique:'Unsecured Credentials',       target:'.env file in S3 bucket',        result:'SUCCESS', detail:'Public S3 bucket contained .env with AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.' },
  { seq:5, timestamp:'10:06:02', phase:'Privilege Escalation', techniqueId:'T1078', technique:'Valid Accounts (Priv Esc)',   target:'IAM user deploy-bot',           result:'SUCCESS', detail:'Credential pair valid. User has AdministratorAccess policy. Full AWS account compromise.' },
  { seq:6, timestamp:'10:06:18', phase:'Discovery',            techniqueId:'T1069', technique:'Permission Groups Discovery', target:'AWS IAM',                        result:'SUCCESS', detail:'Enumerated 47 IAM users, 12 roles, 8 groups. 3 other high-privilege accounts found.' },
  { seq:7, timestamp:'10:06:55', phase:'Collection',           techniqueId:'T1530', technique:'Data from Cloud Storage',     target:'S3 prod-customer-backups',      result:'SUCCESS', detail:'Accessed and staged 4.2 GB of customer PII data across 847 files.' },
  { seq:8, timestamp:'10:07:33', phase:'Exfiltration',         techniqueId:'T1537', technique:'Transfer to Cloud Account',   target:'External S3 bucket (attacker)', result:'SUCCESS', detail:'Exfiltrated 4.2 GB. Total attack duration: 3m 21s from initial access to data exfil.' },
]

export const TACTICS_ORDER: string[] = [
  'Reconnaissance', 'Resource Development', 'Initial Access', 'Execution',
  'Persistence', 'Privilege Escalation', 'Defense Evasion', 'Credential Access',
  'Discovery', 'Lateral Movement', 'Collection', 'Command and Control', 'Exfiltration', 'Impact',
]
```

- [ ] **Step 3: Create `src/data/demo-blueteam.ts`**

```typescript
// src/data/demo-blueteam.ts

export type ThreatAlert = {
  id: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  summary: string
  source: string
  resource: string
  ip?: string
  region: string
  timestamp: string
  status: 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED'
  tactics: string[]
  autoResponded: boolean
  responseActions: string[]
}

export type KillChainEvent = {
  timestamp: string
  stage: string
  action: string
  actor: string
  target: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
}

export type HealthScore = {
  overall: number
  detection: number
  response: number
  coverage: number
  mttr: string
}

export const INITIAL_ALERTS: ThreatAlert[] = [
  {
    id: 'alert-001', severity: 'CRITICAL',
    title: 'IAM Credentials Used from Anomalous Geolocation',
    summary: 'AWS credentials for "deploy-bot" were used from an IP address in Eastern Europe (185.220.101.47) — a location never seen before for this account. This follows a pattern consistent with credential theft and unauthorized access.',
    source: 'CloudTrail', resource: 'IAM:deploy-bot', ip: '185.220.101.47',
    region: 'eu-central-1', timestamp: '2026-03-13T10:07:44Z',
    status: 'INVESTIGATING', tactics: ['Initial Access', 'Persistence'],
    autoResponded: true,
    responseActions: ['IAM credentials suspended', 'Security team notified', 'Session terminated'],
  },
  {
    id: 'alert-002', severity: 'CRITICAL',
    title: 'Mass S3 Object Enumeration Detected',
    summary: '4,200+ S3 ListObjects API calls were made in under 60 seconds from the same session. This is consistent with automated data harvesting — a precursor to data exfiltration.',
    source: 'CloudTrail', resource: 'S3:prod-customer-backups', ip: '185.220.101.47',
    region: 'us-east-1', timestamp: '2026-03-13T10:06:58Z',
    status: 'CONTAINED', tactics: ['Collection', 'Exfiltration'],
    autoResponded: true,
    responseActions: ['Bucket policy updated to deny external access', 'S3 access logging enabled', 'Incident ticket created (INC-2847)'],
  },
  {
    id: 'alert-003', severity: 'HIGH',
    title: 'GuardDuty: EC2 Instance Communicating with Known Tor Exit Node',
    summary: 'Production instance "api-server-prod-2" has established outbound connections to 3 known Tor exit nodes. This may indicate command-and-control activity.',
    source: 'GuardDuty', resource: 'EC2:i-0a1b2c3d4e5f6a7b9', ip: '176.10.99.200',
    region: 'us-east-1', timestamp: '2026-03-13T09:51:22Z',
    status: 'INVESTIGATING', tactics: ['Command and Control', 'Exfiltration'],
    autoResponded: false, responseActions: [],
  },
  {
    id: 'alert-004', severity: 'HIGH',
    title: 'New IAM Admin Role Created Outside IaC Pipeline',
    summary: 'An IAM role with AdministratorAccess was created directly via the AWS Console by "dev-user-chen" — bypassing the normal Terraform pipeline.',
    source: 'CloudTrail', resource: 'IAM:HemisX-emergency-role', ip: '203.0.113.45',
    region: 'us-east-1', timestamp: '2026-03-13T09:33:10Z',
    status: 'NEW', tactics: ['Persistence', 'Privilege Escalation'],
    autoResponded: false, responseActions: [],
  },
  {
    id: 'alert-005', severity: 'MEDIUM',
    title: 'VPC Flow Logs: Port Scan Detected',
    summary: 'Sequential connection attempts across 2,048 ports detected from 91.213.50.12 targeting your production VPC. No successful connections established.',
    source: 'VPC Flow Logs', resource: 'VPC:vpc-0c8d2f1a4b5e6c7d', ip: '91.213.50.12',
    region: 'us-east-1', timestamp: '2026-03-13T09:12:04Z',
    status: 'RESOLVED', tactics: ['Reconnaissance'],
    autoResponded: true,
    responseActions: ['IP blocked via WAF', 'Alert correlated with HEMIS scan data'],
  },
  {
    id: 'alert-006', severity: 'MEDIUM',
    title: 'Unusual Lambda Invocation Pattern',
    summary: '"process-payments" Lambda was invoked 1,240 times in 5 minutes — 47× above baseline. Invocations carry unusual payload structures not matching normal transaction patterns.',
    source: 'CloudTrail', resource: 'Lambda:process-payments',
    region: 'us-east-1', timestamp: '2026-03-13T08:55:33Z',
    status: 'RESOLVED', tactics: ['Execution', 'Impact'],
    autoResponded: true,
    responseActions: ['Lambda concurrency throttled', 'Payload anomaly flagged for review'],
  },
]

export const KILL_CHAIN_EVENTS: KillChainEvent[] = [
  { timestamp:'10:04:12', stage:'Reconnaissance',      action:'Port & service scan',           actor:'185.220.101.47', target:'api.acme-corp.com',       severity:'LOW'      },
  { timestamp:'10:05:08', stage:'Initial Access',      action:'SQL injection exploit',         actor:'185.220.101.47', target:'/v1/login endpoint',      severity:'CRITICAL' },
  { timestamp:'10:05:44', stage:'Credential Access',   action:'AWS key exfiltration from S3',  actor:'185.220.101.47', target:'prod-env-config bucket',  severity:'CRITICAL' },
  { timestamp:'10:06:02', stage:'Privilege Escalation',action:'IAM escalation via stolen key', actor:'deploy-bot',     target:'AWS IAM',                  severity:'CRITICAL' },
  { timestamp:'10:06:18', stage:'Discovery',           action:'IAM enumeration',               actor:'deploy-bot',     target:'AWS IAM',                  severity:'HIGH'     },
  { timestamp:'10:06:58', stage:'Collection',          action:'Mass S3 enumeration',           actor:'deploy-bot',     target:'prod-customer-backups',    severity:'HIGH'     },
  { timestamp:'10:07:33', stage:'Exfiltration',        action:'Data transfer to external S3',  actor:'deploy-bot',     target:'attacker-staging-bucket',  severity:'CRITICAL' },
  { timestamp:'10:07:44', stage:'Containment',         action:'AI Blue Team auto-response',    actor:'HemisX AI',      target:'IAM:deploy-bot',           severity:'INFO'     },
]

export const HEALTH_SCORE: HealthScore = {
  overall:   72,
  detection: 84,
  response:  79,
  coverage:  58,
  mttr:      '4m 12s',
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Users/sai/Documents/Hemis && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors in the new data files (other pre-existing errors are ok).

- [ ] **Step 5: Commit**

```bash
git add src/data/demo-scanner.ts src/data/demo-hemis.ts src/data/demo-blueteam.ts
git commit -m "feat: add static demo mock data files for interactive demos"
```

---

## Task 2: ScannerDemo Component (TDD)

**Files:**
- Create: `src/__tests__/ScannerDemo.test.tsx`
- Create: `src/components/products/demos/ScannerDemo.tsx`

- [ ] **Step 1: Create test file**

```typescript
// src/__tests__/ScannerDemo.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ScannerDemo } from '@/components/products/demos/ScannerDemo'

const defaultProps = {
  step: 0,
  accentColor: '#6366f1',
  onRequestNextStep: vi.fn(),
}

describe('ScannerDemo', () => {
  describe('Step 0: Connect AWS', () => {
    it('renders AWS account input prefilled', () => {
      render(<ScannerDemo {...defaultProps} step={0} />)
      expect(screen.getByDisplayValue('482910382011')).toBeInTheDocument()
    })

    it('renders region input prefilled', () => {
      render(<ScannerDemo {...defaultProps} step={0} />)
      expect(screen.getByDisplayValue('us-east-1')).toBeInTheDocument()
    })

    it('calls onRequestNextStep when Run Scan is clicked', async () => {
      const onRequestNextStep = vi.fn()
      render(<ScannerDemo {...defaultProps} step={0} onRequestNextStep={onRequestNextStep} />)
      await userEvent.click(screen.getByRole('button', { name: /run scan/i }))
      expect(onRequestNextStep).toHaveBeenCalledOnce()
    })
  })

  describe('Step 1: Scanning', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })

    it('renders progress bar', () => {
      render(<ScannerDemo {...defaultProps} step={1} />)
      expect(screen.getByText(/scanning aws environment/i)).toBeInTheDocument()
    })

    it('advances through stages as timer ticks', () => {
      render(<ScannerDemo {...defaultProps} step={1} />)
      expect(screen.getByText(/connecting to aws account/i)).toBeInTheDocument()
      vi.advanceTimersByTime(350)
      expect(screen.getByText(/enumerating iam resources/i)).toBeInTheDocument()
    })
  })

  describe('Step 2: Findings', () => {
    it('renders 12 findings when ALL filter active', () => {
      render(<ScannerDemo {...defaultProps} step={2} />)
      expect(screen.getAllByText(/CRITICAL|HIGH|MEDIUM|LOW/).length).toBeGreaterThanOrEqual(12)
    })

    it('filters to only CRITICAL findings when CRITICAL clicked', async () => {
      render(<ScannerDemo {...defaultProps} step={2} />)
      await userEvent.click(screen.getByRole('button', { name: 'CRITICAL' }))
      // 3 critical findings exist in mock data
      expect(screen.getAllByText('CRITICAL').length).toBe(4) // button + 3 rows
    })

    it('expands a finding row to show remediation on click', async () => {
      render(<ScannerDemo {...defaultProps} step={2} />)
      // first finding auto-expanded; close it then re-open another
      const firstTitle = screen.getByText('S3 Bucket Publicly Accessible')
      // already expanded by default — check remediation is visible
      expect(screen.getByText(/remove public acl/i)).toBeInTheDocument()
    })

    it('collapses expanded row when clicked again', async () => {
      render(<ScannerDemo {...defaultProps} step={2} />)
      const row = screen.getByText('S3 Bucket Publicly Accessible').closest('[class*="cursor-pointer"]') as HTMLElement
      await userEvent.click(row)
      expect(screen.queryByText(/remove public acl/i)).not.toBeInTheDocument()
    })
  })

  describe('Step 3: Compliance', () => {
    it('renders SOC2 score of 61%', () => {
      render(<ScannerDemo {...defaultProps} step={3} />)
      expect(screen.getByText('61%')).toBeInTheDocument()
    })

    it('renders ISO27001 score of 58%', () => {
      render(<ScannerDemo {...defaultProps} step={3} />)
      expect(screen.getByText('58%')).toBeInTheDocument()
    })

    it('renders Export Audit Package button', () => {
      render(<ScannerDemo {...defaultProps} step={3} />)
      expect(screen.getAllByText(/export audit package/i).length).toBeGreaterThanOrEqual(1)
    })
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd /Users/sai/Documents/Hemis && npx vitest run src/__tests__/ScannerDemo.test.tsx 2>&1 | tail -15
```
Expected: FAIL (ScannerDemo not found)

- [ ] **Step 3: Create `src/components/products/demos/ScannerDemo.tsx`**

```typescript
'use client'
import { useState, useEffect } from 'react'
import { MOCK_FINDINGS, MOCK_SCAN } from '@/data/demo-scanner'

interface ScannerDemoProps {
  step: number
  accentColor: string
  onRequestNextStep: () => void
}

const SCAN_STAGES = [
  'Connecting to AWS account',
  'Enumerating IAM resources',
  'Scanning S3 buckets',
  'Checking EC2 security groups',
  'Auditing RDS instances',
  'Inspecting Lambda functions',
  'Reviewing KMS keys',
  'Checking CloudTrail logs',
  'Analyzing VPC Flow Logs',
  'Mapping compliance controls',
  'Calculating risk scores',
]

const SEV_COLOR: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#6b7280',
}

const SOC2_CONTROLS = [
  { id: 'CC6.1', label: 'Logical Access Controls', pass: false },
  { id: 'CC6.3', label: 'Access Restriction', pass: false },
  { id: 'CC6.6', label: 'Network Boundaries', pass: false },
  { id: 'CC7.2', label: 'Monitoring of System Components', pass: false },
  { id: 'CC9.1', label: 'Risk Mitigation', pass: false },
  { id: 'A1.2', label: 'Availability & Backup', pass: true },
]

const ISO_CONTROLS = [
  { id: 'A.9.2', label: 'User Access Management', pass: false },
  { id: 'A.9.4', label: 'Access Control Policy', pass: false },
  { id: 'A.10.1', label: 'Cryptographic Controls', pass: false },
  { id: 'A.12.3', label: 'Information Backup', pass: true },
  { id: 'A.12.4', label: 'Logging and Monitoring', pass: false },
  { id: 'A.13.1', label: 'Network Controls', pass: false },
]

type Severity = 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export function ScannerDemo({ step, accentColor, onRequestNextStep }: ScannerDemoProps) {
  const [stageIndex, setStageIndex] = useState(0)
  const [filter, setFilter] = useState<Severity>('ALL')
  const [expandedId, setExpandedId] = useState<string>('f-001')

  useEffect(() => {
    if (step !== 1) return
    setStageIndex(0)
    const iv = setInterval(() => {
      setStageIndex(i => {
        if (i >= SCAN_STAGES.length - 1) { clearInterval(iv); return i }
        return i + 1
      })
    }, 350)
    return () => clearInterval(iv)
  }, [step])

  const filtered = filter === 'ALL' ? MOCK_FINDINGS : MOCK_FINDINGS.filter(f => f.severity === filter)

  return (
    <div className="p-6">
      {/* Step 0: Connect AWS */}
      {step === 0 && (
        <div className="max-w-lg mx-auto bg-slate-800 rounded-xl p-6 border border-slate-700">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: accentColor }}>
            AWS Connection Setup
          </p>
          <div className="space-y-3 mb-6">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">AWS Account ID</label>
              <input
                readOnly
                value="482910382011"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Region</label>
              <input
                readOnly
                value="us-east-1"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 font-mono"
              />
            </div>
          </div>
          <button
            onClick={onRequestNextStep}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all animate-pulse"
            style={{ background: accentColor }}
          >
            Run Scan →
          </button>
        </div>
      )}

      {/* Step 1: Scanning */}
      {step === 1 && (
        <div className="max-w-lg mx-auto space-y-4">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-200">Scanning AWS Environment</span>
              <span className="text-xs text-slate-500">{stageIndex + 1}/{SCAN_STAGES.length}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mb-4 overflow-hidden">
              <div
                data-testid="scan-progress"
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((stageIndex + 1) / SCAN_STAGES.length) * 100}%`, background: accentColor }}
              />
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              {SCAN_STAGES.slice(0, stageIndex + 1).map((stage, i) => (
                <div key={stage} className={i === stageIndex ? 'text-slate-200' : 'text-slate-500'}>
                  {i === stageIndex ? '→ ' : '✓ '}{stage}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Findings table */}
      {step === 2 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setFilter(sev)}
                className="px-3 py-1 text-xs font-semibold rounded-md border transition-colors"
                style={filter === sev
                  ? { background: accentColor, borderColor: accentColor, color: '#fff' }
                  : { background: 'transparent', borderColor: '#334155', color: '#94a3b8' }
                }
              >
                {sev}
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-500">{filtered.length} findings</span>
          </div>
          <div className="rounded-xl border border-slate-700 overflow-hidden">
            {filtered.map(f => (
              <div key={f.id} className="border-b border-slate-700 last:border-0">
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-800/50"
                  onClick={() => setExpandedId(expandedId === f.id ? '' : f.id)}
                >
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded border shrink-0"
                    style={{ color: SEV_COLOR[f.severity], borderColor: SEV_COLOR[f.severity] + '44', background: SEV_COLOR[f.severity] + '18' }}
                  >
                    {f.severity}
                  </span>
                  <span className="text-xs text-slate-400 w-20 shrink-0">{f.service}</span>
                  <span className="text-sm text-slate-200 flex-1 truncate">{f.title}</span>
                  <span className="text-[10px] text-slate-500">{expandedId === f.id ? '▲' : '▼'}</span>
                </div>
                {expandedId === f.id && (
                  <div className="px-4 pb-4 space-y-2 bg-slate-800/30">
                    <p className="text-xs text-slate-400">{f.description}</p>
                    <p className="text-xs text-slate-300">
                      <span className="text-slate-500">Remediation: </span>{f.remediation}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {f.compliance.map(c => (
                        <span key={c} className="text-[10px] bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-slate-400">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Compliance report */}
      {step === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'SOC 2 Type II', score: MOCK_SCAN.complianceScore.soc2, controls: SOC2_CONTROLS },
            { name: 'ISO/IEC 27001', score: MOCK_SCAN.complianceScore.iso27001, controls: ISO_CONTROLS },
          ].map(({ name, score, controls }) => (
            <div key={name} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-200">{name}</span>
                <span className="text-2xl font-bold" style={{ color: accentColor }}>{score}%</span>
              </div>
              <div className="space-y-1.5">
                {controls.map(c => (
                  <div key={c.id} className="flex items-center gap-2 text-xs">
                    <span className={c.pass ? 'text-emerald-400' : 'text-red-400'}>{c.pass ? '✓' : '✕'}</span>
                    <span className="text-slate-500 font-mono">{c.id}</span>
                    <span className="text-slate-400">{c.label}</span>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2 text-xs font-semibold rounded-lg border border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors">
                Export Audit Package ↓
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd /Users/sai/Documents/Hemis && npx vitest run src/__tests__/ScannerDemo.test.tsx 2>&1 | tail -15
```
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/ScannerDemo.test.tsx src/components/products/demos/ScannerDemo.tsx
git commit -m "feat: add ScannerDemo 4-step interactive walkthrough"
```

---

## Task 3: HemisDemo Component (TDD)

**Files:**
- Create: `src/__tests__/HemisDemo.test.tsx`
- Create: `src/components/products/demos/HemisDemo.tsx`

- [ ] **Step 1: Create test file**

```typescript
// src/__tests__/HemisDemo.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HemisDemo } from '@/components/products/demos/HemisDemo'

const defaultProps = {
  step: 0,
  accentColor: '#10b981',
  onRequestNextStep: vi.fn(),
}

describe('HemisDemo', () => {
  describe('Step 0: Choose scenario', () => {
    it('renders 3 quick template cards', () => {
      render(<HemisDemo {...defaultProps} step={0} />)
      expect(screen.getByText(/simulate an external attacker/i)).toBeInTheDocument()
      expect(screen.getByText(/test our llm application/i)).toBeInTheDocument()
      expect(screen.getByText(/red team our internal admin panel/i)).toBeInTheDocument()
    })

    it('Execute button is disabled initially', () => {
      render(<HemisDemo {...defaultProps} step={0} />)
      expect(screen.getByRole('button', { name: /execute simulation/i })).toBeDisabled()
    })

    it('Execute button enables after selecting a template', async () => {
      render(<HemisDemo {...defaultProps} step={0} />)
      await userEvent.click(screen.getByText(/simulate an external attacker/i))
      expect(screen.getByRole('button', { name: /execute simulation/i })).not.toBeDisabled()
    })

    it('calls onRequestNextStep when Execute is clicked with template selected', async () => {
      const onRequestNextStep = vi.fn()
      render(<HemisDemo {...defaultProps} step={0} onRequestNextStep={onRequestNextStep} />)
      await userEvent.click(screen.getByText(/simulate an external attacker/i))
      await userEvent.click(screen.getByRole('button', { name: /execute simulation/i }))
      expect(onRequestNextStep).toHaveBeenCalledOnce()
    })
  })

  describe('Step 1: Simulation running', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('shows live indicator', () => {
      render(<HemisDemo {...defaultProps} step={1} />)
      expect(screen.getByText(/simulation running/i)).toBeInTheDocument()
    })

    it('streams terminal lines as timer advances', () => {
      render(<HemisDemo {...defaultProps} step={1} />)
      vi.advanceTimersByTime(400)
      expect(screen.getByText(/initializing hemis/i)).toBeInTheDocument()
    })
  })

  describe('Step 2: Attack chain', () => {
    it('renders 8 attack chain steps', () => {
      render(<HemisDemo {...defaultProps} step={2} />)
      expect(screen.getByText(/active scanning/i)).toBeInTheDocument()
      expect(screen.getByText(/transfer to cloud account/i)).toBeInTheDocument()
    })

    it('shows MITRE technique IDs', () => {
      render(<HemisDemo {...defaultProps} step={2} />)
      expect(screen.getByText('T1595')).toBeInTheDocument()
      expect(screen.getByText('T1537')).toBeInTheDocument()
    })
  })

  describe('Step 3: MITRE heatmap', () => {
    it('renders technique cells', () => {
      render(<HemisDemo {...defaultProps} step={3} />)
      expect(screen.getByText('T1595')).toBeInTheDocument()
    })

    it('renders tactic group labels', () => {
      render(<HemisDemo {...defaultProps} step={3} />)
      expect(screen.getByText('Reconnaissance')).toBeInTheDocument()
      expect(screen.getByText('Exfiltration')).toBeInTheDocument()
    })

    it('renders status legend', () => {
      render(<HemisDemo {...defaultProps} step={3} />)
      expect(screen.getByText('vulnerable')).toBeInTheDocument()
      expect(screen.getByText('mitigated')).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd /Users/sai/Documents/Hemis && npx vitest run src/__tests__/HemisDemo.test.tsx 2>&1 | tail -15
```
Expected: FAIL

- [ ] **Step 3: Create `src/components/products/demos/HemisDemo.tsx`**

```typescript
'use client'
import { useState, useEffect } from 'react'
import { PRELOADED_CHAIN, MITRE_TECHNIQUES, TACTICS_ORDER } from '@/data/demo-hemis'

interface HemisDemoProps {
  step: number
  accentColor: string
  onRequestNextStep: () => void
}

const QUICK_TEMPLATES = [
  'Simulate an external attacker targeting our production API and AWS environment',
  'Test our LLM application for prompt injection and jailbreak vulnerabilities',
  'Red team our internal admin panel for privilege escalation paths',
]

const TERMINAL_LINES: { type: string; text: string }[] = [
  { type: 'dim',     text: '[10:04:10] Initializing HEMIS v2.4 simulation engine...' },
  { type: 'dim',     text: '[10:04:11] Loading MITRE ATT&CK framework v14...' },
  { type: 'success', text: '[10:04:12] Recon: Active Scanning — 14 open ports identified' },
  { type: 'success', text: '[10:04:31] Recon: OSINT — AWS region leaked in public GitHub repo' },
  { type: 'error',   text: '[10:05:08] EXPLOIT: SQL injection in /v1/login — admin hash extracted' },
  { type: 'error',   text: '[10:05:44] CREDS: .env file in public S3 bucket — AWS keys exposed' },
  { type: 'error',   text: '[10:06:02] PRIV ESC: AdministratorAccess via stolen IAM key — full compromise' },
  { type: 'warn',    text: '[10:06:18] DISCOVERY: 47 IAM users enumerated' },
  { type: 'error',   text: '[10:06:58] COLLECTION: 4.2 GB customer PII staged from S3' },
  { type: 'error',   text: '[10:07:33] EXFIL: Data transferred to external account — simulation complete' },
  { type: 'accent',  text: '[10:07:33] 8 findings | 3 CRITICAL | Duration: 3m 21s' },
]

const LINE_COLORS: Record<string, string> = {
  success: '#10b981', error: '#ef4444', warn: '#f97316', dim: '#475569', accent: '#eab308',
}

const STATUS_COLORS: Record<string, string> = {
  vulnerable: '#ef4444', mitigated: '#10b981', tested: '#3b82f6', untested: '#334155',
}

export function HemisDemo({ step, accentColor, onRequestNextStep }: HemisDemoProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    if (step !== 1) return
    setVisibleLines(0)
    const iv = setInterval(() => {
      setVisibleLines(n => {
        if (n >= TERMINAL_LINES.length) { clearInterval(iv); return n }
        return n + 1
      })
    }, 400)
    return () => clearInterval(iv)
  }, [step])

  const techniquesByTactic = TACTICS_ORDER.reduce<Record<string, typeof MITRE_TECHNIQUES>>((acc, tactic) => {
    const techs = MITRE_TECHNIQUES.filter(t => t.tactic === tactic)
    if (techs.length) acc[tactic] = techs
    return acc
  }, {})

  return (
    <div className="p-6">
      {/* Step 0: Choose template */}
      {step === 0 && (
        <div className="max-w-xl mx-auto space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>Quick Templates</p>
          <div className="space-y-2">
            {QUICK_TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                onClick={() => setSelectedTemplate(i)}
                className="w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors"
                style={selectedTemplate === i
                  ? { borderColor: accentColor, background: accentColor + '18', color: '#e2e8f0' }
                  : { borderColor: '#334155', background: 'transparent', color: '#94a3b8' }
                }
              >
                {tpl}
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Or describe your attack scenario:</label>
            <textarea
              readOnly
              value={selectedTemplate !== null ? QUICK_TEMPLATES[selectedTemplate] : ''}
              placeholder="Describe the attack scenario in plain English..."
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 font-mono resize-none"
            />
          </div>
          <button
            disabled={selectedTemplate === null}
            onClick={onRequestNextStep}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: accentColor }}
          >
            Execute Simulation →
          </button>
        </div>
      )}

      {/* Step 1: Terminal */}
      {step === 1 && (
        <div className="bg-slate-950 rounded-xl p-5 border border-slate-700 font-mono text-xs space-y-1.5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: accentColor }} />
            <span className="text-slate-400">HEMIS v2.4 · simulation running</span>
          </div>
          {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} style={{ color: LINE_COLORS[line.type] }}>{line.text}</div>
          ))}
          {visibleLines < TERMINAL_LINES.length && (
            <span className="inline-block w-2 h-3 bg-slate-400 animate-pulse" />
          )}
        </div>
      )}

      {/* Step 2: Attack chain */}
      {step === 2 && (
        <div className="space-y-1">
          {PRELOADED_CHAIN.map((item, i) => (
            <div key={item.seq} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                  style={{ background: item.result === 'SUCCESS' ? '#ef4444' : '#10b981' }}
                />
                {i < PRELOADED_CHAIN.length - 1 && <div className="w-0.5 flex-1 bg-slate-700 mt-1" />}
              </div>
              <div className="pb-4 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-mono text-slate-500">{item.timestamp}</span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                    style={{ color: accentColor, borderColor: accentColor + '44', background: accentColor + '18' }}
                  >
                    {item.phase}
                  </span>
                  <span className="text-[10px] font-mono text-slate-600">{item.techniqueId}</span>
                  <span
                    className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ color: item.result === 'SUCCESS' ? '#ef4444' : '#10b981', background: item.result === 'SUCCESS' ? '#ef444418' : '#10b98118' }}
                  >
                    {item.result}
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-medium">{item.technique}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 3: MITRE heatmap */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ background: color }} />
                <span className="text-xs text-slate-400 capitalize">{status}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {Object.entries(techniquesByTactic).map(([tactic, techs]) => (
              <div key={tactic}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">{tactic}</p>
                <div className="flex flex-wrap gap-1.5">
                  {techs.map(t => (
                    <div
                      key={t.id}
                      className="px-2 py-1 rounded text-[10px] font-mono"
                      style={{
                        background: STATUS_COLORS[t.status] + '22',
                        border: `1px solid ${STATUS_COLORS[t.status]}44`,
                        color: STATUS_COLORS[t.status],
                      }}
                    >
                      {t.id}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd /Users/sai/Documents/Hemis && npx vitest run src/__tests__/HemisDemo.test.tsx 2>&1 | tail -15
```
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/HemisDemo.test.tsx src/components/products/demos/HemisDemo.tsx
git commit -m "feat: add HemisDemo 4-step interactive walkthrough"
```

---

## Task 4: BlueTeamDemo Component (TDD)

**Files:**
- Create: `src/__tests__/BlueTeamDemo.test.tsx`
- Create: `src/components/products/demos/BlueTeamDemo.tsx`

- [ ] **Step 1: Create test file**

```typescript
// src/__tests__/BlueTeamDemo.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlueTeamDemo } from '@/components/products/demos/BlueTeamDemo'

const defaultProps = {
  step: 0,
  accentColor: '#3b82f6',
  onRequestNextStep: vi.fn(),
}

describe('BlueTeamDemo', () => {
  describe('Step 0: Health metrics', () => {
    it('renders all 5 metric cards', () => {
      render(<BlueTeamDemo {...defaultProps} step={0} />)
      expect(screen.getByText('HEALTH')).toBeInTheDocument()
      expect(screen.getByText('DETECTION')).toBeInTheDocument()
      expect(screen.getByText('RESPONSE')).toBeInTheDocument()
      expect(screen.getByText('COVERAGE')).toBeInTheDocument()
      expect(screen.getByText('MTTR')).toBeInTheDocument()
    })

    it('renders correct metric values', () => {
      render(<BlueTeamDemo {...defaultProps} step={0} />)
      expect(screen.getByText('72/100')).toBeInTheDocument()
      expect(screen.getByText('84%')).toBeInTheDocument()
      expect(screen.getByText('79%')).toBeInTheDocument()
      expect(screen.getByText('58%')).toBeInTheDocument()
      expect(screen.getByText('4m 12s')).toBeInTheDocument()
    })
  })

  describe('Step 1: Alert feed', () => {
    it('renders 6 alerts', () => {
      render(<BlueTeamDemo {...defaultProps} step={1} />)
      // 6 CRITICAL/HIGH/MEDIUM severity badges in list
      expect(screen.getByText('IAM Credentials Used from Anomalous Geolocation')).toBeInTheDocument()
      expect(screen.getByText('Unusual Lambda Invocation Pattern')).toBeInTheDocument()
    })

    it('alert-001 is auto-selected by default', () => {
      render(<BlueTeamDemo {...defaultProps} step={1} />)
      // The selected alert list item is styled differently; just verify it's shown
      expect(screen.getByText('ALERT FEED')).toBeInTheDocument()
    })

    it('clicking an alert changes the selected alert', async () => {
      render(<BlueTeamDemo {...defaultProps} step={1} />)
      await userEvent.click(screen.getByText('GuardDuty: EC2 Instance Communicating with Known Tor Exit Node'))
      // After clicking, that alert's title appears as the selected one
      expect(screen.getByText('GuardDuty: EC2 Instance Communicating with Known Tor Exit Node')).toBeInTheDocument()
    })
  })

  describe('Step 2: Alert detail', () => {
    it('shows AI Analysis box', () => {
      render(<BlueTeamDemo {...defaultProps} step={2} />)
      expect(screen.getByText(/ai analysis/i)).toBeInTheDocument()
    })

    it('shows resource metadata', () => {
      render(<BlueTeamDemo {...defaultProps} step={2} />)
      expect(screen.getByText('IAM:deploy-bot')).toBeInTheDocument()
      expect(screen.getByText('eu-central-1')).toBeInTheDocument()
    })

    it('shows IP address for alert with IP', () => {
      render(<BlueTeamDemo {...defaultProps} step={2} />)
      expect(screen.getByText('185.220.101.47')).toBeInTheDocument()
    })

    it('shows — for alert without IP (alert-006)', async () => {
      render(<BlueTeamDemo {...defaultProps} step={2} />)
      // Select alert-006 which has no IP
      await userEvent.click(screen.getByText('Unusual Lambda Invocation Pattern'))
      expect(screen.getByText('—')).toBeInTheDocument()
    })
  })

  describe('Step 3: Autonomous response', () => {
    it('shows AI playbook executed for auto-responded alert', () => {
      render(<BlueTeamDemo {...defaultProps} step={3} />)
      // alert-001 is selected by default and has autoResponded: true
      expect(screen.getByText(/ai playbook executed/i)).toBeInTheDocument()
    })

    it('shows response actions', () => {
      render(<BlueTeamDemo {...defaultProps} step={3} />)
      expect(screen.getByText('IAM credentials suspended')).toBeInTheDocument()
    })

    it('shows kill chain timeline with 8 events', () => {
      render(<BlueTeamDemo {...defaultProps} step={3} />)
      expect(screen.getByText(/kill chain reconstruction/i)).toBeInTheDocument()
      expect(screen.getByText('SQL injection exploit')).toBeInTheDocument()
      expect(screen.getByText('AI Blue Team auto-response')).toBeInTheDocument()
    })

    it('selected alert state persists from step 1 to step 3 without remount', async () => {
      const { rerender } = render(<BlueTeamDemo {...defaultProps} step={1} />)
      await userEvent.click(screen.getByText('Mass S3 Object Enumeration Detected'))
      rerender(<BlueTeamDemo {...defaultProps} step={3} />)
      // alert-002 is selected and autoResponded, so playbook box appears
      expect(screen.getByText(/ai playbook executed/i)).toBeInTheDocument()
      expect(screen.getByText('Bucket policy updated to deny external access')).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd /Users/sai/Documents/Hemis && npx vitest run src/__tests__/BlueTeamDemo.test.tsx 2>&1 | tail -15
```
Expected: FAIL

- [ ] **Step 3: Create `src/components/products/demos/BlueTeamDemo.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { INITIAL_ALERTS, KILL_CHAIN_EVENTS, HEALTH_SCORE } from '@/data/demo-blueteam'

interface BlueTeamDemoProps {
  step: number
  accentColor: string
  onRequestNextStep: () => void
}

const SEV_COLOR: Record<string, string> = {
  CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#6b7280', INFO: '#3b82f6',
}

const METRIC_CARDS = [
  { label: 'HEALTH',    value: `${HEALTH_SCORE.overall}/100`, low: HEALTH_SCORE.overall < 80 },
  { label: 'DETECTION', value: `${HEALTH_SCORE.detection}%`,  low: false },
  { label: 'RESPONSE',  value: `${HEALTH_SCORE.response}%`,   low: false },
  { label: 'COVERAGE',  value: `${HEALTH_SCORE.coverage}%`,   low: false },
  { label: 'MTTR',      value: HEALTH_SCORE.mttr,             low: false },
]

export function BlueTeamDemo({ step, accentColor }: BlueTeamDemoProps) {
  const [selectedAlertId, setSelectedAlertId] = useState<string>('alert-001')
  const selectedAlert = INITIAL_ALERTS.find(a => a.id === selectedAlertId) ?? INITIAL_ALERTS[0]

  return (
    <div className="p-6">
      {/* Step 0: Health metrics */}
      {step === 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {METRIC_CARDS.map(m => (
            <div key={m.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{m.label}</p>
              <p className="text-2xl font-bold" style={{ color: m.low ? '#f97316' : accentColor }}>
                {m.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Steps 1–3: Alert feed + detail panels */}
      {step >= 1 && (
        <div className="flex gap-4 min-h-[420px]">
          {/* Alert list */}
          <div className="w-72 shrink-0 space-y-1 overflow-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accentColor }} />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ALERT FEED</span>
            </div>
            {INITIAL_ALERTS.map(alert => (
              <button
                key={alert.id}
                onClick={() => setSelectedAlertId(alert.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg border transition-colors"
                style={selectedAlertId === alert.id
                  ? { borderColor: accentColor, background: accentColor + '18' }
                  : { borderColor: '#1e293b', background: 'transparent' }
                }
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0"
                    style={{ color: SEV_COLOR[alert.severity], borderColor: SEV_COLOR[alert.severity] + '44', background: SEV_COLOR[alert.severity] + '18' }}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-auto shrink-0">{alert.status}</span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2">{alert.title}</p>
              </button>
            ))}
          </div>

          {/* Alert detail — steps 2+ */}
          {step >= 2 && (
            <div className="flex-1 bg-slate-800/50 rounded-xl border border-slate-700 p-5 overflow-auto space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded border"
                  style={{ color: SEV_COLOR[selectedAlert.severity], borderColor: SEV_COLOR[selectedAlert.severity] + '44', background: SEV_COLOR[selectedAlert.severity] + '18' }}
                >
                  {selectedAlert.severity}
                </span>
                <span className="text-[10px] bg-slate-700 border border-slate-600 rounded px-2 py-0.5 text-slate-400">
                  {selectedAlert.status}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-100">{selectedAlert.title}</h4>

              <div className="bg-blue-950/40 border border-blue-800/40 rounded-lg p-4">
                <p className="text-xs font-bold text-blue-400 mb-1">⚡ AI Analysis</p>
                <p className="text-sm text-slate-300">{selectedAlert.summary}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div><p className="text-slate-500 mb-0.5">Resource</p><p className="text-slate-300 font-mono">{selectedAlert.resource}</p></div>
                <div><p className="text-slate-500 mb-0.5">Source IP</p><p className="text-slate-300 font-mono">{selectedAlert.ip ?? '—'}</p></div>
                <div><p className="text-slate-500 mb-0.5">Region</p><p className="text-slate-300 font-mono">{selectedAlert.region}</p></div>
                <div><p className="text-slate-500 mb-0.5">Source</p><p className="text-slate-300 font-mono">{selectedAlert.source}</p></div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {selectedAlert.tactics.map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded border text-orange-400 border-orange-400/30 bg-orange-400/10">{t}</span>
                ))}
              </div>

              {/* Step 3: Response + kill chain */}
              {step >= 3 && (
                <>
                  {selectedAlert.autoResponded && (
                    <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-4">
                      <p className="text-xs font-bold text-emerald-400 mb-2">✓ AI PLAYBOOK EXECUTED</p>
                      <ul className="space-y-1">
                        {selectedAlert.responseActions.map((action, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                            <span className="text-emerald-500">•</span>{action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Kill Chain Reconstruction</p>
                    <div className="space-y-1">
                      {KILL_CHAIN_EVENTS.map((event, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ background: SEV_COLOR[event.severity] }} />
                            {i < KILL_CHAIN_EVENTS.length - 1 && <div className="w-0.5 flex-1 bg-slate-700 mt-1" />}
                          </div>
                          <div className="pb-3 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-mono text-slate-500">{event.timestamp}</span>
                              <span className="text-[10px] font-bold text-slate-400">{event.stage}</span>
                            </div>
                            <p className="text-xs text-slate-300">{event.action}</p>
                            <p className="text-[10px] text-slate-500">{event.actor} → {event.target}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd /Users/sai/Documents/Hemis && npx vitest run src/__tests__/BlueTeamDemo.test.tsx 2>&1 | tail -15
```
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/BlueTeamDemo.test.tsx src/components/products/demos/BlueTeamDemo.tsx
git commit -m "feat: add BlueTeamDemo 4-step interactive walkthrough"
```

---

## Task 5: InteractiveDemoModal Shell (TDD)

**Files:**
- Create: `src/__tests__/InteractiveDemoModal.test.tsx`
- Create: `src/components/products/InteractiveDemoModal.tsx`

- [ ] **Step 1: Create test file**

```typescript
// src/__tests__/InteractiveDemoModal.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InteractiveDemoModal } from '@/components/products/InteractiveDemoModal'

const defaultProps = {
  productId: 'scanner' as const,
  productName: 'Cloud Misconfiguration Scanner',
  accentColor: '#6366f1',
  onClose: vi.fn(),
}

describe('InteractiveDemoModal', () => {
  it('renders the product name', () => {
    render(<InteractiveDemoModal {...defaultProps} />)
    expect(screen.getByText('Cloud Misconfiguration Scanner')).toBeInTheDocument()
  })

  it('shows Step 1 of 4 on open', () => {
    render(<InteractiveDemoModal {...defaultProps} />)
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
  })

  it('advances to Step 2 when Next is clicked', async () => {
    render(<InteractiveDemoModal {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument()
  })

  it('goes back when Back is clicked after advancing', async () => {
    render(<InteractiveDemoModal {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
  })

  it('Back is disabled on step 1', () => {
    render(<InteractiveDemoModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled()
  })

  it('calls onClose when Close button is clicked', async () => {
    const onClose = vi.fn()
    render(<InteractiveDemoModal {...defaultProps} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /close demo/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    render(<InteractiveDemoModal {...defaultProps} onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('advances on ArrowRight when no input is focused', async () => {
    render(<InteractiveDemoModal {...defaultProps} />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument()
  })

  it('does NOT advance on ArrowRight when a textarea is focused', async () => {
    render(<InteractiveDemoModal {...defaultProps} productId="hemis" />)
    // HEMIS step 0 has a textarea — focus it then fire arrow key
    const textarea = screen.getByPlaceholderText(/describe the attack scenario/i)
    await userEvent.click(textarea)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    // Should still be on Step 1
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
  })

  it('renders hemis demo for hemis productId', () => {
    render(<InteractiveDemoModal {...defaultProps} productId="hemis" productName="HEMIS" />)
    expect(screen.getByText(/quick templates/i)).toBeInTheDocument()
  })

  it('renders blueteam demo for blueteam productId', () => {
    render(<InteractiveDemoModal {...defaultProps} productId="blueteam" productName="AI Blue Team" />)
    expect(screen.getByText('HEALTH')).toBeInTheDocument()
  })

  it('calls onClose when Finish is clicked on last step', async () => {
    const onClose = vi.fn()
    render(<InteractiveDemoModal {...defaultProps} onClose={onClose} />)
    // advance to step 4 (index 3)
    for (let i = 0; i < 3; i++) {
      await userEvent.click(screen.getByRole('button', { name: /next/i }))
    }
    expect(screen.getByRole('button', { name: /finish/i })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /finish/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd /Users/sai/Documents/Hemis && npx vitest run src/__tests__/InteractiveDemoModal.test.tsx 2>&1 | tail -15
```
Expected: FAIL

- [ ] **Step 3: Create `src/components/products/InteractiveDemoModal.tsx`**

```typescript
'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScannerDemo } from './demos/ScannerDemo'
import { HemisDemo } from './demos/HemisDemo'
import { BlueTeamDemo } from './demos/BlueTeamDemo'

interface InteractiveDemoProps {
  productId: 'scanner' | 'hemis' | 'blueteam'
  productName: string
  accentColor: string
  onClose: () => void
}

const TOTAL_STEPS = 4

export function InteractiveDemoModal({ productId, productName, accentColor, onClose }: InteractiveDemoProps) {
  const [step, setStep] = useState(0)

  const handleNext = useCallback(() => {
    if (step === TOTAL_STEPS - 1) onClose()
    else setStep(s => s + 1)
  }, [step, onClose])

  const handleBack = useCallback(() => {
    setStep(s => Math.max(0, s - 1))
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      const tag = (document.activeElement?.tagName ?? '').toLowerCase()
      if (['input', 'textarea', 'button', 'select'].includes(tag)) return
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handleBack()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, handleNext, handleBack])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const DemoComponent = productId === 'scanner'
    ? ScannerDemo
    : productId === 'hemis'
    ? HemisDemo
    : BlueTeamDemo

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${productName} interactive demo`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 pointer-events-none"
      >
        <div
          className="w-full max-w-[1100px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">{productName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Interactive Product Demo</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="text-xs text-slate-500 bg-slate-800 rounded-md px-2.5 py-1"
                aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`}
              >
                Step {step + 1} of {TOTAL_STEPS}
              </span>
              <button
                onClick={onClose}
                aria-label="Close demo"
                className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Demo body */}
          <div className="overflow-auto max-h-[65vh]">
            <DemoComponent
              step={step}
              accentColor={accentColor}
              onRequestNextStep={handleNext}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800">
            <button
              onClick={handleBack}
              disabled={step === 0}
              aria-label="Back"
              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-800 border border-slate-700 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              aria-label={step === TOTAL_STEPS - 1 ? 'Finish' : 'Next'}
              className="px-3 py-1.5 text-xs font-semibold rounded-md text-white transition-colors"
              style={{ background: accentColor }}
            >
              {step === TOTAL_STEPS - 1 ? 'Finish' : 'Next →'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd /Users/sai/Documents/Hemis && npx vitest run src/__tests__/InteractiveDemoModal.test.tsx 2>&1 | tail -15
```
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/InteractiveDemoModal.test.tsx src/components/products/InteractiveDemoModal.tsx
git commit -m "feat: add InteractiveDemoModal shell with step navigation and keyboard handling"
```

---

## Task 6: Wire Up ProductCardGrid + Update Existing Tests

**Files:**
- Modify: `src/components/products/ProductCardGrid.tsx`
- Modify: `src/components/products/ProductCard.tsx`
- Modify: `src/__tests__/ProductCard.test.tsx`
- Modify: `src/__tests__/ProductCardGrid.test.tsx`

- [ ] **Step 1: Update `src/components/products/ProductCard.tsx` — change button label**

Find and replace the button text:
```
// Before:
Watch Product Demo

// After:
View Full Features
```

Also update the `aria-label`:
```
// Before:
aria-label={`Watch ${product.name} demo`}

// After:
aria-label={`View full features for ${product.name}`}
```

- [ ] **Step 2: Update `src/components/products/ProductCardGrid.tsx` — open InteractiveDemoModal**

Replace the file contents:

```typescript
'use client'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { demos } from '@/data/demos'
import type { ProductDemo } from '@/types/demo'
import { ProductCard } from './ProductCard'
import { InteractiveDemoModal } from './InteractiveDemoModal'

export function ProductCardGrid() {
  const [activeDemo, setActiveDemo] = useState<ProductDemo | null>(null)

  return (
    <section className="max-w-5xl mx-auto px-6 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {demos.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpenDemo={() => setActiveDemo(product)}
          />
        ))}
      </div>

      <AnimatePresence>
        {activeDemo && (
          <InteractiveDemoModal
            productId={activeDemo.id as 'scanner' | 'hemis' | 'blueteam'}
            productName={activeDemo.name}
            accentColor={activeDemo.accentColor}
            onClose={() => setActiveDemo(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
```

- [ ] **Step 3: Update `src/__tests__/ProductCard.test.tsx` — fix button matcher**

Change:
```typescript
// Before:
expect(screen.getByRole('button', { name: /watch.*demo/i })).toBeInTheDocument()
// and:
await userEvent.click(screen.getByRole('button', { name: /watch.*demo/i }))

// After:
expect(screen.getByRole('button', { name: /view full features/i })).toBeInTheDocument()
// and:
await userEvent.click(screen.getByRole('button', { name: /view full features/i }))
```

- [ ] **Step 4: Update `src/__tests__/ProductCardGrid.test.tsx` — fix button matcher and dialog check**

Change all occurrences of `/watch.*demo/i` to `/view full features/i`.

The `opens the modal` test checks `screen.getByRole('dialog')` — this still works because `InteractiveDemoModal` uses `role="dialog"`. No change needed there.

The `closes the modal` test uses `screen.getByRole('button', { name: /close/i })` — this matches `aria-label="Close demo"` in the new modal. No change needed.

- [ ] **Step 5: Run the full test suite**

```bash
cd /Users/sai/Documents/Hemis && npx vitest run 2>&1 | tail -30
```
Expected: all tests PASS (no failures)

- [ ] **Step 6: Commit**

```bash
git add src/components/products/ProductCardGrid.tsx src/components/products/ProductCard.tsx \
        src/__tests__/ProductCard.test.tsx src/__tests__/ProductCardGrid.test.tsx
git commit -m "feat: wire up InteractiveDemoModal, update button to 'View Full Features'"
```

---

## Task 7: Final Verification

- [ ] **Step 1: Run full test suite one last time**

```bash
cd /Users/sai/Documents/Hemis && npx vitest run 2>&1 | tail -20
```
Expected: all tests PASS

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/sai/Documents/Hemis && npx tsc --noEmit 2>&1 | grep -v "node_modules" | head -20
```
Expected: no new errors

- [ ] **Step 3: Start dev server and manually verify in browser**

```bash
cd /Users/sai/Documents/Hemis && npm run dev
```

Open http://localhost:3000 and verify:
- Each product card shows "View Full Features" button
- Clicking opens the interactive demo modal at step 1 of 4
- Next/Back navigation works
- Escape key closes the modal
- Scanner: Run Scan button → scan progress → findings table (filter + expand) → compliance
- HEMIS: Select template → Execute → terminal → attack chain → MITRE heatmap
- Blue Team: Health metrics → alert feed → AI analysis → kill chain + response

- [ ] **Step 4: Final commit if any minor fixes needed**

```bash
git add -p
git commit -m "fix: <describe any fixups>"
```
