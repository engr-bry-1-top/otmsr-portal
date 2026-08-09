import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Check, X, Maximize2 } from 'lucide-react'

const SERVICE_TYPES = [
  'Repair / Troubleshooting',
  'Training',
  'Preventive Maintenance',
  'Inspection (Warehouse)',
  'Inspection (On-site)',
  'Others',
]

export default function ServiceForm() {
  const inlineCanvasRef = useRef(null)
  const modalCanvasRef = useRef(null)
  const canvasBgRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [signatureFullscreen, setSignatureFullscreen] = useState(false)

  const [requestedBy, setRequestedBy] = useState('')
  const [location, setLocation] = useState('')
  const [dateOfActivity, setDateOfActivity] = useState('')
  const [serviceTypes, setServiceTypes] = useState([])
  const [otherService, setOtherService] = useState('')
  const [details, setDetails] = useState('')
  const [signatureData, setSignatureData] = useState(null)

  // Animated background particles
  useEffect(() => {
    const canvas = canvasBgRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let particles = []
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.5 + 1,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.3 + 0.1,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(128, 0, 32, ${p.opacity})`
        ctx.fill()
        p.x += p.dx
        p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })
      // Draw lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(128, 0, 32, ${0.04 * (1 - dist / 120)})`
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const toggleService = (type) => {
    setServiceTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

  const getCanvas = () => signatureFullscreen ? modalCanvasRef.current : inlineCanvasRef.current

  const startDrawing = (e) => {
    setIsDrawing(true)
    const canvas = getCanvas(); if (!canvas) return
    const ctx = canvas.getContext('2d'); ctx.beginPath()
    const rect = canvas.getBoundingClientRect()
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing) return; e.preventDefault()
    const canvas = getCanvas(); if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
    ctx.lineTo(x, y); ctx.strokeStyle = '#1E3A5F'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = getCanvas()
    if (canvas) setSignatureData(canvas.toDataURL())
  }

  const clearSignature = () => {
    const canvas = getCanvas(); if (!canvas) return
    const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureData(null)
  }

  const openFullscreen = () => {
    setSignatureFullscreen(true)
    setTimeout(() => {
      if (signatureData && modalCanvasRef.current) {
        const ctx = modalCanvasRef.current.getContext('2d')
        const img = new Image()
        img.onload = () => ctx.drawImage(img, 0, 0, modalCanvasRef.current.width, modalCanvasRef.current.height)
        img.src = signatureData
      }
    }, 100)
  }

  const closeFullscreen = () => {
    if (modalCanvasRef.current) setSignatureData(modalCanvasRef.current.toDataURL())
    setSignatureFullscreen(false)
    setTimeout(() => {
      if (signatureData && inlineCanvasRef.current) {
        const ctx = inlineCanvasRef.current.getContext('2d')
        const img = new Image()
        img.onload = () => ctx.drawImage(img, 0, 0, inlineCanvasRef.current.width, inlineCanvasRef.current.height)
        img.src = signatureData
      }
    }, 100)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!requestedBy || !location) { setError('Please fill in all required fields.'); return }
    setSubmitting(true); setError('')
    const { error: dbError } = await supabase.from('service_requests').insert({
      requested_by: requestedBy, signature_data: signatureData, location,
      date_of_activity: dateOfActivity, service_types: serviceTypes.filter(t => t !== 'Others'),
      other_service: serviceTypes.includes('Others') ? otherService : '',
      details,
    })
    if (dbError) { setError('Submission failed.'); setSubmitting(false) }
    else setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-maroon/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-maroon" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Request Submitted</h2>
          <p className="text-gray-500 text-sm mb-6">Your service request has been sent to our Engineering & Services team.</p>
          <button onClick={() => { setSubmitted(false); window.location.reload() }}
            className="w-full py-3 bg-maroon text-white rounded-xl font-semibold hover:bg-maroon-dark transition-colors text-sm">
            Submit Another Request
          </button>
        </div>
      </div>
    )
  }

  const inputClass = "w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/10 focus:border-maroon outline-none transition-all bg-gray-50 focus:bg-white"
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"

  return (
    <div className="min-h-screen bg-white relative">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(128,0,32,0.2); }
          50% { box-shadow: 0 0 0 8px rgba(128,0,32,0); }
        }
        .anim-fade-1 { animation: fadeSlideUp 0.6s ease forwards; opacity: 0; }
        .anim-fade-2 { animation: fadeSlideUp 0.6s ease 0.15s forwards; opacity: 0; }
        .anim-fade-3 { animation: fadeSlideUp 0.6s ease 0.3s forwards; opacity: 0; }
        .anim-pulse-submit { animation: pulse 2s ease-in-out infinite; }
      `}</style>

      {/* Animated particle background */}
      <canvas ref={canvasBgRef} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />

      <div className="bg-white border-b border-gray-100 relative z-10">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <img src="/images/logo.png" alt="OTMSR" className="h-8 md:h-9" />
          <div className="text-right text-[10px] md:text-xs text-gray-400">
            <p>TEL: 63-2-5012247</p>
            <p>onetop.dohengineer@gmail.com</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-10 relative z-10">
        <div className="text-center mb-8 md:mb-10 anim-fade-1">
          <h1 className="text-xl md:text-2xl font-bold text-maroon">Service Request Form</h1>
          <p className="text-gray-500 text-sm mt-1">One Top Medical Systems Resources OPC — Engineering & Services Department</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-5 md:space-y-6 anim-fade-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
              <input type="text" value={requestedBy} onChange={e => setRequestedBy(e.target.value)} required placeholder="Enter your full name" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Location <span className="text-red-500">*</span></label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} required placeholder="Address / Area" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Date of Activity / Delivery</label>
              <input type="date" value={dateOfActivity} onChange={e => setDateOfActivity(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Type of Services</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SERVICE_TYPES.map(type => (
                <label key={type} onClick={() => toggleService(type)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all text-sm ${
                    serviceTypes.includes(type) ? 'border-maroon bg-maroon/5 text-maroon font-medium' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                  }`}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    serviceTypes.includes(type) ? 'bg-maroon border-maroon' : 'border-gray-300 bg-white'
                  }`}>
                    {serviceTypes.includes(type) && <Check size={12} className="text-white" />}
                  </div>
                  {type === 'Others' ? (
                    <>
                      Others:
                      <input type="text" value={otherService} onChange={e => setOtherService(e.target.value)} placeholder="Please specify"
                        onClick={e => e.stopPropagation()}
                        className="flex-1 px-3 py-1.5 border-0 border-b border-gray-300 focus:border-maroon bg-transparent outline-none text-sm" />
                    </>
                  ) : type}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Brief Details of Request / Concern</label>
            <textarea value={details} onChange={e => setDetails(e.target.value)} rows={4} placeholder="Describe the issue or request in detail..."
              className={`${inputClass} resize-none`} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelClass} style={{ marginBottom: 0 }}>Signature</label>
              <button type="button" onClick={openFullscreen}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-navy text-white text-xs font-medium rounded-lg hover:bg-navy-light transition-colors">
                <Maximize2 size={14} /> Enlarge
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50">
              <canvas ref={inlineCanvasRef} width={700} height={100} className="w-full touch-none cursor-crosshair"
                onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-400">Sign using mouse or touch</span>
              <div className="flex items-center gap-3">
                {signatureData && <span className="text-xs text-maroon font-medium flex items-center gap-1"><Check size={12} /> Captured</span>}
                <button type="button" onClick={clearSignature} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear</button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 md:p-5 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold">JV</div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Approved By</p>
                <p className="text-sm font-semibold text-gray-800">Joshua Rydell C. Velasco</p>
                <p className="text-xs text-gray-400">Supervisor, Engineering & Services</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 flex items-start gap-2">
              <span className="text-amber-500 text-sm">⚠️</span>
              <p className="text-xs text-amber-800 font-medium">All requests must be received by the engineering department at least 5 days in advance before the scheduled activity.</p>
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600 flex items-center gap-2"><X size={16} /> {error}</div>}

          <button type="submit" disabled={submitting}
            className="w-full py-3.5 bg-maroon hover:bg-maroon-dark text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm uppercase tracking-wider anim-pulse-submit hover:shadow-xl hover:shadow-maroon/25">
            {submitting ? 'Submitting...' : 'Submit Service Request'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-8 anim-fade-3">One Top Medical Systems Resources OPC • TEL: 63-2-5012247 • onetop.dohengineer@gmail.com • www.onetop.ph</p>
      </div>

      {signatureFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Draw Your Signature</h3>
              <button onClick={closeFullscreen} className="px-4 py-2 bg-maroon text-white text-sm font-medium rounded-xl">Done</button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50">
              <canvas ref={modalCanvasRef} width={900} height={350} className="w-full touch-none cursor-crosshair"
                onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
            </div>
            <div className="flex justify-between mt-3">
              <span className="text-xs text-gray-400">Sign using mouse or touch</span>
              <button onClick={clearSignature} className="text-sm text-red-500 hover:text-red-700 font-medium">Clear Signature</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}