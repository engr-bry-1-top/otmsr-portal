import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Check, X, Maximize2 } from 'lucide-react'

const SERVICE_TYPES = ['Repair / Troubleshooting', 'Training', 'Preventive Maintenance', 'Inspection (Warehouse)', 'Inspection (On-site)']

const DROPLETS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 3) % 100}%`,
  size: `${10 + ((i * 7) % 20)}px`,
  delay: `${(i * 1.23) % 9}s`,
  duration: `${8 + ((i * 3) % 8)}s`,
  opacity: 0.055 + ((i % 5) * 0.012),
}))

export default function ServiceForm() {
  const inlineCanvasRef = useRef(null)
  const modalCanvasRef = useRef(null)
  const modalContainerRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [signatureFullscreen, setSignatureFullscreen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isPortrait, setIsPortrait] = useState(false)
  const [requestedBy, setRequestedBy] = useState('')
  const [location, setLocation] = useState('')
  const [dateOfActivity, setDateOfActivity] = useState('')
  const [serviceTypes, setServiceTypes] = useState([])
  const [otherService, setOtherService] = useState('')
  const [details, setDetails] = useState('')
  const [signatureData, setSignatureData] = useState(null)

  const updateDeviceState = useCallback(() => {
    const mobile = window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    const portrait = window.matchMedia('(orientation: portrait)').matches
    setIsMobile(mobile)
    setIsPortrait(portrait)
  }, [])

  useEffect(() => {
    updateDeviceState()
    window.addEventListener('resize', updateDeviceState)
    window.addEventListener('orientationchange', updateDeviceState)
    return () => {
      window.removeEventListener('resize', updateDeviceState)
      window.removeEventListener('orientationchange', updateDeviceState)
    }
  }, [updateDeviceState])

  const getCanvas = () => signatureFullscreen ? modalCanvasRef.current : inlineCanvasRef.current

  const getEventPoint = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches && e.touches.length ? e.touches[0] : null
    const clientX = touch?.clientX ?? e.clientX
    const clientY = touch?.clientY ?? e.clientY
    
    const visualX = (clientX - rect.left) / rect.width
    const visualY = (clientY - rect.top) / rect.height
    
    if (signatureFullscreen && isMobile && isPortrait) {
      return {
        x: visualY * canvas.width,
        y: (1 - visualX) * canvas.height
      }
    }
    
    return {
      x: visualX * canvas.width,
      y: visualY * canvas.height
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    const canvas = getCanvas()
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { x, y } = getEventPoint(e, canvas)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.strokeStyle = '#1E3A5F'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = getCanvas()
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { x, y } = getEventPoint(e, canvas)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = getCanvas()
    if (!canvas) return
    setSignatureData(canvas.toDataURL('image/png'))
  }

  const clearSignature = () => {
    const canvas = getCanvas()
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureData(null)
  }

  const restoreSignatureToInline = (dataUrl) => {
    const inlineCanvas = inlineCanvasRef.current
    if (!inlineCanvas || !dataUrl) return
    const img = new Image()
    img.onload = () => {
      const ctx = inlineCanvas.getContext('2d')
      ctx.clearRect(0, 0, inlineCanvas.width, inlineCanvas.height)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, inlineCanvas.width, inlineCanvas.height)
      
      const x = Math.max(0, (inlineCanvas.width - img.width) / 2)
      const y = Math.max(0, (inlineCanvas.height - img.height) / 2)
      
      ctx.drawImage(img, x, y)
    }
    img.src = dataUrl
  }

  const resizeModalCanvas = useCallback(() => {
    const canvas = modalCanvasRef.current
    const container = modalContainerRef.current
    if (!canvas || !container) return
    const rect = container.getBoundingClientRect()
    const width = Math.max(1, Math.floor(rect.width))
    const height = Math.max(1, Math.floor(rect.height))
    let existingData = null
    if (canvas.width > 0 && canvas.height > 0) {
      try {
        existingData = canvas.toDataURL('image/png')
      } catch {
        existingData = signatureData
      }
    } else {
      existingData = signatureData
    }
    canvas.width = width
    canvas.height = height
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    if (existingData) {
      const img = new Image()
      img.onload = () => {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height)
        const drawWidth = img.width * scale
        const drawHeight = img.height * scale
        const x = (canvas.width - drawWidth) / 2
        const y = (canvas.height - drawHeight) / 2
        ctx.drawImage(img, x, y, drawWidth, drawHeight)
      }
      img.src = existingData
    }
  }, [signatureData])

  const openFullscreen = () => setSignatureFullscreen(true)

  useEffect(() => {
    if (!signatureFullscreen) return
    const timer = setTimeout(() => resizeModalCanvas(), 80)
    window.addEventListener('resize', resizeModalCanvas)
    window.addEventListener('orientationchange', resizeModalCanvas)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', resizeModalCanvas)
      window.removeEventListener('orientationchange', resizeModalCanvas)
    }
  }, [signatureFullscreen, resizeModalCanvas])

  const closeFullscreen = () => {
    const modalCanvas = modalCanvasRef.current
    if (modalCanvas) {
      const dataUrl = modalCanvas.toDataURL('image/png')
      setSignatureData(dataUrl)
      
      const inlineCanvas = inlineCanvasRef.current
      if (inlineCanvas) {
        inlineCanvas.width = modalCanvas.width
        inlineCanvas.height = modalCanvas.height
        
        const ctx = inlineCanvas.getContext('2d')
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
        }
        img.src = dataUrl
      }
    }
    setSignatureFullscreen(false)
  }

  const toggleService = (type) => {
    setServiceTypes(prev => prev.includes(type) ? prev.filter(item => item !== type) : [...prev, type])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!requestedBy || !location) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setError('')
    const { error: dbError } = await supabase.from('service_requests').insert({
      requested_by: requestedBy,
      signature_data: signatureData,
      location,
      date_of_activity: dateOfActivity,
      service_types: serviceTypes.filter(type => type !== 'Others'),
      other_service: serviceTypes.includes('Others') ? otherService : '',
      details,
    })
    if (dbError) {
      setError('Submission failed.')
      setSubmitting(false)
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-maroon/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-maroon" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Request Submitted</h2>
          <p className="text-gray-500 text-sm mb-6">Your service request has been sent to our Engineering & Services team.</p>
          <button onClick={() => { setSubmitted(false); window.location.reload() }} className="w-full py-3 bg-maroon text-white rounded-xl font-semibold hover:bg-maroon-dark text-sm">
            Submit Another Request
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-maroon/[0.035]" />
        {DROPLETS.map(drop => (
          <span key={drop.id} className="service-droplet" style={{ left: drop.left, width: drop.size, height: drop.size, animationDelay: drop.delay, animationDuration: drop.duration, opacity: drop.opacity }} />
        ))}
      </div>

      <div className="relative z-10 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <img src="/images/logo.png" alt="OTMSR" className="h-7 md:h-9" />
          <div className="text-right text-[10px] md:text-xs text-gray-400">
            <p>TEL: 63-2-5012247</p>
            <p>onetop.dohengineer@gmail.com</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6 md:py-10">
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-maroon/10 shadow-sm mb-3">
            <span className="w-2 h-2 rounded-full bg-maroon animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-maroon/70 font-semibold">Engineering & Services</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-maroon">Service Request Form</h1>
          <p className="text-gray-500 text-sm mt-1">One Top Medical Systems Resources OPC — Engineering & Services Department</p>
        </div>

        <form onSubmit={handleSubmit} className="relative bg-white/95 backdrop-blur-md rounded-2xl border border-white shadow-xl shadow-gray-200/40 p-4 md:p-8 space-y-4 md:space-y-5">
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-maroon/70 to-transparent rounded-full" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-[11px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name <span className="text-red-500">*</span></label>
              <input type="text" value={requestedBy} onChange={e => setRequestedBy(e.target.value)} required placeholder="Enter your full name" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/10 focus:border-maroon outline-none bg-gray-50/80 focus:bg-white box-border transition-all" />
            </div>
            <div>
              <label className="block text-[11px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Location <span className="text-red-500">*</span></label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} required placeholder="Address / Area" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/10 focus:border-maroon outline-none bg-gray-50/80 focus:bg-white box-border transition-all" />
            </div>
            <div>
              <label className="block text-[11px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date of Activity</label>
              <input 
                type="date" 
                value={dateOfActivity} 
                onChange={e => setDateOfActivity(e.target.value)} 
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/10 focus:border-maroon outline-none bg-gray-50/80 focus:bg-white box-border transition-all"
                style={{ minWidth: 0, maxWidth: '100%', WebkitAppearance: 'none' }}
              />
            </div>
            <div>
              <label className="block text-[11px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date</label>
              <input 
                type="date" 
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/10 focus:border-maroon outline-none bg-gray-50/80 focus:bg-white box-border transition-all"
                style={{ minWidth: 0, maxWidth: '100%', WebkitAppearance: 'none' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Type of Services</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SERVICE_TYPES.map(type => (
                <label key={type} onClick={() => toggleService(type)} className={`service-option ${serviceTypes.includes(type) ? 'service-option-selected' : 'service-option-default'}`}>
                  <div className={`service-checkbox ${serviceTypes.includes(type) ? 'service-checkbox-selected' : 'service-checkbox-default'}`}>
                    {serviceTypes.includes(type) && <Check size={10} className="text-white" />}
                  </div>
                  <span>{type}</span>
                </label>
              ))}
              <label onClick={() => toggleService('Others')} className={`service-option ${serviceTypes.includes('Others') ? 'service-option-selected' : 'service-option-default'}`}>
                <div className={`service-checkbox ${serviceTypes.includes('Others') ? 'service-checkbox-selected' : 'service-checkbox-default'}`}>
                  {serviceTypes.includes('Others') && <Check size={10} className="text-white" />}
                </div>
                <span className="flex-shrink-0">Others:</span>
                <input type="text" value={otherService} onChange={e => { e.stopPropagation(); setOtherService(e.target.value) }} onClick={e => e.stopPropagation()} placeholder="Please specify" className="others-input" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[11px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Brief Details of Request / Concern</label>
            <textarea value={details} onChange={e => setDetails(e.target.value)} rows={4} placeholder="Describe the issue or request in detail..." className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/10 focus:border-maroon outline-none bg-gray-50/80 focus:bg-white resize-none box-border transition-all" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider">Signature</label>
              <button type="button" onClick={openFullscreen} className="flex items-center gap-1 px-3 py-1.5 bg-navy text-white text-xs font-medium rounded-lg hover:bg-navy-light transition-colors shadow-sm">
                <Maximize2 size={14} /> Enlarge
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50">
              <canvas ref={inlineCanvasRef} width={1000} height={280} className="w-full h-[220px] md:h-[250px] touch-none cursor-crosshair block"
                onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-400">Sign using mouse or touch</span>
              <div className="flex items-center gap-3">
                {signatureData && (
                  <span className="text-xs text-maroon font-medium flex items-center gap-1">
                    <Check size={12} /> Captured
                  </span>
                )}
                <button type="button" onClick={clearSignature} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear</button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50/90 rounded-xl p-3 md:p-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold">JV</div>
              <div>
                <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider font-semibold">Approved By</p>
                <p className="text-sm font-semibold text-gray-800">Joshua Rydell C. Velasco</p>
                <p className="text-xs text-gray-400">Supervisor, Engineering & Services</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex items-start gap-2">
              <span className="text-amber-500 text-sm">⚠️</span>
              <p className="text-xs text-amber-800 font-medium">All requests must be received by the engineering department at least 5 days in advance before the scheduled activity.</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600 flex items-center gap-2">
              <X size={16} /> {error}
            </div>
          )}

          <button type="submit" disabled={submitting} className="w-full py-3 bg-maroon hover:bg-maroon-dark text-white font-semibold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm uppercase tracking-wider shadow-sm hover:shadow-md">
            {submitting ? 'Submitting...' : 'Submit Service Request'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          One Top Medical Systems Resources OPC • TEL: 63-2-5012247 • onetop.dohengineer@gmail.com • www.onetop.ph
        </p>
      </div>

      {signatureFullscreen && (
        <div className="signature-overlay" style={{ touchAction: 'none' }}>
          <div className={isMobile && isPortrait ? 'signature-workspace signature-workspace-mobile' : 'signature-workspace signature-workspace-desktop'}>
            <div className="signature-toolbar">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-maroon animate-pulse" />
                <h3 className="text-base font-semibold text-gray-900">Draw Your Signature</h3>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={clearSignature} className="px-3 py-1.5 text-sm text-red-500 font-medium hover:bg-red-50 rounded-lg transition-colors">Clear</button>
                <button type="button" onClick={closeFullscreen} className="px-4 py-2 bg-maroon text-white text-sm font-medium rounded-xl hover:bg-maroon-dark transition-colors">Done</button>
              </div>
            </div>
            <div ref={modalContainerRef} className="signature-canvas-container">
              <canvas ref={modalCanvasRef} className="signature-canvas"
                onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .service-droplet {
          position: absolute; bottom: -90px; display: block; border-radius: 50% 50% 50% 0;
          background: linear-gradient(135deg, rgba(128, 0, 32, 0.14), rgba(128, 0, 32, 0.035));
          border: 1px solid rgba(128, 0, 32, 0.07); transform: rotate(-45deg);
          animation: serviceDropletFloat linear infinite; will-change: transform, bottom, opacity;
        }
        @keyframes serviceDropletFloat {
          0% { bottom: -90px; transform: rotate(-45deg) translateX(0) scale(0.75); opacity: 0; }
          10% { opacity: 1; }
          45% { transform: rotate(-45deg) translateX(35px) scale(1); }
          75% { transform: rotate(-45deg) translateX(-25px) scale(1.06); }
          90% { opacity: 0.4; }
          100% { bottom: 115%; transform: rotate(-45deg) translateX(25px) scale(1.12); opacity: 0; }
        }
        .service-option {
          display: flex; align-items: center; gap: 8px; width: 100%; height: 42px; min-height: 42px;
          box-sizing: border-box; padding: 0 12px; border-radius: 12px; border: 1px solid #e5e7eb;
          cursor: pointer; font-size: 14px; line-height: 1; transition: all 0.2s ease;
        }
        .service-option-default { background: rgba(249, 250, 251, 0.82); color: #4b5563; }
        .service-option-default:hover { background: white; border-color: #d1d5db; }
        .service-option-selected { background: rgba(128, 0, 32, 0.05); color: #800020; border-color: #800020; }
        .service-checkbox {
          width: 16px; height: 16px; min-width: 16px; border-radius: 4px; border-width: 2px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-sizing: border-box;
        }
        .service-checkbox-default { background: white; border-color: #d1d5db; }
        .service-checkbox-selected { background: #800020; border-color: #800020; }
        .others-input {
          flex: 1; min-width: 0; height: 26px; padding: 0 4px; border: 0; border-bottom: 1px solid #d1d5db;
          background: transparent; outline: none; font-size: 14px; line-height: 26px; box-sizing: border-box; color: #374151;
        }
        .others-input:focus { border-bottom-color: #800020; }
        .others-input::placeholder { color: #9ca3af; }
        .signature-overlay { position: fixed; inset: 0; z-index: 9999; width: 100vw; height: 100dvh; background: #ffffff; overflow: hidden; }
        .signature-workspace-desktop {
          position: absolute; width: min(1200px, 94vw); height: min(760px, 90dvh); top: 50%; left: 50%;
          transform: translate(-50%, -50%); display: flex; flex-direction: column; background: white;
          border: 1px solid #e5e7eb; border-radius: 18px; overflow: hidden; box-shadow: 0 25px 80px rgba(15, 23, 42, 0.18);
        }
        .signature-workspace-mobile {
          position: fixed; width: 100dvh; height: 100dvw; top: 0; left: 0;
          transform: rotate(90deg) translateY(-100%); transform-origin: top left;
          display: flex; flex-direction: column; background: white; overflow: hidden;
        }
        .signature-toolbar {
          height: 58px; min-height: 58px; flex-shrink: 0; display: flex; align-items: center;
          justify-content: space-between; padding: 0 16px; background: rgba(255, 255, 255, 0.98); border-bottom: 1px solid #e5e7eb;
        }
        .signature-canvas-container {
          flex: 1; min-height: 0; padding: 10px; background: linear-gradient(135deg, #f3f4f6, #f8fafc);
        }
        .signature-canvas {
          display: block; width: 100%; height: 100%; background: white; border: 2px dashed #cbd5e1;
          border-radius: 12px; cursor: crosshair; touch-action: none; user-select: none;
          -webkit-user-select: none; -webkit-touch-callout: none;
        }
        @media (max-width: 768px) {
          .service-option { height: 42px; min-height: 42px; padding: 0 10px; font-size: 13px; }
          .others-input { font-size: 13px; }
          .signature-toolbar { height: 50px; min-height: 50px; padding: 0 10px; }
          .signature-canvas-container { padding: 6px; }
          .signature-canvas { border-radius: 8px; }
          
          input[type="date"] {
            min-width: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            font-size: 13px !important;
            -webkit-appearance: none !important;
            appearance: none !important;
          }
          
          input[type="date"]::-webkit-date-and-time-value {
            text-align: left;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .service-droplet { animation: none !important; }
        }
      `}</style>
    </div>
  )
}