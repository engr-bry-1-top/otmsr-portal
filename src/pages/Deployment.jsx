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

  const handlePrint = () => {
    if (!metrics) return
    
    const title = 'Deployment Overview Report'
    const filterLabel = `Year: ${filterYear} | Quarter: ${filterQuarter} | Month: ${filterMonth}`
    
    // KPI cards HTML
    const kpiCardsHTML = `
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:16px;">
        <div style="border:1px solid #ddd;border-radius:6px;padding:10px;text-align:center;border-left:3px solid #800000;">
          <p style="font-size:18px;font-weight:800;color:#800000;margin:0;">${metrics.uniquePOs}</p>
          <p style="font-size:8px;color:#777;text-transform:uppercase;font-weight:600;margin:2px 0 0;">Contracts (POs)</p>
        </div>
        <div style="border:1px solid #ddd;border-radius:6px;padding:10px;text-align:center;">
          <p style="font-size:18px;font-weight:800;color:#333;margin:0;">${metrics.totalQty.toLocaleString()}</p>
          <p style="font-size:8px;color:#777;text-transform:uppercase;font-weight:600;margin:2px 0 0;">Total Items</p>
        </div>
        <div style="border:1px solid #ddd;border-radius:6px;padding:10px;text-align:center;">
          <p style="font-size:18px;font-weight:800;color:#15803D;margin:0;">${metrics.installedQty.toLocaleString()}</p>
          <p style="font-size:8px;color:#777;text-transform:uppercase;font-weight:600;margin:2px 0 0;">Installed</p>
        </div>
        <div style="border:1px solid #ddd;border-radius:6px;padding:10px;text-align:center;">
          <p style="font-size:18px;font-weight:800;color:#B45309;margin:0;">${metrics.avgTurnaround}d</p>
          <p style="font-size:8px;color:#777;text-transform:uppercase;font-weight:600;margin:2px 0 0;">Avg Turnaround</p>
        </div>
        <div style="border:1px solid #ddd;border-radius:6px;padding:10px;text-align:center;border-left:3px solid #800000;">
          <p style="font-size:18px;font-weight:800;color:#800000;margin:0;">${metrics.installRate}%</p>
          <p style="font-size:8px;color:#777;text-transform:uppercase;font-weight:600;margin:2px 0 0;">Install Rate</p>
        </div>
      </div>
    `
    
    // Progress bar
    const progressHTML = `
      <div style="border:1px solid #ddd;border-radius:6px;padding:12px;margin-bottom:16px;">
        <h3 style="font-size:11px;font-weight:700;color:#333;margin:0 0 8px;">Hardware Delivery Fulfillment</h3>
        <div style="width:100%;background:#E5E5E5;border-radius:6px;height:14px;overflow:hidden;">
          <div style="width:${metrics.installRate}%;background:#800000;height:14px;border-radius:6px;"></div>
        </div>
        <p style="font-size:10px;color:#666;margin:6px 0 0;">${metrics.installedQty.toLocaleString()} of ${metrics.totalQty.toLocaleString()} installed (${metrics.installRate}%)</p>
      </div>
    `
    
    // Backlog cards
    const backlogHTML = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;">
        <div style="border:1px solid #BBF7D0;border-radius:6px;padding:10px;background:#F0FDF4;">
          <p style="font-size:16px;font-weight:800;color:#15803D;margin:0;">${metrics.healthy.toLocaleString()}</p>
          <p style="font-size:8px;color:#166534;font-weight:600;text-transform:uppercase;margin:2px 0 0;">Healthy</p>
        </div>
        <div style="border:1px solid #FDE68A;border-radius:6px;padding:10px;background:#FFFBEB;">
          <p style="font-size:16px;font-weight:800;color:#B45309;margin:0;">${metrics.warning.toLocaleString()}</p>
          <p style="font-size:8px;color:#92400E;font-weight:600;text-transform:uppercase;margin:2px 0 0;">Warning</p>
        </div>
        <div style="border:1px solid #FECACA;border-radius:6px;padding:10px;background:#FEF2F2;">
          <p style="font-size:16px;font-weight:800;color:#B91C1C;margin:0;">${metrics.critical.toLocaleString()}</p>
          <p style="font-size:8px;color:#991B1B;font-weight:600;text-transform:uppercase;margin:2px 0 0;">Critical</p>
        </div>
        <div style="border:1px solid #E8D0D0;border-radius:6px;padding:10px;background:#FDF7F7;">
          <p style="font-size:16px;font-weight:800;color:#800000;margin:0;">${metrics.done.toLocaleString()}</p>
          <p style="font-size:8px;color:#800000;font-weight:600;text-transform:uppercase;margin:2px 0 0;">Done</p>
        </div>
      </div>
    `
    
    // SVG Donut chart generator
    const createDonutChart = (data, title) => {
      const total = data.reduce((sum, d) => sum + d.value, 0)
      if (total === 0) return ''
      
      const size = 140
      const strokeWidth = 26
      const radius = (size - strokeWidth) / 2
      const cx = size / 2
      const cy = size / 2
      const circumference = 2 * Math.PI * radius
      
      let offset = 0
      let segmentsHTML = ''
      
      data.forEach((d, i) => {
        const pct = d.value / total
        const dashLength = pct * circumference
        const rotation = offset * 360
        segmentsHTML += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${COLORS[i % COLORS.length]}" stroke-width="${strokeWidth}" stroke-dasharray="${dashLength} ${circumference - dashLength}" transform="rotate(-90 ${cx} ${cy})" stroke-dashoffset="${-rotation * circumference / 360}" />`
        offset += pct
      })
      
      let legendHTML = ''
      data.forEach((d, i) => {
        legendHTML += `<div style="display:flex;align-items:center;gap:5px;margin-bottom:3px;"><div style="width:10px;height:10px;border-radius:2px;background:${COLORS[i % COLORS.length]};flex-shrink:0;"></div><span style="font-size:8px;color:#666;">${d.name}: <strong>${d.value.toLocaleString()}</strong> (${((d.value / total) * 100).toFixed(1)}%)</span></div>`
      })
      
      return `
        <div style="border:1px solid #ddd;border-radius:6px;padding:15px;page-break-inside:avoid;display:flex;align-items:center;gap:15px;min-height:170px;">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="flex-shrink:0;">
            ${segmentsHTML}
            <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" style="font-size:16px;font-weight:800;fill:#333;font-family:Arial,sans-serif;">${total.toLocaleString()}</text>
          </svg>
          <div style="flex:1;min-width:0;">
            <h3 style="font-size:12px;font-weight:700;color:#333;margin:0 0 8px;">${title}</h3>
            ${legendHTML}
          </div>
        </div>
      `
    }
    
    // SVG Bar chart generator with grid lines and value labels
    const createBarChart = (data, title, color) => {
      const maxVal = Math.max(...data.map(d => d.value), 1)
      const chartHeight = 200
      const chartWidth = 500
      const barAreaWidth = chartWidth - 40
      const barCount = data.length
      const barWidth = (barAreaWidth / barCount) * 0.7
      const gap = (barAreaWidth / barCount) * 0.3
      const paddingLeft = 10
      const paddingBottom = 25
      const paddingTop = 10
      const plotHeight = chartHeight - paddingBottom - paddingTop
      
      // Grid lines (5 horizontal lines)
      let gridLinesHTML = ''
      for (let g = 0; g <= 4; g++) {
        const gridY = paddingTop + (plotHeight * g / 4)
        const gridVal = Math.round(maxVal * (4 - g) / 4)
        gridLinesHTML += `<line x1="${paddingLeft}" y1="${gridY}" x2="${chartWidth - 10}" y2="${gridY}" stroke="#e0e0e0" stroke-width="1" />`
        gridLinesHTML += `<text x="${paddingLeft - 5}" y="${gridY + 3}" text-anchor="end" style="font-size:8px;fill:#999;font-family:Arial,sans-serif;">${gridVal}</text>`
      }
      
      // Bars with value labels
      let barsHTML = ''
      data.forEach((d, i) => {
        const barHeight = (d.value / maxVal) * plotHeight
        const x = paddingLeft + i * (barWidth + gap) + gap / 2
        const y = paddingTop + plotHeight - barHeight
        barsHTML += `<rect x="${x}" y="${y}" width="${barWidth}" height="${Math.max(barHeight, 2)}" fill="${color}" rx="3" />`
        if (d.value > 0) {
          barsHTML += `<text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" style="font-size:9px;font-weight:700;fill:#333;font-family:Arial,sans-serif;">${d.value.toLocaleString()}</text>`
        }
        barsHTML += `<text x="${x + barWidth / 2}" y="${chartHeight - 8}" text-anchor="middle" style="font-size:8px;fill:#666;font-family:Arial,sans-serif;">${d.name}</text>`
      })
      
      return `
        <div style="border:1px solid #ddd;border-radius:6px;padding:15px;page-break-inside:avoid;">
          <h3 style="font-size:12px;font-weight:700;color:#333;margin:0 0 10px;">${title}</h3>
          <svg width="100%" viewBox="0 0 ${chartWidth} ${chartHeight}" style="max-width:100%;">
            ${gridLinesHTML}
            <line x1="${paddingLeft}" y1="${paddingTop + plotHeight}" x2="${chartWidth - 10}" y2="${paddingTop + plotHeight}" stroke="#ccc" stroke-width="1" />
            ${barsHTML}
          </svg>
        </div>
      `
    }
    
    // Build charts HTML
    const deliveryChartHTML = createBarChart(metrics.deliveryData, 'Volume by Delivery Month', '#800000')
    const installChartHTML = createBarChart(metrics.installData, 'Volume by Install Month', '#1E3A5F')
    const statusChartHTML = createDonutChart(metrics.statusData, 'Installation Status')
    const regionChartHTML = createDonutChart(metrics.regionData.slice(0, 8), 'Regional Allocation')
    const backlogChartHTML = metrics.backlogData.length > 0 ? createDonutChart(metrics.backlogData, 'Backlog Origin Mix') : ''
    
    // Leaderboard table
    let leaderboardRows = ''
    metrics.leaderboard.forEach((eng, i) => {
      leaderboardRows += `
        <tr>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:center;">
            <span style="display:inline-block;width:22px;height:22px;border-radius:6px;font-size:10px;font-weight:800;${i < 3 ? 'background:#800000;color:#fff;' : 'background:#f0f0f0;color:#666;'}">${i+1}</span>
          </td>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:10px;font-weight:600;color:#333;">${eng.name}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:10px;text-align:center;color:#800000;font-weight:700;">${(eng.backlogDone || 0).toLocaleString()}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:10px;text-align:center;color:#666;">${eng.count || 0}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:10px;text-align:center;color:#666;">${(eng.volume || 0).toLocaleString()}</td>
        </tr>
      `
    })
    
    const leaderboardHTML = `
      <div style="border:1px solid #ddd;border-radius:6px;padding:12px;page-break-inside:avoid;">
        <h3 style="font-size:11px;font-weight:700;color:#800000;margin:0 0 8px;">🏆 Engineer Leaderboard</h3>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="background:#f5f5f5;padding:6px 8px;font-size:8px;text-transform:uppercase;color:#777;text-align:center;">#</th>
              <th style="background:#f5f5f5;padding:6px 8px;font-size:8px;text-transform:uppercase;color:#777;text-align:left;">Engineer</th>
              <th style="background:#f5f5f5;padding:6px 8px;font-size:8px;text-transform:uppercase;color:#777;text-align:center;">Done</th>
              <th style="background:#f5f5f5;padding:6px 8px;font-size:8px;text-transform:uppercase;color:#777;text-align:center;">Tasks</th>
              <th style="background:#f5f5f5;padding:6px 8px;font-size:8px;text-transform:uppercase;color:#777;text-align:center;">Volume</th>
            </tr>
          </thead>
          <tbody>${leaderboardRows}</tbody>
        </table>
      </div>
    `
    
    const printWindow = window.open('', '_blank', 'width=1200,height=800')
    if (!printWindow) { alert('Popup blocked. Please allow popups.') ; return }
    
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${title}</title>`)
    printWindow.document.write(`<style>`)
    printWindow.document.write(`@page { size: A4 landscape; margin: 10mm; }`)
    printWindow.document.write(`body { font-family: Arial, sans-serif; margin: 0; padding: 15px; color: #1A1A1A; }`)
    printWindow.document.write(`h1 { color: #800000; font-size: 18px; margin: 0 0 4px 0; border-bottom: 2px solid #800000; padding-bottom: 6px; }`)
    printWindow.document.write(`.filter-label { font-size: 10px; color: #666; margin-bottom: 12px; }`)
    printWindow.document.write(`* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }`)
    printWindow.document.write(`</style></head><body>`)
    printWindow.document.write(`<h1>${title}</h1>`)
    printWindow.document.write(`<p class="filter-label">${filterLabel}</p>`)
    printWindow.document.write(kpiCardsHTML)
    printWindow.document.write(progressHTML)
    printWindow.document.write(backlogHTML)
    
    // Charts in 2-column layout
    printWindow.document.write(`<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">`)
    printWindow.document.write(deliveryChartHTML)
    printWindow.document.write(installChartHTML)
    printWindow.document.write(`</div>`)
    
    printWindow.document.write(`<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">`)
    printWindow.document.write(statusChartHTML)
    printWindow.document.write(regionChartHTML)
    printWindow.document.write(`</div>`)
    
    printWindow.document.write(backlogChartHTML)
    printWindow.document.write(leaderboardHTML)
    printWindow.document.write(`</body></html>`)
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gray-200 border-t-maroon rounded-full animate-spin" /></div>
  if (error) return <div className="bg-white rounded-xl border border-gray-100 p-20 text-center"><p className="text-red-500">{error}</p></div>

  return (
    <div>
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