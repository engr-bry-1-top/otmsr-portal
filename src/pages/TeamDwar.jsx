import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function TeamDwar() {
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
      {/* Header — same on all screens, responsive text only */}
      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
        <button onClick={() => navigate('/my-dwar')} className="text-gray-500 hover:text-maroon text-sm md:text-base">
          ← Back to My DWAR
        </button>
        <div className="flex-1">
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Team DWAR</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Select an engineer to view their Daily Work Accomplishment Report</p>
        </div>
      </div>

      {/* Grid — 2 cols mobile, 3 cols md, 4 cols lg */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
        {engineers.map(eng => (
          <button
            key={eng.username}
            onClick={() => navigate('/my-dwar', { state: { selectedUserData: eng } })}
            className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-3 md:p-6 text-center hover:border-maroon/40 hover:shadow-lg transition-all group"
          >
            {/* Avatar — 56px mobile, 80px desktop */}
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-full mx-auto mb-2 md:mb-4 overflow-hidden bg-maroon/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              {eng.avatar_url ? (
                <img src={eng.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg md:text-2xl font-bold text-maroon">{getInitials(eng.full_name)}</span>
              )}
            </div>
            {/* Name — smaller on mobile */}
            <p className="text-xs md:text-sm font-semibold text-gray-900 group-hover:text-maroon transition-colors line-clamp-2 md:line-clamp-none">{eng.full_name}</p>
            {/* Role */}
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">{eng.role || 'Field Implementation'}</p>
            {/* Username */}
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