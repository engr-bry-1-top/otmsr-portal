import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Save, Trash2, Printer, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

const ENGINEER_COLORS = {
  'NOWIEL T GONZALES': '#b7e1cd', 'ROBNELL V. DE LA CRUZ': '#fa7ee5',
  'JOHN FELIX C ARABIT': '#e07070', 'JOHN PAUL T BAUTISTA': '#ffc000',
  'KEITH FERN AMOR': '#00b0f0', 'JOSHUA C VELASCO': '#92d050',
  'REYNALDO T VILLA': '#a17b35', 'GERSON S SACRAMENTO': '#ffff00',
  'BRIAN EZEKIEL D BATALON': '#00b050'
}

const SHORT_NAMES = {
  'NOWIEL T GONZALES': 'N. Gonzales', 'ROBNELL V. DE LA CRUZ': 'R. De la Cruz',
  'JOHN FELIX C ARABIT': 'J. Arabit', 'JOHN PAUL T BAUTISTA': 'J. Bautista',
  'KEITH FERN AMOR': 'K. Amor', 'JOSHUA C VELASCO': 'J. Velasco',
  'REYNALDO T VILLA': 'R. Villa', 'GERSON S SACRAMENTO': 'G. Sacramento',
  'BRIAN EZEKIEL D BATALON': 'B. Batalon'
}

const ENGINEERS = [
  'Nowiel T. Gonzales',
  'Robnell V. De la Cruz',
  'John Felix C. Arabit',
  'John Paul T. Bautista',
  'Keith Fern Amor',
  'Joshua C. Velasco',
  'Reynaldo T. Villa',
  'Gerson S. Sacramento',
  'Brian Ezekiel D. Batalon'
]

const ADMIN_USERS = ['rob.onetop', 'josh.onetop', 'bry.onetop']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function COACalendar() {
  const currentDate = new Date()
  const currentMonthName = MONTHS[currentDate.getMonth()]
  const currentYearString = currentDate.getFullYear().toString()

  const [month, setMonth] = useState(currentMonthName)
  const [year, setYear] = useState(currentYearString)
  const [assignments, setAssignments] = useState({})
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [editModal, setEditModal] = useState(null)
  const [editText, setEditText] = useState('')
  const [selectedEngs, setSelectedEngs] = useState([])
  const [saving, setSaving] = useState(false)
  const [savingProgress, setSavingProgress] = useState('')
  const [deleteMode, setDeleteMode] = useState(false)
  const [initModal, setInitModal] = useState(false)
  const [useDateRange, setUseDateRange] = useState(false)
  const [endDay, setEndDay] = useState('')

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('otmsr_user')
    if (stored) {
      const user = JSON.parse(stored)
      setIsAdmin(user.role === 'admin' || ADMIN_USERS.includes(user.username))
    }
    fetchCOA()
  }, [month, year])

  const fetchCOA = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('coa_activities')
        .select('engineer, day, activity')
        .eq('month_name', month)
        .eq('year', parseInt(year))
      
      const map = {}
      if (data) {
        data.forEach(row => {
          if (!map[row.engineer]) map[row.engineer] = {}
          if (row.activity) map[row.engineer][String(row.day)] = row.activity
        })
      }
      setAssignments(map)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const daysInMonth = new Date(parseInt(year), MONTHS.indexOf(month) + 1, 0).getDate()
  const firstDay = new Date(parseInt(year), MONTHS.indexOf(month), 1).getDay()
  const trailingCells = (7 - ((firstDay + daysInMonth) % 7)) % 7

  const normalizeName = (name) => {
    return name?.toUpperCase().replace(/\./g, '').replace(/\s+/g, ' ').trim() || ''
  }

  const getColor = (name) => {
    const n = normalizeName(name)
    for (const key in ENGINEER_COLORS) {
      if (normalizeName(key) === n) return ENGINEER_COLORS[key]
    }
    const lastName = n.split(' ').pop()
    for (const key in ENGINEER_COLORS) {
      if (normalizeName(key).endsWith(lastName)) return ENGINEER_COLORS[key]
    }
    return '#cccccc'
  }

  const getShortName = (name) => {
    const n = normalizeName(name)
    for (const key in SHORT_NAMES) {
      if (normalizeName(key) === n) return SHORT_NAMES[key]
    }
    const parts = name?.split(' ')
    if (!parts || parts.length < 2) return name
    return parts[0].charAt(0) + '. ' + parts[parts.length - 1]
  }

  const getDayActivities = (day) => {
    const groups = {}
    ENGINEERS.forEach(eng => {
      const act = assignments[eng]?.[String(day)]
      if (act) {
        if (!groups[act]) groups[act] = []
        groups[act].push(eng)
      }
    })
    return groups
  }

  const openEditModal = (day, existingAct = '', existingEngs = []) => {
    setDeleteMode(false)
    setEditModal({ day })
    setEditText(existingAct)
    setSelectedEngs(existingEngs)
    setUseDateRange(false)
    setEndDay('')
  }

  const toggleEngineer = (eng) => {
    setSelectedEngs(prev => prev.includes(eng) ? prev.filter(e => e !== eng) : [...prev, eng])
  }

  const saveActivity = async () => {
    if (!editText.trim()) return
    setSaving(true)
    setSavingProgress('Saving...')
    
    try {
      const startDay = editModal.day
      const finishDay = useDateRange && endDay ? parseInt(endDay) : startDay
      
      if (useDateRange && endDay && parseInt(endDay) < startDay) {
        alert('End day must be after start day')
        setSaving(false)
        setSavingProgress('')
        return
      }
      
      const daysToSave = []
      for (let d = startDay; d <= finishDay; d++) {
        daysToSave.push(d)
      }
      
      const originallyAssigned = []
      ENGINEERS.forEach(eng => {
        if (assignments[eng]?.[String(editModal.day)] === editText) {
          originallyAssigned.push(eng)
        }
      })
      
      const toKeep = selectedEngs
      const toRemove = originallyAssigned.filter(e => !toKeep.includes(e))
      
      // Save for checked engineers across the date range
      for (const eng of toKeep) {
        for (const d of daysToSave) {
          await supabase.from('coa_activities').upsert({
            month_name: month,
            year: parseInt(year),
            engineer: eng,
            day: d,
            activity: editText,
            updated_at: new Date().toISOString()
          }, { onConflict: 'month_name,year,engineer,day' })
        }
      }
      
      // Clear for unchecked engineers (only for the original day)
      for (const eng of toRemove) {
        await supabase.from('coa_activities')
          .update({ activity: '', updated_at: new Date().toISOString() })
          .eq('month_name', month)
          .eq('year', parseInt(year))
          .eq('engineer', eng)
          .eq('day', editModal.day)
      }
      
      setEditModal(null)
      setDeleteMode(false)
      setUseDateRange(false)
      setEndDay('')
      fetchCOA()
    } catch (err) { console.error(err) }
    setSaving(false)
    setSavingProgress('')
  }

  const deleteActivity = async () => {
    if (selectedEngs.length === 0) return
    setSaving(true)
    setSavingProgress('Removing...')
    try {
      for (const eng of selectedEngs) {
        await supabase.from('coa_activities')
          .delete()
          .eq('month_name', month)
          .eq('year', parseInt(year))
          .eq('engineer', eng)
          .eq('day', editModal.day)
      }
      setEditModal(null)
      setDeleteMode(false)
      fetchCOA()
    } catch (err) { console.error(err) }
    setSaving(false)
    setSavingProgress('')
  }

  const deleteAllDay = async () => {
    if (!confirm(`Delete ALL activities for ${month} ${editModal.day}, ${year}? This cannot be undone.`)) return
    setSaving(true)
    setSavingProgress('Removing...')
    try {
      await supabase.from('coa_activities')
        .delete()
        .eq('month_name', month)
        .eq('year', parseInt(year))
        .eq('day', editModal.day)
      setEditModal(null)
      setDeleteMode(false)
      fetchCOA()
    } catch (err) { console.error(err) }
    setSaving(false)
    setSavingProgress('')
  }

  const initializeMonth = async () => {
    const nextIdx = (MONTHS.indexOf(month) + 1) % 12
    const nextMonth = MONTHS[nextIdx]
    const nextYear = nextIdx === 0 ? parseInt(year) + 1 : parseInt(year)
    
    setSaving(true)
    setSavingProgress('Initializing month...')
    
    try {
      for (const eng of ENGINEERS) {
        for (let d = 1; d <= 31; d++) {
          await supabase.from('coa_activities').upsert({
            month_name: nextMonth,
            year: nextYear,
            engineer: eng,
            day: d,
            activity: '',
            updated_at: new Date().toISOString()
          }, { onConflict: 'month_name,year,engineer,day' })
        }
      }
      setInitModal(false)
      setMonth(nextMonth)
      setYear(nextYear.toString())
    } catch (err) { console.error(err) }
    setSaving(false)
    setSavingProgress('')
  }

  const handlePrint = () => {
    const title = `Calendar of Activities — ${month} ${year}`
    
    let legendHTML = ''
    ENGINEERS.forEach(eng => {
      legendHTML += `<div style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;padding:3px 6px;border:1px solid #ccc;border-radius:3px;background:#fff;margin:2px;">
        <div style="width:10px;height:10px;border-radius:2px;background:${getColor(eng)};"></div>
        ${getShortName(eng)}
      </div>`
    })
    
    let calHTML = `<div style="display:grid;grid-template-columns:repeat(7,1fr);border:1px solid #000;">`
    
    DAY_NAMES.forEach((d, i) => {
      calHTML += `<div style="background:${i === 0 || i === 6 ? '#600000' : '#800000'};color:#fff;font-weight:700;padding:6px 3px;text-align:center;font-size:11px;-webkit-print-color-adjust:exact;print-color-adjust:exact;">${d}</div>`
    })
    
    for (let i = 0; i < firstDay; i++) {
      calHTML += `<div style="background:#F0F0F0;border:1px solid #ccc;min-height:60px;"></div>`
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      const col = (firstDay + d - 1) % 7
      const isWeekend = col === 0 || col === 6
      const activities = getDayActivities(d)
      const actEntries = Object.entries(activities)
      
      let cellContent = `<span style="font-size:11px;font-weight:700;color:${isWeekend ? '#CC0000' : '#1A1A1A'};">${d}</span>`
      
      actEntries.forEach(([act, engs]) => {
        let badges = ''
        engs.forEach(e => {
          badges += `<span style="display:inline-block;padding:1px 4px;border-radius:2px;font-size:7px;font-weight:700;background:${getColor(e)};color:#1A1A1A;margin:0 1px;">${getShortName(e)}</span>`
        })
        cellContent += `<div style="padding:3px 4px;margin:2px 0;border-radius:3px;border:1px solid #ddd;background:#fff;">
          <div style="display:flex;flex-wrap:wrap;gap:2px;margin-bottom:2px;">${badges}</div>
          <span style="font-size:7px;color:#404040;display:block;word-break:break-word;">${act}</span>
        </div>`
      })
      
      calHTML += `<div style="border:1px solid #ccc;padding:4px;min-height:60px;background:${isWeekend ? '#FAFAFA' : '#fff'};vertical-align:top;font-size:7px;">${cellContent}</div>`
    }
    
    for (let i = 0; i < (isNaN(trailingCells) ? 0 : trailingCells); i++) {
      calHTML += `<div style="background:#F0F0F0;border:1px solid #ccc;min-height:60px;"></div>`
    }
    
    calHTML += `</div>`
    
    const printWindow = window.open('', '_blank', 'width=1200,height=800')
    if (!printWindow) { alert('Popup blocked. Please allow popups.') ; return }
    
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${title}</title>`)
    printWindow.document.write(`<style>`)
    printWindow.document.write(`@page { size: A4 landscape; margin: 8mm; }`)
    printWindow.document.write(`body { font-family: Arial, sans-serif; margin: 0; padding: 10px; }`)
    printWindow.document.write(`h2 { color: #800000; font-size: 14px; margin-bottom: 6px; }`)
    printWindow.document.write(`.legend-wrap { display: flex; flex-wrap: wrap; gap: 2px; margin-bottom: 8px; }`)
    printWindow.document.write(`* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }`)
    printWindow.document.write(`</style></head><body>`)
    printWindow.document.write(`<h2>${title}</h2>`)
    printWindow.document.write(`<div class="legend-wrap">${legendHTML}</div>`)
    printWindow.document.write(calHTML)
    printWindow.document.write(`</body></html>`)
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-maroon rounded-full animate-spin" />
    </div>
  )

  const iconBtnStyle = {
    background: '#fff', color: '#800000', border: '1.5px solid #800000',
    borderRadius: '8px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: isMobile ? '0.5rem' : '0.35rem 0.5rem',
    minWidth: isMobile ? '40px' : 'auto',
    minHeight: isMobile ? '40px' : 'auto',
  }

  const selectStyle = {
    padding: isMobile ? '0.5rem 0.5rem' : '0.35rem 0.6rem',
    border: '1.5px solid #E5E5E5', borderRadius: '8px',
    fontSize: isMobile ? '0.85rem' : '0.75rem',
    background: '#fff', cursor: 'pointer',
    minHeight: isMobile ? '40px' : 'auto',
  }

  return (
    <div style={{ padding: isMobile ? '0.25rem' : '0.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: isMobile ? '0.4rem' : '0.5rem',
        flexWrap: 'wrap', gap: isMobile ? '0.3rem' : '0.5rem',
      }}>
        <h2 style={{ fontSize: isMobile ? '0.85rem' : '1rem', fontWeight: 700, color: '#800000', margin: 0 }}>
          📅 Calendar of Activities
        </h2>

        <div style={{ display: 'flex', gap: isMobile ? '0.3rem' : '0.4rem', alignItems: 'center', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          <button onClick={() => { const i = MONTHS.indexOf(month); if (i > 0) setMonth(MONTHS[i-1]) }} style={iconBtnStyle}>
            <ChevronLeft size={isMobile ? 20 : 14} />
          </button>
          <button onClick={() => { const i = MONTHS.indexOf(month); if (i < 11) setMonth(MONTHS[i+1]) }} style={iconBtnStyle}>
            <ChevronRight size={isMobile ? 20 : 14} />
          </button>

          <select value={month} onChange={e => setMonth(e.target.value)} style={selectStyle}>
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(e.target.value)} style={selectStyle}>
            {['2024','2025','2026','2027','2028'].map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <button onClick={handlePrint} style={{ ...iconBtnStyle, gap: '0.3rem', fontSize: isMobile ? '0.8rem' : '0.7rem', fontWeight: 600 }}>
            <Printer size={isMobile ? 18 : 14} />
            {isMobile ? '' : 'PDF'}
          </button>

          {isAdmin && (
            <button onClick={() => setInitModal(true)} style={{
              background: '#800000', color: '#fff', borderRadius: '8px', cursor: 'pointer', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
              padding: isMobile ? '0.5rem 0.7rem' : '0.35rem 0.7rem',
              fontSize: isMobile ? '0.8rem' : '0.7rem', fontWeight: 600,
              minHeight: isMobile ? '40px' : 'auto',
            }}>
              <Plus size={isMobile ? 18 : 14} />
              {isMobile ? 'New Month' : 'Create Next Month'}
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: isMobile ? '0.2rem' : '0.3rem',
        marginBottom: isMobile ? '0.4rem' : '0.5rem',
        maxHeight: isMobile ? '60px' : 'none', overflowY: isMobile ? 'auto' : 'visible',
      }}>
        {ENGINEERS.map(eng => (
          <div key={eng} style={{
            display: 'flex', alignItems: 'center', gap: '0.2rem',
            fontSize: isMobile ? '0.6rem' : '0.55rem', fontWeight: 600,
            padding: isMobile ? '0.2rem 0.4rem' : '0.15rem 0.35rem',
            borderRadius: '3px', background: '#fff', border: '1px solid #E5E5E5',
          }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: getColor(eng), flexShrink: 0 }} />
            {getShortName(eng)}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: '8px', overflow: 'hidden', overflowX: 'auto' }}>
        <div style={{ minWidth: isMobile ? '700px' : '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', position: 'sticky', top: 0, zIndex: 10 }}>
            {DAY_NAMES.map((d, i) => (
              <div key={d} style={{
                background: i === 0 || i === 6 ? '#600000' : '#800000', color: '#fff', fontWeight: 700,
                padding: isMobile ? '0.4rem 0.2rem' : '0.5rem 0.2rem', textAlign: 'center',
                fontSize: isMobile ? '0.75rem' : '0.7rem',
              }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} style={{
                background: '#F0F0F0', borderBottom: '1px solid #E5E5E5', borderLeft: '1px solid #E5E5E5',
                minHeight: isMobile ? '70px' : '100px',
              }} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const col = (firstDay + i) % 7
              const isWeekend = col === 0 || col === 6
              const activities = getDayActivities(day)
              const actEntries = Object.entries(activities)

              return (
                <div key={day} style={{
                  borderBottom: '1px solid #E5E5E5', borderLeft: '1px solid #E5E5E5',
                  padding: isMobile ? '0.25rem' : '0.35rem', minHeight: isMobile ? '70px' : '100px',
                  background: isWeekend ? '#FAFAFA' : '#fff', fontSize: '0.5rem', position: 'relative',
                  overflow: 'hidden', cursor: isAdmin ? 'pointer' : 'default',
                }}
                onClick={() => isAdmin && openEditModal(day)}>
                  <span style={{
                    fontSize: isMobile ? '0.8rem' : '0.75rem', fontWeight: 700, display: 'inline-block',
                    marginBottom: '3px', padding: '1px 4px', borderRadius: '3px',
                    color: isWeekend ? '#CC0000' : '#1A1A1A',
                  }}>{day}</span>
                  {isAdmin && <Plus size={10} style={{ position: 'absolute', top: '4px', right: '4px', color: '#999', opacity: 0.5 }} />}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {actEntries.map(([act, engs]) => (
                      <div key={act}
                        onClick={(e) => { e.stopPropagation(); isAdmin ? openEditModal(day, act, engs) : setExpanded({ day, act, engs }) }}
                        style={{
                          padding: '4px 5px', borderRadius: '5px', border: '1px solid #E5E5E5',
                          background: '#fff', cursor: 'pointer', lineHeight: 1.3, transition: 'all 0.15s',
                        }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginBottom: '2px' }}>
                          {engs.map(e => (
                            <span key={e} style={{
                              padding: '1px 4px', borderRadius: '3px', fontSize: '0.5rem', fontWeight: 700,
                              background: getColor(e), color: '#1A1A1A',
                            }}>{getShortName(e)}</span>
                          ))}
                        </div>
                        <span style={{ fontSize: '0.5rem', fontWeight: 500, color: '#404040', wordBreak: 'break-word' }}>
                          {act.length > 25 ? act.slice(0, 25) + '...' : act}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {Array.from({ length: isNaN(trailingCells) ? 0 : trailingCells }).map((_, i) => (
              <div key={`trailing-${i}`} style={{
                background: '#F0F0F0', borderBottom: '1px solid #E5E5E5', borderLeft: '1px solid #E5E5E5',
                minHeight: isMobile ? '70px' : '100px',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* View Modal */}
      {expanded && !isAdmin && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9997,
          display: 'flex', justifyContent: 'center', alignItems: isMobile ? 'flex-end' : 'center',
          padding: isMobile ? 0 : '1rem',
        }} onClick={() => setExpanded(null)}>
          <div style={{
            background: '#fff', borderRadius: isMobile ? '16px 16px 0 0' : '14px',
            padding: isMobile ? '1.25rem' : '2rem', maxWidth: '600px', width: '100%',
            maxHeight: isMobile ? '85vh' : '80vh', overflowY: 'auto',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            {isMobile && <div style={{ width: '40px', height: '4px', background: '#E5E5E5', borderRadius: '2px', margin: '0 auto 0.75rem' }} />}
            <div style={{ fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 700, color: '#800000', marginBottom: '0.75rem' }}>
              {month} {expanded.day}, {year}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
              {expanded.engs.map(e => (
                <span key={e} style={{
                  padding: isMobile ? '0.3rem 0.6rem' : '0.4rem 0.8rem', borderRadius: '6px',
                  fontSize: isMobile ? '0.8rem' : '0.9rem', fontWeight: 700,
                  background: getColor(e), color: '#1A1A1A',
                }}>{e}</span>
              ))}
            </div>
            <div style={{
              fontSize: isMobile ? '0.9rem' : '1rem', color: '#404040', lineHeight: 1.6,
              padding: '0.75rem', background: '#FAFAFA', borderRadius: '8px',
            }}>{expanded.act}</div>
            <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
              <button onClick={() => setExpanded(null)} style={{
                background: '#fff', color: '#800000', border: '1.5px solid #800000',
                padding: isMobile ? '0.6rem 1rem' : '0.35rem 0.7rem', borderRadius: '8px',
                fontSize: isMobile ? '0.9rem' : '0.7rem', fontWeight: 600, cursor: 'pointer',
                width: isMobile ? '100%' : 'auto',
              }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && isAdmin && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998,
          display: 'flex', justifyContent: 'center', alignItems: isMobile ? 'flex-end' : 'center',
          padding: isMobile ? 0 : '1rem',
        }} onClick={() => { setEditModal(null); setDeleteMode(false); setUseDateRange(false); setEndDay('') }}>
          <div style={{
            background: '#fff', borderRadius: isMobile ? '16px 16px 0 0' : '12px',
            padding: isMobile ? '1.25rem' : '1.5rem', width: '100%', maxWidth: '500px',
            maxHeight: isMobile ? '90vh' : '80vh', overflowY: 'auto',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            {isMobile && <div style={{ width: '40px', height: '4px', background: '#E5E5E5', borderRadius: '2px', margin: '0 auto 0.75rem' }} />}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: isMobile ? '0.95rem' : '0.9rem', color: '#800000', margin: 0 }}>
                {deleteMode ? 'Delete Activity' : editText ? 'Edit Activity' : 'Add Activity'}
              </h3>
              <button onClick={() => { setEditModal(null); setDeleteMode(false); setUseDateRange(false); setEndDay('') }} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '4px',
              }}>
                <X size={isMobile ? 22 : 18} />
              </button>
            </div>
            <p style={{ fontSize: isMobile ? '0.8rem' : '0.7rem', color: '#737373', marginBottom: '0.75rem' }}>
              {month} {editModal.day}{useDateRange && endDay ? ` - ${endDay}` : ''}, {year}
            </p>

            {!deleteMode && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <div onClick={() => { setUseDateRange(!useDateRange); if (!useDateRange) setEndDay('') }} style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', userSelect: 'none',
                }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '4px',
                    border: `2px solid ${useDateRange ? '#800000' : '#D1D5DB'}`,
                    background: useDateRange ? '#800000' : '#fff',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '11px', fontWeight: 'bold',
                  }}>
                    {useDateRange ? '✓' : ''}
                  </div>
                  <span style={{ fontSize: isMobile ? '0.8rem' : '0.7rem', color: '#404040', fontWeight: 600 }}>
                    Extended Schedule (multiple days)
                  </span>
                </div>
                {useDateRange && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ fontSize: isMobile ? '0.75rem' : '0.65rem', color: '#737373' }}>End Day:</span>
                    <select value={endDay} onChange={e => setEndDay(e.target.value)} style={{
                      padding: '0.3rem', border: '1.5px solid #E5E5E5', borderRadius: '6px',
                      fontSize: isMobile ? '0.8rem' : '0.7rem', background: '#fff', cursor: 'pointer',
                    }}>
                      <option value="">Select</option>
                      {Array.from({ length: daysInMonth - editModal.day + 1 }).map((_, i) => {
                        const d = editModal.day + i
                        return <option key={d} value={d}>{d}</option>
                      })}
                    </select>
                  </div>
                )}
              </div>
            )}

            {!deleteMode ? (
              <>
                <label style={{ fontSize: isMobile ? '0.8rem' : '0.7rem', fontWeight: 600, color: '#737373', display: 'block', marginBottom: '0.25rem' }}>Assign Engineers:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {ENGINEERS.map(eng => {
                    const isSelected = selectedEngs.includes(eng)
                    return (
                      <div key={eng} onClick={() => toggleEngineer(eng)} style={{
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        fontSize: isMobile ? '0.8rem' : '0.7rem',
                        padding: isMobile ? '0.35rem 0.5rem' : '0.2rem 0.4rem',
                        borderRadius: '6px', cursor: 'pointer',
                        border: isSelected ? '2px solid #800000' : '1px solid #E5E5E5',
                        background: isSelected ? '#FDF7F7' : '#fff',
                        borderLeft: `4px solid ${getColor(eng)}`, userSelect: 'none',
                      }}>
                        <div style={{
                          width: '16px', height: '16px', minWidth: '16px', borderRadius: '4px',
                          border: `2px solid ${isSelected ? '#800000' : '#D1D5DB'}`,
                          background: isSelected ? '#800000' : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '10px', fontWeight: 'bold',
                        }}>
                          {isSelected ? '✓' : ''}
                        </div>
                        {eng}
                      </div>
                    )
                  })}
                </div>

                <label style={{ fontSize: isMobile ? '0.8rem' : '0.7rem', fontWeight: 600, color: '#737373', display: 'block', marginBottom: '0.25rem' }}>Activity Details:</label>
                <textarea value={editText} onChange={e => setEditText(e.target.value)}
                  placeholder="e.g., Santa Rosa Laguna - Installation & Demo"
                  style={{
                    width: '100%', padding: '0.5rem', border: '1.5px solid #E5E5E5', borderRadius: '8px',
                    fontSize: isMobile ? '0.9rem' : '0.75rem', fontFamily: 'inherit', resize: 'vertical',
                    minHeight: '60px', marginBottom: '0.5rem', boxSizing: 'border-box',
                  }} rows={3} />
              </>
            ) : (
              <>
                <p style={{ color: '#CC0000', fontWeight: 700, fontSize: isMobile ? '0.9rem' : '0.85rem', textAlign: 'center', margin: '0.5rem 0' }}>⚠️ This action cannot be undone.</p>
                <p style={{ color: '#B45309', fontSize: isMobile ? '0.8rem' : '0.7rem', textAlign: 'center', margin: '0.5rem 0', fontWeight: 600 }}>
                  Select engineers to remove from this schedule, or use "Delete All" to clear the entire day.
                </p>
                <label style={{ fontSize: isMobile ? '0.8rem' : '0.7rem', fontWeight: 600, color: '#737373', display: 'block', marginBottom: '0.25rem' }}>Select engineers to remove:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {ENGINEERS.map(eng => {
                    const isSelected = selectedEngs.includes(eng)
                    return (
                      <div key={eng} onClick={() => toggleEngineer(eng)} style={{
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        fontSize: isMobile ? '0.8rem' : '0.7rem',
                        padding: isMobile ? '0.35rem 0.5rem' : '0.2rem 0.4rem',
                        borderRadius: '6px', cursor: 'pointer',
                        border: isSelected ? '2px solid #CC0000' : '1px solid #E5E5E5',
                        background: isSelected ? '#FEF2F2' : '#fff',
                        borderLeft: `4px solid ${getColor(eng)}`, userSelect: 'none',
                      }}>
                        <div style={{
                          width: '16px', height: '16px', minWidth: '16px', borderRadius: '4px',
                          border: `2px solid ${isSelected ? '#CC0000' : '#D1D5DB'}`,
                          background: isSelected ? '#CC0000' : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '10px', fontWeight: 'bold',
                        }}>
                          {isSelected ? '✓' : ''}
                        </div>
                        {eng}
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={() => { setEditModal(null); setDeleteMode(false); setUseDateRange(false); setEndDay('') }} style={{
                background: '#fff', color: '#737373', border: '1.5px solid #E5E5E5',
                padding: isMobile ? '0.6rem 1rem' : '0.35rem 0.7rem', borderRadius: '8px',
                fontSize: isMobile ? '0.85rem' : '0.7rem', fontWeight: 600, cursor: 'pointer',
              }}>
                {deleteMode ? 'Go Back' : 'Cancel'}
              </button>

              {!deleteMode && editText && (
                <button onClick={() => setDeleteMode(true)} style={{
                  background: '#CC0000', color: '#fff', padding: isMobile ? '0.6rem 1rem' : '0.35rem 0.7rem',
                  borderRadius: '8px', fontSize: isMobile ? '0.85rem' : '0.7rem', fontWeight: 600,
                  cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}>
                  <Trash2 size={isMobile ? 18 : 14} /> Delete
                </button>
              )}

              {deleteMode && (
                <>
                  <button onClick={deleteActivity} disabled={selectedEngs.length === 0} style={{
                    background: '#B45309', color: '#fff', padding: isMobile ? '0.6rem 1rem' : '0.35rem 0.7rem',
                    borderRadius: '8px', fontSize: isMobile ? '0.85rem' : '0.7rem', fontWeight: 600,
                    cursor: 'pointer', border: 'none', opacity: selectedEngs.length === 0 ? 0.5 : 1,
                  }}>
                    Delete Selected
                  </button>
                  <button onClick={deleteAllDay} style={{
                    background: '#CC0000', color: '#fff', padding: isMobile ? '0.6rem 1rem' : '0.35rem 0.7rem',
                    borderRadius: '8px', fontSize: isMobile ? '0.85rem' : '0.7rem', fontWeight: 600,
                    cursor: 'pointer', border: 'none',
                  }}>
                    Delete All
                  </button>
                </>
              )}

              {!deleteMode && (
                <button onClick={saveActivity} disabled={saving} style={{
                  background: '#800000', color: '#fff', padding: isMobile ? '0.6rem 1rem' : '0.35rem 0.7rem',
                  borderRadius: '8px', fontSize: isMobile ? '0.85rem' : '0.7rem', fontWeight: 600,
                  cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem',
                  opacity: saving ? 0.6 : 1,
                }}>
                  <Save size={isMobile ? 18 : 14} /> {saving ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Initialize Month Modal */}
      {initModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998,
          display: 'flex', justifyContent: 'center', alignItems: isMobile ? 'flex-end' : 'center',
          padding: isMobile ? 0 : '1rem',
        }} onClick={() => setInitModal(false)}>
          <div style={{
            background: '#fff', borderRadius: isMobile ? '16px 16px 0 0' : '12px',
            padding: isMobile ? '1.25rem' : '1.5rem', width: '100%', maxWidth: '400px',
            textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            {isMobile && <div style={{ width: '40px', height: '4px', background: '#E5E5E5', borderRadius: '2px', margin: '0 auto 0.75rem' }} />}
            <h3 style={{ fontSize: isMobile ? '0.95rem' : '0.9rem', color: '#800000', marginBottom: '0.75rem' }}>Create New Month</h3>
            <p style={{ fontSize: isMobile ? '0.85rem' : '0.75rem', color: '#737373', marginBottom: '1rem' }}>
              Initialize <strong>{MONTHS[(MONTHS.indexOf(month) + 1) % 12]} {MONTHS.indexOf(month) === 11 ? parseInt(year) + 1 : year}</strong> with blank schedules for all 9 engineers?
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button onClick={() => setInitModal(false)} style={{
                background: '#fff', color: '#737373', border: '1.5px solid #E5E5E5',
                padding: isMobile ? '0.6rem 1rem' : '0.35rem 0.7rem', borderRadius: '8px',
                fontSize: isMobile ? '0.85rem' : '0.7rem', fontWeight: 600, cursor: 'pointer', flex: 1,
              }}>Cancel</button>
              <button onClick={initializeMonth} style={{
                background: '#800000', color: '#fff', padding: isMobile ? '0.6rem 1rem' : '0.35rem 0.7rem',
                borderRadius: '8px', fontSize: isMobile ? '0.85rem' : '0.7rem', fontWeight: 600,
                cursor: 'pointer', border: 'none', flex: 1,
              }}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saving overlay */}
      {saving && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.7)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          flexDirection: 'column', gap: '0.75rem',
        }}>
          <div style={{
            width: '40px', height: '40px', border: '3px solid #E5E5E5',
            borderTop: '3px solid #800000', borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#800000' }}>{savingProgress || 'Saving...'}</span>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}