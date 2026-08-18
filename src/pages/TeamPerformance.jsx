import { useState, useEffect } from 'react'
import { TrendingUp, Target, BarChart3, Trophy } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import { supabase } from '../lib/supabase'

const API_URL = 'https://script.google.com/macros/s/AKfycbwhqFi9pK9uzhDCqLc5mVhpokaA9HWB9f1HzQ5wRErTLTK181U4h0IHsqLw-6CWalU/exec'

const COLORS = ['#800000', '#1E3A5F', '#15803D', '#B45309', '#6B6B6B', '#9B1B30', '#2D2D2D', '#4A4A4A']

export default function TeamPerformance() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('Q3')
  const [year, setYear] = useState('2026')
  const [selected, setSelected] = useState(null)
  const [avatars, setAvatars] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => { fetchData() }, [mode, year])

  useEffect(() => {
    const fetchAvatars = async () => {
      const { data: profiles } = await supabase.from('profiles').select('username, avatar_url, full_name')
      if (profiles) {
        const map = {}
        profiles.forEach(p => {
          if (p.avatar_url) {
            map[p.username] = p.avatar_url
            if (p.full_name) {
              map[p.full_name.toUpperCase()] = p.avatar_url
            }
          }
        })
        setAvatars(map)
      }
    }
    fetchAvatars()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}?api=team_perf&mode=${mode}&year=${year}`)
      const json = await res.json()
      
      if (Array.isArray(json)) {
        setData(json)
        const current = json.find(e => e.engineer === selected?.engineer)
        if (!current) setSelected(json[0] || null)
        else setSelected(current)
      } else if (json.error) {
        setError(json.error)
      }
    } catch (err) { 
      console.error(err)
      setError(err.message)
    }
    setLoading(false)
  }

  const getAvatarUrl = (engineerName) => {
    if (!engineerName) return null
    const engUpper = engineerName.toUpperCase().replace(/\./g, '').replace(/\s+/g, ' ').trim()
    
    for (const [key, url] of Object.entries(avatars)) {
      const keyUpper = key.toUpperCase().replace(/\./g, '').replace(/\s+/g, ' ').trim()
      if (engUpper.includes(keyUpper) || keyUpper.includes(engUpper)) {
        return url
      }
      const engParts = engUpper.split(' ')
      const keyParts = keyUpper.split(' ')
      if (engParts.length >= 2 && keyParts.length >= 2) {
        if (engParts[engParts.length - 1] === keyParts[keyParts.length - 1]) {
          return url
        }
      }
    }
    return null
  }

  const eng = selected || {}
  const trend = eng.trendArray || [35, 35, 35, 35]
  const supabaseAvatar = getAvatarUrl(eng.engineer)
  const displayAvatar = supabaseAvatar || eng.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(eng.engineer || 'User')}&background=800000&color=fff&bold=true`

  const trendData = [
    { quarter: 'Q1', score: trend[0] },
    { quarter: 'Q2', score: trend[1] },
    { quarter: 'Q3', score: trend[2] },
    { quarter: 'Q4', score: trend[3] },
  ]

  const componentData = [
    { name: 'Recent History', score: parseFloat(eng.comp1Score) || 0, max: 40, rate: eng.ongoingComplianceRate || '0%' },
    { name: 'Backlog Clear', score: parseFloat(eng.comp2Score) || 0, max: 30, rate: eng.backlogClearanceRate || '0%' },
    { name: 'PM Compliance', score: parseFloat(eng.comp3Score) || 0, max: 10, rate: eng.pmComplianceRate || '0%' },
  ]

  const scoreData = componentData.map(c => ({ name: c.name, score: c.score, max: c.max }))

  const radarData = [
    { subject: 'History', A: parseFloat(eng.comp1Score) / 40 * 100, fullMark: 100 },
    { subject: 'Backlog', A: parseFloat(eng.comp2Score) / 30 * 100, fullMark: 100 },
    { subject: 'PM', A: parseFloat(eng.comp3Score) / 10 * 100, fullMark: 100 },
  ]

  const allEngineersData = data.slice(0, 10).map(e => {
    let name = e.engineer || ''
    if (name === 'WHOLE TEAM OVERALL') name = 'TEAM'
    else if (name.includes('JOHN FELIX')) name = 'J. FELIX'
    else if (name.includes('JOHN PAUL')) name = 'J. PAUL'
    else name = name.split(' ')[0]
    return { name: name, score: parseFloat(e.weightedSeventyPercentContribution) || 0 }
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-[3px] border-gray-200 border-t-maroon rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading team performance...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-sm font-medium text-gray-700">Failed to load team performance</p>
        <p className="text-xs text-gray-400 max-w-sm text-center">{error}</p>
        <button 
          onClick={fetchData} 
          className="px-4 py-2 bg-maroon text-white rounded-xl text-sm font-medium hover:bg-maroon-dark"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!eng.engineer) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
          <span className="text-2xl">📊</span>
        </div>
        <p className="text-sm font-medium text-gray-700">No performance data available</p>
        <p className="text-xs text-gray-400">Check the Master_Dashboard_Data sheet for records</p>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Team Performance</h1>
            <p className="text-sm text-gray-500">80-Point Productivity Audit</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select value={selected?.engineer || ''} onChange={e => { const found = data.find(d => d.engineer === e.target.value); if (found) setSelected(found) }}
              className="w-full sm:w-56 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none">
              {data.map(e => <option key={e.engineer} value={e.engineer}>{e.engineer}</option>)}
            </select>
            <div className="flex gap-2">
              <select value={mode} onChange={e => setMode(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none">
                <option value="Q1">Q1</option><option value="Q2">Q2</option><option value="Q3">Q3</option><option value="Q4">Q4</option><option value="YEARLY">Yearly</option>
              </select>
              <select value={year} onChange={e => setYear(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none">
                <option value="2026">2026</option><option value="2025">2025</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img src={displayAvatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-maroon/20 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{eng.engineer}</h2>
            <p className="text-sm text-gray-500">{eng.role || 'Field Implementation'}</p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-maroon">{eng.weightedSeventyPercentContribution || '0.0'}</p>
              <p className="text-[10px] text-gray-500 uppercase">Score / 80</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-amber-700">{eng.grossWeight || '0.0'}%</p>
              <p className="text-[10px] text-gray-500 uppercase">Gross Weight</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-navy">{eng.currentQuarterInstallations || '0'}</p>
              <p className="text-[10px] text-gray-500 uppercase">Installations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {componentData.map((c, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{c.name}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{c.rate}</p>
            <p className="text-xs text-gray-400 mt-0.5">Score: {c.score} / {c.max}</p>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
              <div className="bg-maroon h-2 rounded-full" style={{ width: `${Math.min((c.score / c.max) * 100, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-maroon" /> Quarterly Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="quarter" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 80]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#800000" strokeWidth={3} dot={{ fill: '#800000', r: 6 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-maroon" /> Component Scores</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={scoreData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="score" fill="#800000" radius={[4, 4, 0, 0]} name="Score" />
              <Bar dataKey="max" fill="#E5E5E5" radius={[4, 4, 0, 0]} name="Max" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><Target size={16} className="text-maroon" /> Performance Radar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e5e5" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar name={eng.engineer || 'Engineer'} dataKey="A" stroke="#800000" fill="#800000" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><Trophy size={16} className="text-maroon" /> Team Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={allEngineersData} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" domain={[0, 80]} tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
              <Tooltip />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {allEngineersData.map((_, i) => (
                  <rect key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}