import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ServiceRequests() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [analytics, setAnalytics] = useState({ total: 0, pending: 0, done: 0, cancelled: 0 })

  useEffect(() => { fetchRequests() }, [])

  const fetchRequests = async () => {
    const { data } = await supabase.from('service_requests').select('*').order('created_at', { ascending: false })
    if (data) {
      setRequests(data)
      setAnalytics({
        total: data.length,
        pending: data.filter(r => r.status === 'pending').length,
        done: data.filter(r => r.status === 'done').length,
        cancelled: data.filter(r => r.status === 'cancelled').length,
      })
    }
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    await supabase.from('service_requests').update({ status }).eq('id', id)
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    fetchRequests()
  }

  const filtered = requests.filter(r => {
    const match = (r.requested_by || '').toLowerCase().includes(search.toLowerCase()) || (r.location || '').toLowerCase().includes(search.toLowerCase())
    if (filter === 'all') return match
    return match && r.status === filter
  })

  const statusStyle = (status) => {
    if (status === 'pending') return 'bg-amber-50 text-amber-800 border-amber-200'
    if (status === 'done') return 'bg-maroon/5 text-maroon border-maroon/20'
    if (status === 'cancelled') return 'bg-gray-100 text-gray-500 border-gray-200'
    return 'bg-gray-50 text-gray-600 border-gray-200'
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gray-200 border-t-maroon rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Service Requests</h1>
        <p className="text-sm text-gray-500 mt-1">{analytics.total} total submissions</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
        {[
          { label: 'Total', value: analytics.total, color: 'text-maroon', bg: 'bg-maroon/5' },
          { label: 'Pending', value: analytics.pending, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Done', value: analytics.done, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Cancelled', value: analytics.cancelled, color: 'text-red-700', bg: 'bg-red-50' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-3 md:p-4 border border-gray-100`}>
            <p className={`text-xl md:text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-4 md:mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or location..."
            className="w-full pl-10 pr-4 py-2 md:py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-maroon/10 focus:border-maroon outline-none" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-4 py-2 md:py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-600 outline-none cursor-pointer">
          <option value="all">All Status</option>
          <option value="pending">Pending</option><option value="done">Done</option><option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 md:p-20 text-center">
          <FileText size={40} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 text-sm">No service requests found</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(req => (
              <div key={req.id} onClick={() => navigate(`/service-request/view/${req.id}`)} className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer active:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{req.requested_by}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{req.location}</p>
                  </div>
                  <select value={req.status} onChange={e => { e.stopPropagation(); updateStatus(req.id, e.target.value) }}
                    className={`text-[10px] font-semibold px-2 py-1 rounded-full border cursor-pointer outline-none ml-2 ${statusStyle(req.status)}`}>
                    <option value="pending">Pending</option><option value="done">Done</option><option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  {req.service_types?.slice(0, 2).map((t, i) => (
                    <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px]">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/30">
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Requester</th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Services</th>
                    <th className="text-center px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(req => (
                    <tr key={req.id} onClick={() => navigate(`/service-request/view/${req.id}`)} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors">
                      <td className="px-4 md:px-6 py-3 text-sm font-medium text-gray-900">{req.requested_by}</td>
                      <td className="px-4 md:px-6 py-3 text-sm text-gray-600">{req.location}</td>
                      <td className="px-4 md:px-6 py-3 text-sm text-gray-500">{new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td className="px-4 md:px-6 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {req.service_types?.slice(0, 2).map((t, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{t}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 text-center" onClick={e => e.stopPropagation()}>
                        <select value={req.status} onChange={e => updateStatus(req.id, e.target.value)} className={`text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer outline-none ${statusStyle(req.status)}`}>
                          <option value="pending">Pending</option><option value="done">Done</option><option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}