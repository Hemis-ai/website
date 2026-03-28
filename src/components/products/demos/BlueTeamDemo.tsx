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
