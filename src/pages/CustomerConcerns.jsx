import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

const API_URL = 'https://script.google.com/macros/s/AKfycbw4ynbFVJ4I17WuesGrOSGDunS217pEYuJRz-Hfmqd0z4bT7uTIWI36ERmM_bumrC7h/exec'

export default function CustomerConcerns() {
  const [concerns, setConcerns] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [regionFilter, setRegionFilter] = useState('All')
  const [selected, setSelected] = useState(null)

  const fetchConcerns = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}?api=concerns`)
      const json = await res.json()
      if (Array.isArray(json)) setConcerns(json)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  useEffect(() => { fetchConcerns() }, [])

  const updateStatus = async (rowIndex, newStatus) => {
    await fetch(`${API_URL}?api=concern_update&row=${rowIndex}&status=${encodeURIComponent(newStatus)}`)
    setConcerns(prev => prev.map(c => c.rowIndex === rowIndex ? { ...c, status: newStatus } : c))
    if (selected?.rowIndex === rowIndex) setSelected(prev => ({ ...prev, status: newStatus }))
  }

  const regions = [...new Set(concerns.map(c => c.region).filter(Boolean))].sort()

  let filtered = concerns
  if (statusFilter !== 'All') filtered = filtered.filter(c => c.status === statusFilter)
  if (regionFilter !== 'All') filtered = filtered.filter(c => c.region === regionFilter)
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(c =>
      (c.reference || '').toLowerCase().includes(q) ||
      (c.facility || '').toLowerCase().includes(q) ||
      (c.concern || '').toLowerCase().includes(q) ||
      (c.name || '').toLowerCase().includes(q)
    )
  }

  const stats = {
    total: concerns.length,
    newCount: concerns.filter(c => c.status === 'New').length,
    progress: concerns.filter(c => c.status === 'In Progress').length,
    resolved: concerns.filter(c => c.status === 'Resolved').length,
    closed: concerns.filter(c => c.status === 'Closed').length,
  }

  const getStatusClass = (status) => {
    if (status === 'New') return 'bg-blue-50 text-blue-700 border-blue-200'
    if (status === 'In Progress') return 'bg-amber-50 text-amber-700 border-amber-200'
    if (status === 'Resolved') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (status === 'Closed') return 'bg-gray-100 text-gray-600 border-gray-200'
    return 'bg-gray-50 text-gray-600 border-gray-200'
  }

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Customer Concerns</h1>
        <p className="text-sm text-gray-500 mt-1">Track and manage customer issues</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 mb-4 md:mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-maroon', bg: 'bg-maroon/5' },
          { label: 'New', value: stats.newCount, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'In Progress', value: stats.progress, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Resolved', value: stats.resolved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Closed', value: stats.closed, color: 'text-gray-500', bg: 'bg-gray-100' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-3 md:p-4 border border-gray-100`}>
            <p className={`text-xl md:text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 mb-4 md:mb-6 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 md:gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[150px]">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="flex-1 border border-gray-200 sm:border-none rounded-lg sm:rounded-none px-3 py-2 text-sm outline-none" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none">
          <option value="All">All Status</option>
          <option value="New">New</option><option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option><option value="Closed">Closed</option>
        </select>
        <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none">
          <option value="All">All Regions</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button onClick={fetchConcerns} className="px-4 py-2 bg-maroon text-white text-sm rounded-xl hover:bg-maroon-dark">Refresh</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gray-200 border-t-maroon rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Ref #</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Facility</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Region</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Concern</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer" onClick={() => setSelected(c)}>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{c.reference || '—'}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-500 whitespace-nowrap">{c.timestamp ? new Date(c.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : ''}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-700 whitespace-nowrap">{c.name}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-700 truncate max-w-[120px]" title={c.facility}>{c.facility}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-500 whitespace-nowrap">{c.region}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-700 truncate max-w-[150px]" title={c.concern}>{c.concern}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3" onClick={e => e.stopPropagation()}>
                      <select value={c.status} onChange={e => updateStatus(c.rowIndex, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer outline-none ${getStatusClass(c.status)}`}>
                        <option value="New">New</option><option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option><option value="Closed">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 md:py-16 text-center text-gray-400">No concerns found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-4 md:p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-bold text-gray-900">{selected.reference || 'Concern Details'}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-2 md:space-y-3 text-sm">
              {[
                ['Date', selected.timestamp ? new Date(selected.timestamp).toLocaleString() : 'N/A'],
                ['Name', selected.name], ['Email', selected.email], ['Facility', selected.facility],
                ['Address', selected.address], ['Region', selected.region], ['Contact', selected.contact],
                ['Equipment', selected.equipment], ['Status', selected.status],
              ].map(([label, value], i) => (
                <div key={i} className="flex border-b border-gray-50 pb-2">
                  <span className="text-gray-500 w-24 md:w-28 flex-shrink-0">{label}</span>
                  <span className="text-gray-800 font-medium">{value || '—'}</span>
                </div>
              ))}
              <div className="pt-2">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Concern</p>
                <p className="text-gray-800 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap text-sm">{selected.concern || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}