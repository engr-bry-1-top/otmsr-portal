import { useState, useEffect } from 'react'

const API_URL = 'https://script.google.com/macros/s/AKfycbwhqFi9pK9uzhDCqLc5mVhpokaA9HWB9f1HzQ5wRErTLTK181U4h0IHsqLw-6CWalU/exec'

const ENGINEERS = [
  'All', 'JOSH VELASCO', 'ROB DE LA CRUZ', 'NOWIEL GONZALES', 'KEITH FERN AMOR',
  'JOHN PAUL BAUTISTA', 'JOHN FELIX ARABIT', 'GERSON SACRAMENTO', 'BRIAN EZEKIEL BATALON', 'REYNALDO T. VILLA'
]

export default function PMSTracker() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [engineer, setEngineer] = useState('All')
  const [pmsSlot, setPmsSlot] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [quarter, setQuarter] = useState('Q3')
  const [year, setYear] = useState('2026')
  const [page, setPage] = useState(1)
  const pageSize = 25

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}?api=pms_tracker&engineer=${encodeURIComponent(engineer)}&quarter=${quarter}&year=${year}`)
      const json = await res.json()
      setData(json || [])
      setPage(1)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [engineer, quarter, year])

  let filtered = data
  if (pmsSlot !== 'All') filtered = filtered.filter(r => r.pmsSlot === parseInt(pmsSlot))
  if (statusFilter === 'Done') filtered = filtered.filter(r => r.status === 'DONE')
  else if (statusFilter === 'Pending') filtered = filtered.filter(r => r.status === 'PENDING')
  else if (statusFilter === 'Overdue') filtered = filtered.filter(r => r.status === 'OVERDUE')

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const done = data.filter(r => r.status === 'DONE').length
  const pending = data.filter(r => r.status === 'PENDING').length
  const overdue = data.filter(r => r.status === 'OVERDUE').length

  const getStatusBadge = (status) => {
    if (status === 'DONE') return 'bg-emerald-50 text-emerald-700'
    if (status === 'OVERDUE') return 'bg-red-50 text-red-700'
    return 'bg-amber-50 text-amber-700'
  }

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">PMS Tracker</h1>
        <p className="text-sm text-gray-500 mt-1">Preventive Maintenance Schedule</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 mb-4 md:mb-6">
        <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2 md:gap-3">
          <select value={engineer} onChange={e => setEngineer(e.target.value)} className="px-2 md:px-3 py-2 text-xs md:text-sm border border-gray-200 rounded-lg bg-white outline-none">
            {ENGINEERS.map(e => <option key={e} value={e}>{e === 'All' ? 'All Engineers' : e}</option>)}
          </select>
          <select value={pmsSlot} onChange={e => setPmsSlot(e.target.value)} className="px-2 md:px-3 py-2 text-xs md:text-sm border border-gray-200 rounded-lg bg-white outline-none">
            <option value="All">All PMS</option>
            <option value="1">PMS 1</option><option value="2">PMS 2</option><option value="3">PMS 3</option><option value="4">PMS 4</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-2 md:px-3 py-2 text-xs md:text-sm border border-gray-200 rounded-lg bg-white outline-none">
            <option value="All">All Status</option>
            <option value="Done">Done</option><option value="Pending">Pending</option><option value="Overdue">Overdue</option>
          </select>
          <select value={quarter} onChange={e => setQuarter(e.target.value)} className="px-2 md:px-3 py-2 text-xs md:text-sm border border-gray-200 rounded-lg bg-white outline-none">
            <option value="Q1">Q1</option><option value="Q2">Q2</option><option value="Q3">Q3</option><option value="Q4">Q4</option>
          </select>
          <select value={year} onChange={e => setYear(e.target.value)} className="px-2 md:px-3 py-2 text-xs md:text-sm border border-gray-200 rounded-lg bg-white outline-none">
            <option value="2026">2026</option><option value="2027">2027</option><option value="2028">2028</option>
          </select>
          <button onClick={fetchData} className="px-3 py-2 bg-maroon text-white text-xs md:text-sm rounded-xl hover:bg-maroon-dark col-span-2 md:col-span-1">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
        {[
          { label: 'Total', value: data.length, color: 'text-maroon', bg: 'bg-maroon/5' },
          { label: 'Done', value: done, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending', value: pending, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Overdue', value: overdue, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-3 md:p-4 border border-gray-100`}>
            <p className={`text-xl md:text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gray-200 border-t-maroon rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">PMS</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Facility</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Equipment</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">PO</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Engineer</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((r, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-3 md:px-4 py-2 md:py-3"><span className="bg-maroon text-white px-2 py-0.5 rounded text-xs font-bold">PMS {r.pmsSlot}</span></td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-700 whitespace-nowrap">{new Date(r.pmsDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-700 truncate max-w-[120px]" title={r.facility}>{r.facility}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-700 truncate max-w-[100px]" title={r.equipment}>{r.equipment}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-500">{r.poNumber}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(r.status)}`}>{r.status}</span>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-600">{r.performedBy || 'Unassigned'}</td>
                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 md:py-16 text-center text-gray-400">No PMS records found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 md:gap-3 p-3 md:p-4 border-t border-gray-100">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs md:text-sm border rounded-lg disabled:opacity-30">Prev</button>
              <span className="text-xs md:text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs md:text-sm border rounded-lg disabled:opacity-30">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}