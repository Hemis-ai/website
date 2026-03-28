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
