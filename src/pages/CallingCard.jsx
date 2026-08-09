import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, Download, Maximize2, X } from 'lucide-react'

export default function CallingCard() {
  const navigate = useNavigate()
  const frontRef = useRef(null)
  const backRef = useRef(null)
  const [user, setUser] = useState(null)
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [flipped, setFlipped] = useState(false)
  const [enlarged, setEnlarged] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('otmsr_user')
    if (!stored) { navigate('/'); return }
    const userData = JSON.parse(stored)
    setUser(userData)
    const saved = localStorage.getItem(`card_${userData.username}`)
    if (saved) { const c = JSON.parse(saved); setMobile(c.mobile || ''); setEmail(c.email || '') }
  }, [navigate])

  const handleSave = () => {
    if (!user) return
    localStorage.setItem(`card_${user.username}`, JSON.stringify({ mobile, email }))
  }

  const downloadCard = async () => {
    const { toPng } = await import('html-to-image')
    const f = await toPng(frontRef.current, { quality: 1, pixelRatio: 3 })
    const fl = document.createElement('a'); fl.download = `${user.username}_front.png`; fl.href = f; fl.click()
    await new Promise(r => setTimeout(r, 300))
    const be = backRef.current; const ot = be.style.transform; be.style.transform = 'rotateY(0deg)'
    await new Promise(r => setTimeout(r, 100))
    const b = await toPng(be, { quality: 1, pixelRatio: 3 }); be.style.transform = ot
    const bl = document.createElement('a'); bl.download = `${user.username}_back.png`; bl.href = b; bl.click()
  }

  if (!user) return null

  const CardFront = ({ cr, w }) => {
    const s = w / 340
    return (
      <div ref={cr} className="absolute inset-0 bg-white border border-gray-200 overflow-hidden" style={{ borderRadius: `${14*s}px`, backfaceVisibility: 'hidden' }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 340 210">
          <defs><linearGradient id="gf" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="rgba(128,0,32,0.06)"/><stop offset="100%" stopColor="rgba(30,58,95,0.06)"/></linearGradient></defs>
          <rect width="340" height="210" fill="url(#gf)"/><circle cx="300" cy="30" r="80" fill="rgba(128,0,32,0.04)"/><circle cx="40" cy="180" r="60" fill="rgba(30,58,95,0.04)"/>
        </svg>
        <div className="relative z-10 h-full flex flex-col justify-between" style={{ padding: `${14*s}px ${18*s}px` }}>
          <div className="flex items-center" style={{ gap: `${8*s}px` }}>
            <img src="/images/logo.png" alt="" style={{ height: `${28*s}px` }} />
            <span className="text-maroon font-bold uppercase tracking-tight" style={{ fontSize: `${7*s}px`, maxWidth: `${180*s}px`, lineHeight: 1.3 }}>ONE TOP MEDICAL SYSTEMS RESOURCES OPC</span>
          </div>
          <div>
            <h2 className="font-bold text-navy" style={{ fontSize: `${17*s}px` }}>{user.full_name}</h2>
            <p className="text-gray-500 uppercase tracking-wider" style={{ fontSize: `${10*s}px` }}>{user.role}</p>
          </div>
          <div style={{ fontSize: `${11*s}px` }} className="text-gray-600">
            {mobile && <p className="m-0">{mobile}</p>}
            {email && <p className="m-0">{email}</p>}
            <p className="text-maroon font-semibold mt-1" style={{ fontSize: `${9*s}px` }}>www.onetopresources.com</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-maroon via-maroon-light to-navy" style={{ height: `${3*s}px` }} />
        </div>
      </div>
    )
  }

  const CardBack = ({ cr, w }) => {
    const s = w / 340; const qr = 120 * s
    return (
      <div ref={cr} className="absolute inset-0 bg-white border border-gray-200 overflow-hidden flex items-center justify-center" style={{ borderRadius: `${14*s}px`, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 340 210">
          <rect width="340" height="210" fill="rgba(30,58,95,0.03)"/><circle cx="300" cy="180" r="90" fill="rgba(128,0,32,0.03)"/>
        </svg>
        <div className="relative z-10 w-full flex flex-col items-center justify-center text-center" style={{ padding: `${10*s}px ${16*s}px`, gap: `${4*s}px` }}>
          <p className="text-gray-400 font-semibold uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-full" style={{ fontSize: `${4.5*s}px` }}>
            LA Fratelli Bldg. 1, 7 Calderon St., Brgy. Marilag Project 4, Quezon City, Metro Manila, Philippines 1109
          </p>
          <p className="text-gray-400 whitespace-nowrap" style={{ fontSize: `${4.5*s}px` }}>TEL: 63-2-5012247 | onetop.dohengineer@gmail.com</p>
          <div className="flex flex-col items-center" style={{ gap: `${4*s}px` }}>
            <img src="/images/qr.png" alt="" className="bg-white" style={{ width: `${qr}px`, height: `${qr}px`, borderRadius: `${8*s}px`, border: `${2*s}px solid #f0f0f0`, padding: `${3*s}px` }} />
            <p className="text-maroon font-bold uppercase tracking-widest" style={{ fontSize: `${11*s}px` }}>Scan Me</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-navy via-maroon to-maroon-light" style={{ height: `${3*s}px` }} />
        </div>
      </div>
    )
  }

  if (enlarged) {
    const ew = Math.min(window.innerWidth - 32, 750); const eh = ew * (210 / 340)
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
        <button onClick={() => setEnlarged(false)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white"><X size={20} /></button>
        <div style={{ width: `${ew}px`, height: `${eh}px`, perspective: '1000px', maxWidth: '95vw' }}>
          <div className="w-full h-full relative transition-transform duration-500" style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
            <CardFront w={ew} /><CardBack w={ew} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setFlipped(!flipped)} className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl text-sm font-medium"><RefreshCw size={16} /> Flip</button>
          <button onClick={downloadCard} className="flex items-center gap-2 px-5 py-2.5 bg-maroon text-white rounded-xl text-sm font-medium"><Download size={16} /> Download</button>
        </div>
      </div>
    )
  }

  const cw = Math.min(window.innerWidth - 48, 400); const ch = cw * (210 / 340)

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Calling Card</h1>
        <p className="text-sm text-gray-500 mt-1">ATM-size digital business card</p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
        <div>
          <div style={{ width: `${cw}px`, height: `${ch}px`, margin: '0 auto 16px', perspective: '1000px', maxWidth: '100%' }}>
            <div className="w-full h-full relative transition-transform duration-500" style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
              <CardFront cr={frontRef} w={cw} />
              <CardBack cr={backRef} w={cw} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2" style={{ maxWidth: `${cw}px`, margin: '0 auto' }}>
            <button onClick={() => setFlipped(!flipped)} className="flex items-center justify-center gap-1 py-2 bg-navy text-white rounded-xl text-xs md:text-sm font-medium"><RefreshCw size={14} /> Flip</button>
            <button onClick={() => setEnlarged(true)} className="flex items-center justify-center gap-1 py-2 bg-white text-maroon border-2 border-maroon rounded-xl text-xs md:text-sm font-medium"><Maximize2 size={14} /> Enlarge</button>
            <button onClick={downloadCard} className="flex items-center justify-center gap-1 py-2 bg-maroon text-white rounded-xl text-xs md:text-sm font-medium"><Download size={14} /> Download</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Contact Details</h3>
          <div className="space-y-3 md:space-y-4">
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name</label><input type="text" value={user.full_name} disabled className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-100 text-gray-500 outline-none" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Role</label><input type="text" value={user.role} disabled className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-100 text-gray-500 outline-none" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Mobile Number</label><input type="text" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="+63 9XX XXX XXXX" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/10 focus:border-maroon outline-none bg-gray-50" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/10 focus:border-maroon outline-none bg-gray-50" /></div>
            <button onClick={handleSave} className="w-full py-2 bg-maroon text-white rounded-xl text-sm font-medium hover:bg-maroon-dark transition-colors">Save Card</button>
          </div>
        </div>
      </div>
    </div>
  )
}