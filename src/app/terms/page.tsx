import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import { AlertTriangle } from 'lucide-react'

const SECTIONS = [
  {
    title: 'Not Financial Advice',
    body: `Everything published on Artha Sage — including articles, analyses, market commentary, data,
    and any other content — is provided solely for general informational and educational purposes.
    Nothing on this website constitutes or should be construed as financial, investment, legal,
    tax, or accounting advice.`,
  },
  {
    title: 'No Guarantee of Accuracy',
    body: `While we make every effort to ensure accuracy, we do not guarantee that any information on
    Artha Sage is complete, accurate, up-to-date, or suitable for any particular purpose.
    Do not rely on any content here for active trading decisions.`,
  },
  {
    title: 'Past Performance',
    body: `Any references to historical returns, past performance, or results of stocks,
    mutual funds, IPOs, or any other financial instrument do not guarantee future results.
    Share market investments involve risk, including the possible loss of your entire capital.`,
  },
  {
    title: 'Consult a Professional',
    body: `Readers are strongly encouraged to conduct their own due diligence and consult a
    licensed investment advisor or financial professional before making any investment decision.
    Your financial situation, risk appetite, and investment goals are unique — what works for one
    person may not work for another.`,
  },
  {
    title: 'No Liability',
    body: `Artha Sage, its authors, editors, and affiliates shall not be held liable for any losses,
    damages, or expenses — direct, indirect, or consequential — arising from your use of this
    website or any reliance on its content. Use of this site is entirely at your own risk.`,
  },
  {
    title: 'Changes to This Disclaimer',
    body: `We reserve the right to update or modify this disclaimer at any time without prior notice.
    Continued use of Artha Sage after any changes constitutes your acceptance of the updated terms.`,
  },
]

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-5 py-10 md:py-16">

        {/* Header */}
        <div className="flex items-start gap-3 md:gap-4 mb-8 md:mb-12">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mt-1"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <AlertTriangle size={22} className="text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--text-faint)' }}>Legal</p>
            <h1 className="font-display font-black text-4xl md:text-5xl leading-tight" style={{ color: 'var(--text)' }}>
              Terms &amp; Disclaimer
            </h1>
            <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
              Please read carefully before using Artha Sage.
            </p>
          </div>
        </div>

        {/* Key banner */}
        <div
          className="p-5 rounded-xl mb-12"
          style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <p className="text-amber-400 font-semibold text-sm mb-1">
            Artha Sage is an educational platform — not a registered financial advisor.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            All content is for learning about the share market only. Nothing here is a recommendation
            to buy, sell, or hold any security. Always consult a qualified professional.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {SECTIONS.map((section, i) => (
            <div key={section.title}>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-accent font-mono text-xs shrink-0">0{i + 1}</span>
                <h2 className="font-display font-black text-xl" style={{ color: 'var(--text)' }}>{section.title}</h2>
              </div>
              <p className="text-sm leading-relaxed pl-8" style={{ color: 'var(--text-muted)' }}>
                {section.body.trim()}
              </p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-16 pt-10 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
            Questions about this disclaimer?{' '}
            <a href="mailto:hello@artha-sage.com.np" className="text-accent hover:underline">
              hello@artha-sage.com.np
            </a>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
