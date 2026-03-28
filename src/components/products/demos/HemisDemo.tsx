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
