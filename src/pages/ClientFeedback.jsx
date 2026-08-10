import { useState, useEffect } from 'react'
import { Star, TrendingUp, Users, Building2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const API_URL = 'https://script.google.com/macros/s/AKfycbwhqFi9pK9uzhDCqLc5mVhpokaA9HWB9f1HzQ5wRErTLTK181U4h0IHsqLw-6CWalU/exec'

const COLORS = ['#15803D', '#1D4ED8', '#B45309', '#B91C1C', '#7F1D1D', '#800000']
const WEIGHTS = { 'Very Satisfied': 1.0, 'Satisfied': 0.75, 'Neutral': 0.50, 'Unsatisfied': 0.25, 'Very Unsatisfied': 0.0 }

export default function ClientFeedback() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [engineerFilter, setEngineerFilter] = useState('All')
  const [satisfactionFilter, setSatisfactionFilter] = useState('All')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}?api=feedback`)
      const json = await res.json()
      if (Array.isArray(json)) setData(json)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const engineers = [...new Set(data.map(d => d.engineer).filter(Boolean))].sort()

  let filtered = data
  if (engineerFilter !== 'All') filtered = filtered.filter(d => d.engineer === engineerFilter)
  if (satisfactionFilter !== 'All') filtered = filtered.filter(d => d.satisfaction === satisfactionFilter)

  const total = filtered.length
  const weightedScore = filtered.reduce((s, d) => s + (WEIGHTS[d.satisfaction] || 0), 0)
  const satisfactionRate = total > 0 ? ((weightedScore / total) * 100).toFixed(1) : 0
  const uniqueCustomers = new Set(filtered.map(d => d.customerName)).size
  const uniqueFacilities = new Set(filtered.map(d => d.facility)).size

  const satCounts = {}
  filtered.forEach(d => { const l = d.satisfaction || 'Unknown'; satCounts[l] = (satCounts[l] || 0) + 1 })
  const satChartData = Object.entries(satCounts).map(([name, value]) => ({ name, value }))

  const engCounts = {}
  filtered.forEach(d => { const e = d.engineer || 'Unknown'; engCounts[e] = (engCounts[e] || 0) + 1 })
  const engChartData = Object.entries(engCounts).map(([name, value]) => ({ name, value }))

  const getSatClass = (s) => {
    if (s === 'Very Satisfied') return 'bg-emerald-50 text-emerald-700'
    if (s === 'Satisfied') return 'bg-blue-50 text-blue-700'
    if (s === 'Neutral') return 'bg-amber-50 text-amber-700'
    return 'bg-red-50 text-red-700'
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gray-200 border-t-maroon rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Client Feedback</h1>
        <p className="text-sm text-gray-500 mt-1">Weighted satisfaction analytics</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 mb-4 md:mb-6 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 md:gap-3">
        <select value={engineerFilter} onChange={e => setEngineerFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none">
          <option value="All">All Engineers</option>
          {engineers.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={satisfactionFilter} onChange={e => setSatisfactionFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none">
          <option value="All">All Levels</option>
          <option value="Very Satisfied">Very Satisfied</option><option value="Satisfied">Satisfied</option>
          <option value="Neutral">Neutral</option><option value="Unsatisfied">Unsatisfied</option><option value="Very Unsatisfied">Very Unsatisfied</option>
        </select>
        <button onClick={fetchData} className="px-4 py-2 bg-maroon text-white text-sm rounded-xl hover:bg-maroon-dark ml-auto">Refresh</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
        {[
          { label: 'Total Feedback', value: total, icon: Star, color: 'text-maroon', bg: 'bg-maroon/5' },
          { label: 'Weighted Score', value: `${satisfactionRate}%`, icon: TrendingUp, color: 'text-navy', bg: 'bg-navy/5' },
          { label: 'Unique Customers', value: uniqueCustomers, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Facilities Served', value: uniqueFacilities, icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-3 md:p-4 border border-gray-100`}>
            <s.icon size={18} className={s.color} />
            <p className="text-xl md:text-2xl font-bold mt-2 text-gray-900">{s.value}</p>
            <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Satisfaction Distribution</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={satChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={3} dataKey="value">
                  {satChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Feedback by Engineer</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={engChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#800000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Recent Feedback</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Facility</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Engineer</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Satisfaction</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Comments</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-xs font-semibold text-gray-500 uppercase">Device</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice().reverse().slice(0, 50).map((d, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-500 whitespace-nowrap">{d.timestamp ? new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-700">{d.customerName}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-700">{d.facility}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-700">{d.engineer}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getSatClass(d.satisfaction)}`}>{d.satisfaction}</span></td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-600 max-w-[150px] truncate">{d.comments}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-500">{d.device}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 md:py-16 text-center text-gray-400">No feedback records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}