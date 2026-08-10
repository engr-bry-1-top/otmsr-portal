import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Package, Clock, AlertTriangle, CheckCircle2, Truck, Trophy, Printer } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const API_URL = 'https://script.google.com/macros/s/AKfycbwhqFi9pK9uzhDCqLc5mVhpokaA9HWB9f1HzQ5wRErTLTK181U4h0IHsqLw-6CWalU/exec?api=deployment'

const COLORS = ['#800000', '#4A0000', '#A52A2A', '#D4A0A0', '#2D2D2D', '#666666', '#999999', '#B91C1C', '#15803D', '#1D4ED8']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Deployment() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rawData, setRawData] = useState(null)
  const [filterYear, setFilterYear] = useState('Overall')
  const [filterQuarter, setFilterQuarter] = useState('All')
  const [filterMonth, setFilterMonth] = useState('All')
  const [years, setYears] = useState([])
  const [metrics, setMetrics] = useState(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL)
      const json = await res.json()
      if (json.error) { setError(json.error); setLoading(false); return }
      setRawData(json)
      if (json.yearsList) {
        setYears(['Overall', ...json.yearsList.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))])
      }
    } catch (err) { setError('Failed to load data: ' + err.message) }
    setLoading(false)
  }

  useEffect(() => {
    if (!rawData?.dataset) return
    let key = filterYear
    if (filterMonth !== 'All') key = filterYear === 'Overall' ? `Overall-${filterMonth}` : `${filterYear}-${filterMonth}`
    else if (filterQuarter !== 'All') key = filterYear === 'Overall' ? `Overall-${filterQuarter}` : `${filterYear}-${filterQuarter}`

    const d = rawData.dataset[key] || rawData.dataset['Overall']
    if (!d) { setMetrics(null); return }

    const deliveryData = MONTHS.map(m => ({ name: m, value: d.deliveryTimelineData?.find(([mn]) => mn === m)?.[1] || 0 }))
    const installData = MONTHS.map(m => ({ name: m, value: d.installTimelineData?.find(([mn]) => mn === m)?.[1] || 0 }))
    const statusData = (d.statusData || []).slice(1).map(([name, value]) => ({ name, value }))
    const regionData = (d.regionData || []).slice(1).map(([name, value]) => ({ name, value }))
    const backlogData = (d.backlogOriginData || []).slice(1).map(([name, value]) => ({ name, value }))

    setMetrics({
      uniquePOs: d.uniquePOCount || 0, totalQty: d.totalEquipmentVolume || 0,
      installedQty: d.totalInstalledVolume || 0, avgTurnaround: d.avgTurnaround || 'N/A',
      installRate: d.totalEquipmentVolume > 0 ? ((d.totalInstalledVolume / d.totalEquipmentVolume) * 100).toFixed(1) : 0,
      healthy: d.backlogHealthy || 0, warning: d.backlogWarning || 0,
      critical: d.backlogCritical || 0, done: d.backlogDone || 0,
      leaderboard: d.engineerLeaderboard || [],
      deliveryData, installData, statusData, regionData, backlogData,
    })
  }, [rawData, filterYear, filterQuarter, filterMonth])

  const handlePrint = () => window.print()

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gray-200 border-t-maroon rounded-full animate-spin" /></div>
  if (error) return <div className="bg-white rounded-xl border border-gray-100 p-20 text-center"><p className="text-red-500">{error}</p></div>

  return (
    <div>
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 8mm; }
          html, body { height: auto !important; overflow: visible !important; background: #fff !important; }
          .h-screen { height: auto !important; }
          .overflow-y-auto, .overflow-hidden { overflow: visible !important; }
          main { overflow: visible !important; height: auto !important; padding: 0 !important; margin: 0 !important; }
          aside, header, .no-print { display: none !important; }
          .flex-1 { flex: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6 no-print">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Deployment Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Equipment deployment analytics & tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="px-3 py-2 text-sm bg-maroon text-white rounded-xl hover:bg-maroon-dark">Refresh</button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 text-sm bg-charcoal text-white rounded-xl hover:bg-charcoal-light"><Printer size={16} /> Print</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 mb-4 md:mb-6 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 md:gap-3 no-print">
        <select value={filterYear} onChange={e => { setFilterYear(e.target.value); setFilterQuarter('All'); setFilterMonth('All') }} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none w-full sm:w-auto">
          {years.map(y => <option key={y} value={y}>{y === 'Overall' ? 'Overall View' : `${y} Year`}</option>)}
        </select>
        <select value={filterQuarter} onChange={e => { setFilterQuarter(e.target.value); setFilterMonth('All') }} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none w-full sm:w-auto">
          <option value="All">All Quarters</option><option value="Q1">Q1</option><option value="Q2">Q2</option><option value="Q3">Q3</option><option value="Q4">Q4</option>
        </select>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none w-full sm:w-auto">
          <option value="All">All Months</option>
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <button onClick={() => { setFilterYear('Overall'); setFilterQuarter('All'); setFilterMonth('All') }} className="px-3 py-2 text-sm text-gray-500 hover:text-maroon w-full sm:w-auto text-left">Reset</button>
      </div>

      {!metrics ? (
        <div className="bg-white rounded-xl border border-gray-100 p-20 text-center">
          <BarChart3 size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400">No deployment data available</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3 mb-4 md:mb-6">
            {[
              { label: 'Contracts (POs)', value: metrics.uniquePOs, icon: Package, color: 'text-maroon', bg: 'bg-maroon/5' },
              { label: 'Total Items', value: metrics.totalQty.toLocaleString(), icon: TrendingUp, color: 'text-navy', bg: 'bg-navy/5' },
              { label: 'Installed', value: metrics.installedQty.toLocaleString(), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Avg Turnaround', value: `${metrics.avgTurnaround}d`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Install Rate', value: `${metrics.installRate}%`, icon: Truck, color: 'text-maroon', bg: 'bg-maroon/5' },
            ].map((kpi, i) => (
              <div key={i} className={`${kpi.bg} rounded-xl p-3 md:p-4 border border-gray-100`}>
                <kpi.icon size={18} className={kpi.color} />
                <p className="text-xl md:text-2xl font-bold mt-2 text-gray-900">{kpi.value}</p>
                <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">{kpi.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6 mb-4 md:mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Hardware Delivery Fulfillment</h3>
            <div className="w-full bg-gray-100 rounded-full h-3 md:h-4 overflow-hidden">
              <div className="bg-maroon h-3 md:h-4 rounded-full" style={{ width: `${metrics.installRate}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-2">{metrics.installedQty.toLocaleString()} of {metrics.totalQty.toLocaleString()} installed ({metrics.installRate}%)</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
            {[
              { label: 'Healthy', sub: 'Within SLA', value: metrics.healthy, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
              { label: 'Warning', sub: '90-120 days', value: metrics.warning, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
              { label: 'Critical', sub: '120+ days', value: metrics.critical, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
              { label: 'Done', sub: 'Completed', value: metrics.done, color: 'text-maroon', bg: 'bg-maroon/5', border: 'border-maroon/20' },
            ].map((b, i) => (
              <div key={i} className={`${b.bg} ${b.border} rounded-xl p-3 md:p-4 border`}>
                <AlertTriangle size={18} className={b.color} />
                <p className={`text-lg md:text-xl font-bold mt-2 ${b.color}`}>{b.value.toLocaleString()}</p>
                <p className="text-xs text-gray-600 font-semibold">{b.label}</p>
                <p className="text-[10px] text-gray-400">{b.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Volume by Delivery Month</h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={metrics.deliveryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#800000" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Volume by Install Month</h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={metrics.installData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Installation Status</h3>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={metrics.statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={2} dataKey="value">
                      {metrics.statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 9 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Regional Allocation</h3>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={metrics.regionData.slice(0, 8)} cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={2} dataKey="value">
                      {metrics.regionData.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 9 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {metrics.backlogData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 mb-4 md:mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Backlog Origin Mix</h3>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={metrics.backlogData} cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={2} dataKey="value">
                      {metrics.backlogData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 9 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-4 md:mb-6">
            <div className="p-3 md:p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Trophy size={18} className="text-maroon" /> Engineer Leaderboard</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-3 md:px-4 py-2 text-xs font-semibold text-gray-500 uppercase">#</th>
                    <th className="px-3 md:px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Engineer</th>
                    <th className="px-3 md:px-4 py-2 text-xs font-semibold text-gray-500 uppercase text-center">Done</th>
                    <th className="px-3 md:px-4 py-2 text-xs font-semibold text-gray-500 uppercase text-center">Tasks</th>
                    <th className="px-3 md:px-4 py-2 text-xs font-semibold text-gray-500 uppercase text-center">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.leaderboard.map((eng, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="px-3 md:px-4 py-2">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-maroon text-white' : 'bg-gray-100 text-gray-500'}`}>{i+1}</span>
                      </td>
                      <td className="px-3 md:px-4 py-2 text-sm font-medium text-gray-900">{eng.name}</td>
                      <td className="px-3 md:px-4 py-2 text-sm font-semibold text-maroon text-center">{(eng.backlogDone || 0).toLocaleString()}</td>
                      <td className="px-3 md:px-4 py-2 text-sm text-gray-600 text-center">{eng.count || 0}</td>
                      <td className="px-3 md:px-4 py-2 text-sm text-gray-600 text-center">{(eng.volume || 0).toLocaleString()}</td>
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