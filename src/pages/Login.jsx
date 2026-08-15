import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff, Lock, Shield, Scale, User, CheckCircle } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let droplets = []
    let animId

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth
      canvas.height = canvas.parentElement.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 50; i++) {
      droplets.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.4 + 0.1,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      droplets.forEach(d => {
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(128, 0, 32, ${d.opacity})`
        ctx.fill()
        d.y += d.speed
        if (d.y > canvas.height + 10) {
          d.y = -10
          d.x = Math.random() * canvas.width
        }
      })
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: dbError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single()

    if (dbError || !data) {
      setError('Invalid username or password.')
      setLoading(false)
      return
    }

    setLoggingIn(true)
    localStorage.setItem('otmsr_user', JSON.stringify(data))
    setTimeout(() => navigate('/dashboard'), 1000)
  }

  return (
    <div className="min-h-screen flex">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(255,255,255,0)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 30px rgba(255,255,255,0.3)); }
        }
        @keyframes textGlow {
          0%, 100% { opacity: 0.5; letter-spacing: 2px; }
          50% { opacity: 1; letter-spacing: 4px; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .anim-fade-1 { animation: fadeSlideUp 0.6s ease forwards; opacity: 0; }
        .anim-fade-2 { animation: fadeSlideUp 0.6s ease 0.15s forwards; opacity: 0; }
        .anim-fade-3 { animation: fadeSlideUp 0.6s ease 0.3s forwards; opacity: 0; }
        .anim-fade-4 { animation: fadeSlideUp 0.6s ease 0.45s forwards; opacity: 0; }
        .anim-fade-5 { animation: fadeSlideUp 0.6s ease 0.6s forwards; opacity: 0; }
        .anim-shake { animation: shake 0.4s ease-in-out; }
        .anim-spin { animation: spin 0.8s linear infinite; }
        .anim-logo-pulse { animation: logoPulse 3s ease-in-out infinite; }
        .anim-text-glow { animation: textGlow 3s ease-in-out infinite; }
        .anim-modal-in { animation: modalIn 0.3s ease forwards; }
        
        .privacy-modal::-webkit-scrollbar { display: none; }
        .privacy-modal { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* Data Privacy Modal */}
      {showPrivacy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div className="privacy-modal anim-modal-in" style={{ background: '#fff', borderRadius: '20px', padding: 0, maxWidth: '700px', width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.35)' }}>
            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg, #800000 0%, #4A0000 100%)', padding: '2rem 2rem 1.5rem', textAlign: 'center', borderRadius: '20px 20px 0 0' }}>
              <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <Shield size={28} className="text-white" />
              </div>
              <h2 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>Data Privacy & Intellectual Property</h2>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem' }}>One Top Medical Systems Resources OPC</p>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem 2rem', fontSize: '0.75rem', color: '#525252', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '1rem', textAlign: 'center' }}>
                In compliance with <strong>RA 10173</strong> and <strong>RA 8293</strong>, this portal and all its contents are protected.
              </p>
              
              {/* RA 10173 */}
              <div style={{ background: '#FDF7F7', border: '1px solid #F5D0D0', borderRadius: '12px', padding: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Lock size={16} className="text-maroon" />
                  <p style={{ fontWeight: 700, color: '#800000', fontSize: '0.8rem' }}>Data Privacy Act of 2012 (RA 10173)</p>
                </div>
                <p><strong>Information We Collect:</strong></p>
                <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.5rem', fontSize: '0.7rem' }}>
                  <li>Full name, contact number, and email address</li>
                  <li>Work schedules and activity reports</li>
                  <li>Login credentials and usage data</li>
                </ul>
                <p><strong>How We Use Your Information:</strong></p>
                <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.5rem', fontSize: '0.7rem' }}>
                  <li>Internal company operations and work management</li>
                  <li>Communication of announcements and notifications</li>
                  <li>Performance tracking and reporting</li>
                </ul>
                <p style={{ marginBottom: '0.5rem', fontSize: '0.7rem' }}>
                  We do not share, sell, or disclose your personal information to unauthorized third parties.
                </p>
                <p style={{ marginBottom: 0, fontWeight: 700, color: '#B91C1C', fontSize: '0.7rem', background: '#FEF2F2', padding: '0.5rem', borderRadius: '8px' }}>
                  ⚠️ PENALTY: 1 to 7 years imprisonment | ₱100,000 to ₱5,000,000 fine
                </p>
              </div>
              
              {/* RA 8293 */}
              <div style={{ background: '#FFF8E1', border: '1px solid #FDE68A', borderRadius: '12px', padding: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Scale size={16} className="text-amber-600" />
                  <p style={{ fontWeight: 700, color: '#B45309', fontSize: '0.8rem' }}>Intellectual Property Code (RA 8293)</p>
                </div>
                <p style={{ marginBottom: '0.5rem', fontSize: '0.7rem' }}>
                  All content within this portal, including source code, UI designs, trade secrets, business processes, and company data are the exclusive property of <strong>One Top Medical Systems Resources OPC</strong>.
                </p>
                <p style={{ marginBottom: 0, fontWeight: 700, color: '#B45309', fontSize: '0.7rem', background: '#FFFDF0', padding: '0.5rem', borderRadius: '8px' }}>
                  ⚠️ PENALTY: 1 to 9 years imprisonment | ₱50,000 to ₱1,500,000 fine
                </p>
              </div>
              
              {/* User Responsibilities */}
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <User size={16} className="text-blue-600" />
                  <p style={{ fontWeight: 700, color: '#1D4ED8', fontSize: '0.8rem' }}>User Responsibilities</p>
                </div>
                <ul style={{ paddingLeft: '1.25rem', marginBottom: 0, fontSize: '0.7rem' }}>
                  <li>Do not share your login credentials</li>
                  <li>Do not copy or distribute portal content without authorization</li>
                  <li>Do not access data outside your authorized scope</li>
                  <li>Report security concerns immediately</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 2rem 1.5rem', borderTop: '1px solid #f0f0f0' }}>
              <button 
                onClick={() => setShowPrivacy(false)} 
                style={{ width: '100%', padding: '0.85rem', background: '#800000', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#4A0000'}
                onMouseLeave={e => e.currentTarget.style.background = '#800000'}
              >
                <CheckCircle size={18} /> I Agree and Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {loggingIn && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-6">
          <div className="w-14 h-14 border-[4px] border-gray-100 border-t-[#800020] rounded-full anim-spin" />
          <p className="text-lg font-bold text-[#800020] anim-fade-1">Signing in...</p>
        </div>
      )}

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#800020] opacity-40 z-10" />
        <img src="/images/bg.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-20 flex flex-col items-center justify-center w-full gap-8 anim-fade-1">
          <img src="/images/logo.png" alt="OTMSR" className="h-56 anim-logo-pulse" />
          <p className="text-base text-white/60 tracking-widest uppercase anim-text-glow">Engineering & Services Department</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className={`flex-1 flex items-center justify-center px-6 py-12 bg-white relative overflow-hidden transition-all duration-700 ${loggingIn ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        <div className="w-full max-w-sm relative z-10">
          <div className="lg:hidden text-center mb-10 anim-fade-1">
            <img src="/images/logo.png" alt="OTMSR" className="h-20 mx-auto mb-3 anim-logo-pulse" />
            <p className="text-xs text-gray-500 mt-1 tracking-widest uppercase">Engineering & Services</p>
          </div>

          <div className="anim-fade-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h2>
            <p className="text-sm text-gray-500 mb-8">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="anim-fade-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="yourname.onetop"
                className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-[#800020] outline-none transition-all bg-white/80 backdrop-blur-sm" />
            </div>

            <div className="anim-fade-3">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••"
                  className="w-full px-4 py-3 pr-10 text-sm border-2 border-gray-200 rounded-xl focus:border-[#800020] outline-none transition-all bg-white/80 backdrop-blur-sm" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm anim-shake">
                <p className="text-red-600">{error}</p>
                <p className="text-xs text-red-400 mt-1">
                  Can't login? Contact Engr. Brian Ezekiel Batalon at brianezekiel.onetop@gmail.com
                </p>
              </div>
            )}

            <div className="anim-fade-4">
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-[#800020] hover:bg-[#5C0018] text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm hover:shadow-xl hover:shadow-[#800020]/25 active:scale-[0.97]">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full anim-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8 anim-fade-5">One Top Medical Systems Resources OPC</p>
        </div>
      </div>
    </div>
  )
}