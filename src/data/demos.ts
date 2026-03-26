import type { ProductDemo } from '@/types/demo'

export const demos: ProductDemo[] = [
  {
    id: 'scanner',
    name: 'Cloud Misconfiguration Scanner',
    accentColor: '#6366f1',
    steps: [
      {
        image: '/demos/scanner/step-1.png',
        stepTitle: 'Connect your AWS account',
        description: 'Link HemisX to your AWS environment in under 60 seconds using a read-only IAM role. No agent installation required.',
        tooltipPosition: 'right',
        hotspot: { x: 100, y: 80, width: 120, height: 32 },
      },
      {
        image: '/demos/scanner/step-2.png',
        stepTitle: 'Review critical findings',
        description: 'HemisX surfaces misconfigurations ranked by severity, mapped to SOC 2 and ISO 27001 controls.',
        tooltipPosition: 'left',
        hotspot: { x: 100, y: 80, width: 120, height: 32 },
      },
      {
        image: '/demos/scanner/step-3.png',
        stepTitle: 'One-click remediation',
        description: 'Apply the fix instantly. HemisX generates and applies the correct policy — no manual JSON editing needed.',
        tooltipPosition: 'left',
        hotspot: { x: 100, y: 80, width: 120, height: 32 },
      },
    ],
  },
  {
    id: 'hemis',
    name: 'HEMIS',
    accentColor: '#10b981',
    steps: [
      {
        image: '/demos/hemis/step-1.png',
        stepTitle: 'Define your attack scope',
        description: 'Describe the target in plain English. HEMIS maps it to the MITRE ATT&CK framework and selects relevant techniques.',
        tooltipPosition: 'right',
        hotspot: { x: 100, y: 80, width: 120, height: 32 },
      },
      {
        image: '/demos/hemis/step-2.png',
        stepTitle: 'Run the simulation',
        description: 'HEMIS launches a safe, non-destructive red team simulation against your own systems using AI-generated adversarial techniques.',
        tooltipPosition: 'bottom',
        hotspot: { x: 100, y: 80, width: 120, height: 32 },
      },
      {
        image: '/demos/hemis/step-3.png',
        stepTitle: 'Review your attack surface',
        description: 'See every exploited path ranked by risk. Each finding links to the MITRE technique and recommended remediation.',
        tooltipPosition: 'left',
        hotspot: { x: 100, y: 80, width: 120, height: 32 },
      },
    ],
  },
  {
    id: 'blueteam',
    name: 'AI Blue Team',
    accentColor: '#3b82f6',
    steps: [
      {
        image: '/demos/blueteam/step-1.png',
        stepTitle: 'Real-time threat monitoring',
        description: 'AI Blue Team ingests logs, alerts, and network events across your stack and correlates them in real time.',
        tooltipPosition: 'right',
        hotspot: { x: 100, y: 80, width: 120, height: 32 },
      },
      {
        image: '/demos/blueteam/step-2.png',
        stepTitle: 'Autonomous threat triage',
        description: 'When a threat is detected, the AI Blue Team classifies severity, traces the attack path, and recommends a response — in seconds.',
        tooltipPosition: 'left',
        hotspot: { x: 100, y: 80, width: 120, height: 32 },
      },
      {
        image: '/demos/blueteam/step-3.png',
        stepTitle: 'Autonomous response actions',
        description: 'Approve the suggested response or let it run automatically. Isolate hosts, revoke tokens, and block IPs without writing runbooks.',
        tooltipPosition: 'left',
        hotspot: { x: 100, y: 80, width: 120, height: 32 },
      },
    ],
  },
]
