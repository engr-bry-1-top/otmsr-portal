import { useState, useEffect } from 'react'
import { Check, X, UserPlus, CalendarClock } from 'lucide-react'

const API_URL = 'https://script.google.com/macros/s/AKfycbwhqFi9pK9uzhDCqLc5mVhpokaA9HWB9f1HzQ5wRErTLTK181U4h0IHsqLw-6CWalU/exec'

const ENGINEERS = [
  'JOSH VELASCO', 'ROB DE LA CRUZ', 'NOWIEL GONZALES', 'KEITH FERN AMOR',
  'JOHN PAUL BAUTISTA', 'JOHN FELIX ARABIT', 'GERSON SACRAMENTO',
  'BRIAN EZEKIEL BATALON', 'REYNALDO T. VILLA'
]

const ASSIGN_USERS = ['rob.onetop', 'josh.onetop', 'bry.onetop']

export default function PMSTracker() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [engineer, setEngineer] = useState('All')
  const [pmsSlot, setPmsSlot] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [quarter, setQuarter] = useState('Q3')
  const [year, setYear] = useState('2026')
  const [page, setPage] = useState(1)
  const [canAssign, setCanAssign] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(null)
  const [showDateModal, setShowDateModal] = useState(null)
  const [selectedEngineers, setSelectedEngineers] = useState([])
  const [newDate, setNewDate] = useState('')
  const pageSize = 25

  useEffect(() => {
    const stored = localStorage.getItem('otmsr_user')
    if (stored) {
      const user = JSON.parse(stored)
      setCanAssign(ASSIGN_USERS.includes(user.username))
    }
  }, [])

  useEffect(() => { fetchData() }, [engineer, quarter, year])

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

  const openAssignModal = (rowIndex, slot) => {
    setSelectedEngineers([])
    setShowAssignModal({ rowIndex, slot })
  }

  const toggleEngineer = (eng) => {
    setSelectedEngineers(prev => prev.includes(eng) ? prev.filter(e => e !== eng) : [...prev, eng])
  }

  const saveAssignment = async () => {
    if (!showAssignModal || selectedEngineers.length === 0) return
    const { rowIndex, slot } = showAssignModal
    const nameStr = selectedEngineers.join(', ')
    setShowAssignModal(null)
    setLoading(true)
    try {
      await fetch(`${API_URL}?api=pms_assign&row=${rowIndex}&slot=${slot}&engineers=${encodeURIComponent(nameStr)}`)
      fetchData()
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const markDone = async (rowIndex, slot) => {
    setLoading(true)
    try {
      await fetch(`${API_URL}?api=pms_done&row=${rowIndex}&slot=${slot}`)
      fetchData()
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const openDateModal = (rowIndex, slot) => {
    const today = new Date()
    const def = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear()
    setNewDate(def)
    setShowDateModal({ rowIndex, slot })
  }

  const saveDateChange = async () => {
    if (!showDateModal || !newDate) return
    const { rowIndex, slot } = showDateModal
    setShowDateModal(null)
    setLoading(true)
    try {
      await fetch(`${API_URL}?api=pms_date&row=${rowIndex}&slot=${slot}&date=${encodeURIComponent(newDate)}`)
      fetchData()
    } catch (err) { console.error(err) }
    setLoading(false)
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
            <option value="All">All Engineers</option>
            {ENGINEERS.map(e => <option key={e} value={e}>{e}</option>)}
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
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">PMS</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Facility</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Equipment</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">PO</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Engineer</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((r, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-3 md:px-4 py-2 md:py-3 whitespace-nowrap">
                      <span className="bg-maroon text-white px-2 py-0.5 rounded text-xs font-bold">PMS {r.pmsSlot}</span>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-700 whitespace-nowrap">{new Date(r.pmsDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-700 whitespace-normal">{r.facility}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-700 whitespace-normal">{r.equipment}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-500 whitespace-nowrap">{r.poNumber}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(r.status)}`}>{r.status}</span>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-600 whitespace-nowrap">{r.performedBy || 'Unassigned'}</td>
                    <td className="px-3 md:px-4 py-2 md:py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {canAssign && (
                          <button onClick={() => openAssignModal(r.rowIndex, r.pmsSlot)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-maroon" title="Assign Engineers">
                            <UserPlus size={15} />
                          </button>
                        )}
                        <button onClick={() => markDone(r.rowIndex, r.pmsSlot)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-500 hover:text-emerald-600" title="Mark Done">
                          <Check size={15} />
                        </button>
                        <button onClick={() => openDateModal(r.rowIndex, r.pmsSlot)} className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-500 hover:text-amber-600" title="Change Date">
                          <CalendarClock size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 md:py-16 text-center text-gray-400">No PMS records found</td></tr>
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

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowAssignModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Assign Engineers</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {ENGINEERS.map(eng => (
                <label key={eng} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border ${selectedEngineers.includes(eng) ? 'border-maroon bg-maroon/5' : 'border-gray-200'}`}>
                  <input type="checkbox" checked={selectedEngineers.includes(eng)} onChange={() => toggleEngineer(eng)} className="w-4 h-4 accent-maroon" />
                  <span className="text-sm">{eng}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAssignModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={saveAssignment} className="flex-1 py-2.5 bg-maroon text-white rounded-xl text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Date Modal */}
      {showDateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowDateModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Change PMS Date</h3>
            <p className="text-xs text-gray-500 mb-4">Future PMS dates will cascade from this date.</p>
            <input type="text" value={newDate} onChange={e => setNewDate(e.target.value)} placeholder="MM/DD/YYYY"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl mb-4 outline-none focus:border-maroon" />
            <div className="flex gap-3">
              <button onClick={() => setShowDateModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={saveDateChange} className="flex-1 py-2.5 bg-maroon text-white rounded-xl text-sm font-medium">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}