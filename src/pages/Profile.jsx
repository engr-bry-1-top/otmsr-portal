import { useState, useEffect, useRef, useCallback } from 'react'
import { Upload, ZoomIn, ZoomOut, RotateCw, Trash2, User } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const [user, setUser] = useState(null)
  const [avatar, setAvatar] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef(null)
  const CANVAS_SIZE = 280

  useEffect(() => {
    const stored = localStorage.getItem('otmsr_user')
    if (!stored) return
    const userData = JSON.parse(stored)
    setUser(userData)
    supabase.from('profiles').select('avatar_url').eq('username', userData.username).single().then(({ data }) => { if (data?.avatar_url) setAvatar(data.avatar_url) })
  }, [])

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    ctx.save(); ctx.beginPath(); ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, Math.PI * 2); ctx.clip()
    ctx.fillStyle = '#f0f0f0'; ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    if (imageRef.current) {
      ctx.save(); ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2); ctx.rotate((rotation * Math.PI) / 180); ctx.scale(zoom, zoom); ctx.translate(-CANVAS_SIZE / 2, -CANVAS_SIZE / 2)
      const img = imageRef.current; const sc = Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height)
      ctx.drawImage(img, crop.x + (CANVAS_SIZE - img.width * sc) / 2, crop.y + (CANVAS_SIZE - img.height * sc) / 2, img.width * sc, img.height * sc)
      ctx.restore()
    }
    ctx.restore()
    ctx.save(); ctx.beginPath(); ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, Math.PI * 2); ctx.clip()
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1
    for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo((CANVAS_SIZE / 3) * i, 0); ctx.lineTo((CANVAS_SIZE / 3) * i, CANVAS_SIZE); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, (CANVAS_SIZE / 3) * i); ctx.lineTo(CANVAS_SIZE, (CANVAS_SIZE / 3) * i); ctx.stroke() }
    ctx.strokeStyle = '#800020'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 2, 0, Math.PI * 2); ctx.stroke(); ctx.restore()
  }, [crop, zoom, rotation])

  useEffect(() => { if (showEditor && imageRef.current) drawCanvas() }, [showEditor, crop, zoom, rotation, drawCanvas])

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]; if (!file) return; setError('')
    const reader = new FileReader()
    reader.onload = (ev) => { const img = new Image(); img.onload = () => { imageRef.current = img; setCrop({ x: 0, y: 0 }); setZoom(1); setRotation(0); setShowEditor(true) }; img.src = ev.target.result }
    reader.readAsDataURL(file)
  }

  const handleSaveAvatar = async () => {
    if (!canvasRef.current || !user) return; setUploading(true); setError('')
    const blob = await (await fetch(canvasRef.current.toDataURL('image/png'))).blob()
    const filePath = `avatars/${user.username}_${Date.now()}.png`
    if (avatar) { const old = avatar.split('/').pop(); if (old) await supabase.storage.from('avatars').remove([`avatars/${old}`]) }
    const { error: upErr } = await supabase.storage.from('avatars').upload(filePath, blob, { contentType: 'image/png', upsert: true })
    if (upErr) { setError('Upload failed'); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
    await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('username', user.username)
    setAvatar(urlData.publicUrl); setShowEditor(false); setSuccess(true); setTimeout(() => setSuccess(false), 2000); setUploading(false)
  }

  const handleRemove = async () => {
    if (!user) return
    if (avatar) { const old = avatar.split('/').pop(); if (old) await supabase.storage.from('avatars').remove([`avatars/${old}`]) }
    await supabase.from('profiles').update({ avatar_url: null }).eq('username', user.username)
    setAvatar(null); imageRef.current = null; setShowEditor(false)
  }

  if (!user) return null

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account</p>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
          <div className="w-24 h-24 rounded-full mx-auto mb-4 ring-2 ring-maroon/10 overflow-hidden bg-gray-100">
            {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User size={40} className="text-gray-300" /></div>}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">{user.full_name}</h3>
          <p className="text-xs text-gray-500 mb-4">{user.role}</p>
          <div className="space-y-2">
            <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 bg-maroon text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"><Upload size={15} /> Upload Photo</button>
            {avatar && <button onClick={handleRemove} className="w-full py-2 bg-white text-red-600 border border-red-200 rounded-xl text-sm font-medium flex items-center justify-center gap-2"><Trash2 size={15} /> Remove</button>}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          {error && <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">{error}</div>}
          {success && <div className="mt-4 bg-maroon/5 border border-maroon/10 rounded-xl p-3 text-sm text-maroon">✓ Avatar saved</div>}
        </div>

        <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-3">
            {[
              { label: 'Full Name', value: user.full_name },
              { label: 'Role', value: user.role },
              { label: 'Username', value: user.username },
            ].map((r, i) => (
              <div key={i} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <span className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider">{r.label}</span>
                <span className="text-xs md:text-sm text-gray-700 font-medium">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showEditor && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <h3 className="font-semibold text-gray-900 mb-4">Edit Profile Picture</h3>
            <div className="flex justify-center mb-4">
              <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="rounded-full cursor-grab max-w-[250px] shadow-lg"
                onMouseDown={(e) => { setIsPanning(true); setPanStart({ x: e.clientX - crop.x, y: e.clientY - crop.y }) }}
                onMouseMove={(e) => { if (!isPanning) return; setCrop({ x: e.clientX - panStart.x, y: e.clientY - panStart.y }) }}
                onMouseUp={() => setIsPanning(false)} onMouseLeave={() => setIsPanning(false)}
                onWheel={(e) => { e.preventDefault(); setZoom(z => Math.max(0.5, Math.min(3, z + (e.deltaY > 0 ? -0.1 : 0.1)))) }} />
            </div>
            <p className="text-xs text-gray-400 mb-4">Drag to pan • Scroll to zoom</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="p-2 bg-gray-100 rounded-lg"><ZoomOut size={16} /></button>
              <span className="text-sm font-semibold text-gray-600 w-10">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="p-2 bg-gray-100 rounded-lg"><ZoomIn size={16} /></button>
              <button onClick={() => setRotation(r => r + 90)} className="p-2 bg-gray-100 rounded-lg"><RotateCw size={16} /></button>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setShowEditor(false); imageRef.current = null }} className="px-5 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={handleSaveAvatar} disabled={uploading} className="px-5 py-2 bg-maroon text-white rounded-xl text-sm font-medium">{uploading ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}