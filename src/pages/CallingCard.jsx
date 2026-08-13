import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, Download, Maximize2, X } from 'lucide-react'

export default function CallingCard() {
  const navigate = useNavigate()
  const frontRef = useRef(null)
  const backRef = useRef(null)
  const [user, setUser] = useState(null)
  const [flipped, setFlipped] = useState(false)
  const [enlarged, setEnlarged] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('otmsr_user')
    if (!stored) { navigate('/'); return }
    setUser(JSON.parse(stored))
  }, [navigate])

  const downloadCard = async () => {
    const { toPng } = await import('html-to-image')
    const f = await toPng(frontRef.current, { quality: 1, pixelRatio: 4 })
    const fl = document.createElement('a'); fl.download = `${user.username}_front.png`; fl.href = f; fl.click()
    await new Promise(r => setTimeout(r, 300))
    const be = backRef.current; const ot = be.style.transform; be.style.transform = 'rotateY(0deg)'
    await new Promise(r => setTimeout(r, 100))
    const b = await toPng(be, { quality: 1, pixelRatio: 4 }); be.style.transform = ot
    const bl = document.createElement('a'); bl.download = `${user.username}_back.png`; bl.href = b; bl.click()
  }

  if (!user) return null

  const CardFront = ({ cr, w, h }) => {
    const s = w / 340
    return (
      <div 
        ref={cr} 
        className="absolute top-0 left-0 bg-white border border-gray-200 overflow-hidden" 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: `${14*s}px`, 
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(0deg)',
          WebkitTransform: 'rotateY(0deg)',
          zIndex: 2,
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 340 210" preserveAspectRatio="none">
          <defs><linearGradient id="gf" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="rgba(128,0,32,0.06)"/><stop offset="100%" stopColor="rgba(30,58,95,0.06)"/></linearGradient></defs>
          <rect width="340" height="210" fill="url(#gf)"/>
          <circle cx="300" cy="30" r="80" fill="rgba(128,0,32,0.04)"/>
          <circle cx="40" cy="180" r="60" fill="rgba(30,58,95,0.04)"/>
        </svg>
        <div className="relative z-10 h-full flex flex-col justify-between" style={{ padding: `${14*s}px ${18*s}px` }}>
          <div className="flex items-center" style={{ gap: `${8*s}px` }}>
            <img src="/images/logo.png" alt="" style={{ height: `${28*s}px` }} />
            <span className="text-maroon font-bold uppercase tracking-tight" style={{ fontSize: `${7*s}px`, maxWidth: `${180*s}px`, lineHeight: 1.3 }}>ONE TOP MEDICAL SYSTEMS RESOURCES OPC</span>
          </div>
          <div>
            <h2 className="font-bold text-navy" style={{ fontSize: `${17*s}px`, margin: 0 }}>{user.full_name}</h2>
            <p className="text-gray-500 uppercase tracking-wider" style={{ fontSize: `${10*s}px`, margin: 0 }}>{user.role}</p>
          </div>
          <div style={{ fontSize: `${11*s}px` }} className="text-gray-600">
            <p className="m-0">Tel: (02) 7501 247 / (02) 7799 6805</p>
            <p className="m-0">Email: engineering_services@onetopresources.com</p>
            <p className="text-maroon font-semibold mt-1" style={{ fontSize: `${9*s}px`, margin: 0 }}>www.onetopresources.com</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-maroon via-maroon-light to-navy" style={{ height: `${3*s}px` }} />
      </div>
    )
  }

  const CardBack = ({ cr, w, h }) => {
    const s = w / 340
    const qr = 110 * s
    return (
      <div 
        ref={cr} 
        className="absolute top-0 left-0 bg-white border border-gray-200 overflow-hidden" 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: `${14*s}px`, 
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          WebkitTransform: 'rotateY(180deg)',
          zIndex: 1,
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 340 210" preserveAspectRatio="none">
          <rect width="340" height="210" fill="rgba(30,58,95,0.03)"/>
          <circle cx="300" cy="180" r="90" fill="rgba(128,0,32,0.03)"/>
        </svg>
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center" style={{ padding: `${10*s}px ${16*s}px`, gap: `${3*s}px` }}>
          <p className="text-gray-400 font-semibold uppercase overflow-hidden text-ellipsis max-w-full" style={{ fontSize: `${4.5*s}px`, margin: 0, whiteSpace: 'nowrap' }}>
            LA Fratelli Bldg. 1, 7 Calderon St., Brgy. Marilag Project 4, Quezon City, Metro Manila, Philippines 1109
          </p>
          <p className="text-gray-400" style={{ fontSize: `${4.5*s}px`, margin: 0, whiteSpace: 'nowrap' }}>TEL: (02) 7501 247 / (02) 7799 6805</p>
          <div className="flex flex-col items-center" style={{ gap: `${3*s}px`, marginTop: `${2*s}px` }}>
            <img src="/images/qr.png" alt="" className="bg-white" style={{ width: `${qr}px`, height: `${qr}px`, borderRadius: `${8*s}px`, border: `${1.5*s}px solid #f0f0f0`, padding: `${3*s}px`, objectFit: 'contain' }} />
            <p className="text-maroon font-bold uppercase tracking-widest" style={{ fontSize: `${11*s}px`, margin: 0 }}>Scan Me</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-navy via-maroon to-maroon-light" style={{ height: `${3*s}px` }} />
      </div>
    )
  }

  if (enlarged) {
    const ew = Math.min(window.innerWidth - 24, 750)
    const eh = ew * (210 / 340)
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
        <button onClick={() => setEnlarged(false)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white"><X size={20} /></button>
        <div style={{ width: `${ew}px`, height: `${eh}px`, perspective: '1200px', WebkitPerspective: '1200px', maxWidth: '95vw' }}>
          <div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d', WebkitTransformStyle: 'preserve-3d', transition: 'transform 0.5s', WebkitTransition: 'transform 0.5s', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', WebkitTransform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
            <CardFront w={ew} h={eh} />
            <CardBack w={ew} h={eh} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setFlipped(!flipped)} className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl text-sm font-medium"><RefreshCw size={16} /> Flip</button>
          <button onClick={downloadCard} className="flex items-center gap-2 px-5 py-2.5 bg-maroon text-white rounded-xl text-sm font-medium"><Download size={16} /> Download</button>
        </div>
      </div>
    )
  }

  const cw = isMobile ? Math.min(window.innerWidth - 32, 360) : Math.min(window.innerWidth - 48, 400)
  const ch = cw * (210 / 340)

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Calling Card</h1>
        <p className="text-sm text-gray-500 mt-1">ATM-size digital business card</p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 md:gap-6">
        <div>
          <div style={{ width: `${cw}px`, height: `${ch}px`, margin: '0 auto 12px', perspective: '1200px', WebkitPerspective: '1200px', maxWidth: '100%' }}>
            <div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d', WebkitTransformStyle: 'preserve-3d', transition: 'transform 0.5s', WebkitTransition: 'transform 0.5s', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', WebkitTransform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
              <CardFront cr={frontRef} w={cw} h={ch} />
              <CardBack cr={backRef} w={cw} h={ch} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2" style={{ maxWidth: `${cw}px`, margin: '0 auto' }}>
            <button onClick={() => setFlipped(!flipped)} className="flex items-center justify-center gap-1 py-2 bg-navy text-white rounded-xl text-xs md:text-sm font-medium hover:bg-navy-light transition-colors"><RefreshCw size={14} /> Flip</button>
            <button onClick={() => setEnlarged(true)} className="flex items-center justify-center gap-1 py-2 bg-white text-maroon border-2 border-maroon rounded-xl text-xs md:text-sm font-medium hover:bg-maroon/5 transition-colors"><Maximize2 size={14} /> Enlarge</button>
            <button onClick={downloadCard} className="flex items-center justify-center gap-1 py-2 bg-maroon text-white rounded-xl text-xs md:text-sm font-medium hover:bg-maroon-dark transition-colors"><Download size={14} /> Download</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Card Information</h3>
          <div className="space-y-3 md:space-y-4">
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name</label><input type="text" value={user.full_name} disabled className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-100 text-gray-500 outline-none" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Role</label><input type="text" value={user.role} disabled className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-100 text-gray-500 outline-none" /></div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Company Contact (Fixed)</p>
              <p className="text-sm text-gray-700">Tel: (02) 7501 247 / (02) 7799 6805</p>
              <p className="text-sm text-gray-700 mt-1">Email: engineering_services@onetopresources.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}