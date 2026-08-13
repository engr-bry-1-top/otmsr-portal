import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function TeamSoa() {
  const navigate = useNavigate()
  const [engineers, setEngineers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEngineers()
  }, [])

  const fetchEngineers = async () => {
    setLoading(true)
    try {
      const { data: profiles } = await supabase.from('profiles').select('*').order('full_name')
      if (profiles) {
        const engList = profiles.filter(p => 
          p.full_name && 
          !p.full_name.toUpperCase().includes('ADMIN')
        )
        setEngineers(engList)
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-maroon rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
        <button 
          onClick={() => navigate('/my-soa')} 
          className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-maroon hover:border-maroon/40 transition-all flex-shrink-0"
          title="Back to My SOA"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/>
            <path d="M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Team SOA</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Select an engineer to view their Summary of Accomplishment</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
        {engineers.map(eng => (
          <button
            key={eng.username}
            onClick={() => navigate('/my-soa', { state: { selectedUserData: eng } })}
            className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-3 md:p-6 text-center hover:border-maroon/40 hover:shadow-lg transition-all group"
          >
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-full mx-auto mb-2 md:mb-4 overflow-hidden bg-maroon/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              {eng.avatar_url ? (
                <img src={eng.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg md:text-2xl font-bold text-maroon">{getInitials(eng.full_name)}</span>
              )}
            </div>
            <p className="text-xs md:text-sm font-semibold text-gray-900 group-hover:text-maroon transition-colors line-clamp-2 md:line-clamp-none">{eng.full_name}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">{eng.role || 'Field Implementation'}</p>
            <p className="text-[9px] md:text-[10px] text-gray-300 mt-1 md:mt-2 truncate">@{eng.username}</p>
          </button>
        ))}
      </div>

      {engineers.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 md:p-20 text-center">
          <p className="text-gray-400 text-sm">No engineers found</p>
        </div>
      )}
    </div>
  )
}