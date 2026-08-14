import { useState, useEffect } from 'react'
import { X, Bell } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AnnouncementModal({ isOpen, onClose, isMobile }) {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchUnreadAnnouncements()
    }
  }, [isOpen])

  const fetchUnreadAnnouncements = async () => {
    setLoading(true)
    try {
      const stored = localStorage.getItem('otmsr_user')
      const user = JSON.parse(stored)
      
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('username', user.username)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10)
      
      setAnnouncements(data || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const markAsRead = async (id) => {
    try {
      await supabase.from('announcements').update({ is_read: true }).eq('id', id)
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    } catch (err) { console.error(err) }
  }

  const dismissAll = async () => {
    try {
      const stored = localStorage.getItem('otmsr_user')
      const user = JSON.parse(stored)
      
      await supabase.from('announcements')
        .update({ is_read: true })
        .eq('username', user.username)
        .eq('is_read', false)
      
      setAnnouncements([])
      onClose()
    } catch (err) { console.error(err) }
  }

  if (!isOpen) return null

  return (
    <div style={{ 
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10001, 
      display: 'flex', justifyContent: 'center', 
      alignItems: isMobile ? 'flex-end' : 'center',
      padding: isMobile ? 0 : '1rem' 
    }} onClick={onClose}>
      <div style={{ 
        background: '#fff', 
        borderRadius: isMobile ? '16px 16px 0 0' : '16px',
        padding: isMobile ? '1.25rem' : '1.5rem', 
        width: '100%', maxWidth: '500px', 
        maxHeight: '80vh', overflowY: 'auto',
        boxShadow: isMobile ? '0 -10px 40px rgba(0,0,0,0.2)' : '0 20px 50px rgba(0,0,0,0.3)' 
      }} onClick={e => e.stopPropagation()}>
        {isMobile && <div style={{ width: '40px', height: '4px', background: '#E5E5E5', borderRadius: '2px', margin: '0 auto 0.75rem' }} />}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', color: '#800000', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} /> Announcements
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-maroon rounded-full animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-10 text-center">
            <Bell size={32} className="mx-auto text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">No new announcements</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {announcements.map(ann => (
                <div key={ann.id} className="bg-maroon/5 border border-maroon/10 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-900">{ann.title}</p>
                  <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{ann.message}</p>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {new Date(ann.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <button 
                    onClick={() => markAsRead(ann.id)} 
                    className="mt-2 text-xs text-maroon font-medium hover:text-maroon-dark"
                  >
                    Mark as read
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={dismissAll} 
              className="mt-4 w-full py-2.5 bg-maroon text-white rounded-xl text-sm font-medium"
            >
              Dismiss All
            </button>
          </>
        )}
      </div>
    </div>
  )
}