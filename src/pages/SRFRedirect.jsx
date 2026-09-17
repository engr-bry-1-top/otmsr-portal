import { useState, useEffect } from 'react'
import { ArrowRight, ExternalLink, FileText, Shield, Zap, Printer } from 'lucide-react'

const GAS_URL = 'https://script.google.com/macros/s/AKfycbyUGbUFGoC_Nwcvyez63ejM_Bgy2l8MRSp1Q20l6ZZMHNyMW41A_hUnbii0QMJHFCpJxg/exec'

export default function SRFRedirect() {
  const [phase, setPhase] = useState('in')
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setPhase('ready'), 50)
    return () => clearTimeout(t)
  }, [])

  const handleProceed = () => {
    setRedirecting(true)
    setTimeout(() => {
      window.open(GAS_URL, '_blank', 'noopener,noreferrer')
      // Give visual feedback and reset the button so it can be clicked again
      setTimeout(() => setRedirecting(false), 1200)
    }, 380)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <style>{`
        @keyframes srf-fade-in {
          0% { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes srf-scale-in {
          0% { opacity: 0; transform: scale(0.7); filter: blur(8px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes srf-pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(128, 0, 32, 0.35); }
          50% { box-shadow: 0 0 0 16px rgba(128, 0, 32, 0); }
        }
        @keyframes srf-orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes srf-dot {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes srf-draw-line {
          0% { width: 0; opacity: 0; }
          100% { width: 100%; opacity: 1; }
        }
        .srf-fade-1 { animation: srf-fade-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both; }
        .srf-fade-2 { animation: srf-fade-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.20s both; }
        .srf-fade-3 { animation: srf-fade-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both; }
        .srf-fade-4 { animation: srf-fade-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.50s both; }
        .srf-fade-5 { animation: srf-fade-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.65s both; }
        .srf-scale { animation: srf-scale-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .srf-glow { animation: srf-pulse-glow 2.4s ease-in-out infinite; }
        .srf-line { animation: srf-draw-line 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.6s both; }
        .srf-orbit { animation: srf-orbit 24s linear infinite; }
        .srf-dot-1 { animation: srf-dot 2.2s ease-in-out infinite; }
        .srf-dot-2 { animation: srf-dot 2.2s ease-in-out 0.4s infinite; }
        .srf-dot-3 { animation: srf-dot 2.2s ease-in-out 0.8s infinite; }
      `}</style>

      {/* Hero card */}
      <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Decorative top strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-maroon via-maroon-light to-navy srf-line" />

        {/* Background orbs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-maroon/5 pointer-events-none srf-orbit" />
        <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-navy/5 pointer-events-none srf-orbit" style={{ animationDirection: 'reverse' }} />

        <div className="relative p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-maroon to-maroon-dark text-white shadow-lg srf-scale srf-glow mb-6">
            <FileText size={40} strokeWidth={2} />
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 srf-fade-1">
            Service Request Form
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-2 srf-fade-2">
            Engineering &amp; Services Department
          </p>

          <div className="flex justify-center mt-4 srf-fade-2">
            <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-maroon to-transparent" />
          </div>

          <p className="text-xs md:text-sm text-gray-400 mt-4 max-w-md mx-auto leading-relaxed srf-fade-3">
            Track submissions, assign engineers, capture signatures, print, and email — all from
            the dedicated SRF Dashboard.
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-6 srf-fade-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-maroon/5 text-maroon text-xs font-medium border border-maroon/10">
              <Zap size={12} /> Live sync
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy/5 text-navy text-xs font-medium border border-navy/10">
              <Printer size={12} /> Print &amp; email
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
              <Shield size={12} /> Signature capture
            </span>
          </div>

          {/* CTA */}
          <div className="mt-8 srf-fade-5">
            <button
              onClick={handleProceed}
              disabled={redirecting}
              className={`group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-md
                ${redirecting
                  ? 'bg-maroon/80 text-white cursor-wait'
                  : 'bg-maroon text-white hover:bg-maroon-dark hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                }`}
            >
              {redirecting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Opening Dashboard…
                </>
              ) : (
                <>
                  Proceed to SRF Dashboard
                  <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>

          <p className="text-[10px] text-gray-400 mt-4 inline-flex items-center gap-1 srf-fade-5">
            <ExternalLink size={10} /> Opens in a new tab
          </p>
        </div>

        {/* Bottom animated dots */}
        <div className="flex justify-center gap-2 pb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-maroon/40 srf-dot-1" />
          <span className="w-1.5 h-1.5 rounded-full bg-maroon/40 srf-dot-2" />
          <span className="w-1.5 h-1.5 rounded-full bg-maroon/40 srf-dot-3" />
        </div>
      </div>

      {/* Info footnote */}
      <p className="text-center text-xs text-gray-400 mt-6 srf-fade-5">
        All SRFs are viewed and edited inside the SRF Dashboard. This portal only shows quick links.
      </p>
    </div>
  )
}