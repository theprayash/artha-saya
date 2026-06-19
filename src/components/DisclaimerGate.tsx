'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

const STORAGE_KEY = 'artha-sage_disclaimer_v1'

export default function DisclaimerGate({ children }: { children: React.ReactNode }) {
  const [accepted, setAccepted] = useState<boolean | null>(null)

  useEffect(() => {
    setAccepted(localStorage.getItem(STORAGE_KEY) === 'true')
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setAccepted(true)
  }

  if (accepted === null) return null

  return (
    <>
      {children}
      {!accepted && (
        <div
          className="fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-6"
          style={{ background: 'color-mix(in srgb, var(--bg) 60%, #000 40%)' }}
        >
          <div
            className="max-w-lg w-full rounded-2xl p-5 sm:p-8"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <AlertTriangle size={18} className="text-amber-400" />
              </div>
              <div>
                <h2 className="font-display font-black text-lg leading-tight" style={{ color: 'var(--text)' }}>
                  लगानी जोखिम सूचना
                </h2>
                <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-faint)' }}>
                  Investment Risk Disclaimer · Read before entering
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-3 text-sm leading-relaxed mb-8" style={{ color: 'var(--text-muted)' }}>
              <p>
                <span className="font-semibold" style={{ color: 'var(--text)' }}>Artha Sage is for educational purposes only.</span>{' '}
                This site does not provide financial, investment, legal, or tax advice of any kind.
              </p>
              <p>
                All articles, market data, and analyses are intended solely to help readers{' '}
                <span style={{ color: 'var(--text)' }}>understand the share market</span>.
                They should not be used as the basis for any investment decision.
              </p>
              <p>
                Share market investments involve risk. Past performance does not guarantee future results.
                You may lose part or all of your invested capital.
              </p>
              <p>
                Always consult a{' '}
                <span style={{ color: 'var(--text)' }}>licensed financial advisor</span>{' '}
                before investing. By continuing, you confirm you understand this disclaimer.
              </p>
            </div>

            <div className="border-t mb-6" style={{ borderColor: 'var(--border)' }} />

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-accent font-display font-black">◆</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-faint)' }}>Artha Sage</span>
              </div>
              <button
                onClick={accept}
                className="px-6 py-2.5 bg-accent text-black font-semibold text-sm rounded-lg hover:bg-[#b08838] transition-colors"
              >
                I Understand, Enter →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
