import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Save, Trash2, Printer } from 'lucide-react'

const API_URL = 'https://script.google.com/macros/s/AKfycbwhqFi9pK9uzhDCqLc5mVhpokaA9HWB9f1HzQ5wRErTLTK181U4h0IHsqLw-6CWalU/exec'

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

const ADMIN_USERS = ['rob.onetop', 'josh.onetop', 'bry.onetop']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const YEARS = ['2024','2025','2026','2027','2028']

export default function COACalendar() {
  const [month, setMonth] = useState('July')
  const [year, setYear] = useState('2026')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const [editModal, setEditModal] = useState(null)
  const [editText, setEditText] = useState('')
  const [selectedEngs, setSelectedEngs] = useState([])
  const [saving, setSaving] = useState(false)
  const [savingProgress, setSavingProgress] = useState('')
  const [deleteMode, setDeleteMode] = useState(false)
  const [createMonthModal, setCreateMonthModal] = useState(false)

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
      const res = await fetch(`${API_URL}?api=coa&month=${encodeURIComponent(month)}`)
      const json = await res.json()
      setData(json)
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
    if (!data?.assignments) return {}
    const groups = {}
    data.engineers?.forEach(eng => {
      const act = data.assignments[eng]?.[String(day)]
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
  }

  const toggleEngineer = (eng) => {
    setSelectedEngs(prev => prev.includes(eng) ? prev.filter(e => e !== eng) : [...prev, eng])
  }

  const saveActivity = async () => {
    if (!editText.trim()) return
    setSaving(true)
    setSavingProgress('Saving...')
    
    try {
      // Find engineers currently assigned to THIS activity on THIS day
      const originallyAssigned = []
      if (data?.assignments) {
        data.engineers?.forEach(eng => {
          const act = data.assignments[eng]?.[String(editModal.day)]
          if (act === editText) {
            originallyAssigned.push(eng)
          }
        })
      }
      
      // Engineers to keep (still checked)
      const toKeep = selectedEngs
      
      // Engineers to remove (originally assigned but now unchecked)
      const toRemove = originallyAssigned.filter(e => !toKeep.includes(e))
      
      // Save for checked engineers
      for (const eng of toKeep) {
        await fetch(`${API_URL}?api=coa_save&month=${encodeURIComponent(month)}&engineer=${encodeURIComponent(eng)}&day=${editModal.day}&activity=${encodeURIComponent(editText)}`)
      }
      
      // Clear for unchecked engineers
      for (const eng of toRemove) {
        await fetch(`${API_URL}?api=coa_save&month=${encodeURIComponent(month)}&engineer=${encodeURIComponent(eng)}&day=${editModal.day}&activity=`)
      }
      
      setEditModal(null)
      setDeleteMode(false)
      fetchCOA()
    } catch (err) { console.error(err) }
    setSaving(false)
    setSavingProgress('')
  }

  const deleteActivity = async () => {
    if (selectedEngs.length === 0) return
    setSaving(true)
    setSavingProgress(`Removing 0/${selectedEngs.length}...`)
    let completed = 0
    try {
      for (const eng of selectedEngs) {
        await fetch(`${API_URL}?api=coa_save&month=${encodeURIComponent(month)}&engineer=${encodeURIComponent(eng)}&day=${editModal.day}&activity=`)
        completed++
        setSavingProgress(`Removing ${completed}/${selectedEngs.length}...`)
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
    const engineers = data?.engineers || []
    setSaving(true)
    setSavingProgress(`Removing 0/${engineers.length}...`)
    let completed = 0
    try {
      for (const eng of engineers) {
        await fetch(`${API_URL}?api=coa_save&month=${encodeURIComponent(month)}&engineer=${encodeURIComponent(eng)}&day=${editModal.day}&activity=`)
        completed++
        setSavingProgress(`Removing ${completed}/${engineers.length}...`)
      }
      setEditModal(null)
      setDeleteMode(false)
      fetchCOA()
    } catch (err) { console.error(err) }
    setSaving(false)
    setSavingProgress('')
  }

  const createNextMonth = async () => {
    const currentIdx = MONTHS.indexOf(month)
    const nextIdx = (currentIdx + 1) % 12
    const nextMonth = MONTHS[nextIdx]
    const nextYear = nextIdx === 0 ? (parseInt(year) + 1).toString() : year
    setSaving(true)
    setSavingProgress('Creating sheet...')
    try {
      const res = await fetch(`${API_URL}?api=coa_create_month&month=${encodeURIComponent(nextMonth)}`)
      const result = await res.text()
      if (result === 'OK') {
        setCreateMonthModal(false)
        setMonth(nextMonth)
        if (nextIdx === 0) setYear(nextYear)
      } else {
        alert(result)
      }
    } catch (err) { console.error(err) }
    setSaving(false)
    setSavingProgress('')
  }

  const handlePrint = () => window.print()

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-maroon rounded-full animate-spin" />
    </div>
  )

  return (
    <div style={{ padding: '0.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#800000', margin: 0 }}>
          📅 Calendar of Activities
        </h2>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {isAdmin && (
            <button onClick={() => setCreateMonthModal(true)}
              style={{ background: '#800000', color: '#fff', padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Plus size={14} /> Create Next Month
            </button>
          )}
          <button onClick={handlePrint}
            style={{ background: '#fff', color: '#800000', border: '1.5px solid #800000', padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Printer size={14} /> PDF
          </button>
          <select value={month} onChange={e => setMonth(e.target.value)}
            style={{ padding: '0.35rem 0.6rem', border: '1.5px solid #E5E5E5', borderRadius: '6px', fontSize: '0.75rem', background: '#fff', cursor: 'pointer' }}>
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(e.target.value)}
            style={{ padding: '0.35rem 0.6rem', border: '1.5px solid #E5E5E5', borderRadius: '6px', fontSize: '0.75rem', background: '#fff', cursor: 'pointer' }}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => { const i = MONTHS.indexOf(month); if (i > 0) setMonth(MONTHS[i-1]) }}
            style={{ background: '#fff', color: '#800000', border: '1.5px solid #800000', padding: '0.35rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => { const i = MONTHS.indexOf(month); if (i < 11) setMonth(MONTHS[i+1]) }}
            style={{ background: '#fff', color: '#800000', border: '1.5px solid #800000', padding: '0.35rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
        {data?.engineers?.map(eng => (
          <div key={eng} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.55rem', fontWeight: 600, padding: '0.15rem 0.35rem', borderRadius: '3px', background: '#fff', border: '1px solid #E5E5E5' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: getColor(eng), flexShrink: 0 }} />
            {getShortName(eng)}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {DAY_NAMES.map((d, i) => (
            <div key={d} style={{
              background: i === 0 || i === 6 ? '#600000' : '#800000',
              color: '#fff', fontWeight: 700, padding: '0.5rem 0.2rem',
              textAlign: 'center', fontSize: '0.7rem',
            }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} style={{
              background: '#F0F0F0', borderBottom: '1px solid #E5E5E5',
              borderLeft: '1px solid #E5E5E5', minHeight: '100px',
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
                padding: '0.35rem', minHeight: '100px',
                background: isWeekend ? '#FAFAFA' : '#fff',
                fontSize: '0.5rem', position: 'relative',
                overflow: 'hidden',
                cursor: isAdmin ? 'pointer' : 'default',
              }}
              onClick={() => isAdmin && openEditModal(day)}>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 700, display: 'inline-block',
                  marginBottom: '3px', padding: '1px 4px', borderRadius: '3px',
                  color: isWeekend ? '#CC0000' : '#1A1A1A',
                }}>{day}</span>
                {isAdmin && <Plus size={10} style={{ position: 'absolute', top: '4px', right: '4px', color: '#999', opacity: 0.5 }} />}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {actEntries.map(([act, engs]) => (
                    <div key={act}
                      onClick={(e) => { e.stopPropagation(); isAdmin ? openEditModal(day, act, engs) : setExpanded({ day, act, engs }) }}
                      style={{
                        padding: '4px 5px', borderRadius: '5px',
                        border: '1px solid #E5E5E5', background: '#fff',
                        cursor: 'pointer', lineHeight: 1.3,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginBottom: '2px' }}>
                        {engs.map(e => (
                          <span key={e} style={{
                            padding: '1px 4px', borderRadius: '3px',
                            fontSize: '0.5rem', fontWeight: 700,
                            background: getColor(e), color: '#1A1A1A',
                          }}>{getShortName(e)}</span>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.5rem', fontWeight: 500, color: '#404040', wordBreak: 'break-word' }}>
                        {act.length > 40 ? act.slice(0, 40) + '...' : act}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {Array.from({ length: isNaN(trailingCells) ? 0 : trailingCells }).map((_, i) => (
            <div key={`trailing-${i}`} style={{
              background: '#F0F0F0', borderBottom: '1px solid #E5E5E5',
              borderLeft: '1px solid #E5E5E5', minHeight: '100px',
            }} />
          ))}
        </div>
      </div>

      {/* View Modal (non-admin) */}
      {expanded && !isAdmin && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 9997, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem',
        }} onClick={() => setExpanded(null)}>
          <div style={{
            background: '#fff', borderRadius: '14px', padding: '2rem',
            maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#800000', marginBottom: '1rem' }}>{month} {expanded.day}, {year}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {expanded.engs.map(e => (
                <span key={e} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 700, background: getColor(e), color: '#1A1A1A' }}>{e}</span>
              ))}
            </div>
            <div style={{ fontSize: '1rem', color: '#404040', lineHeight: 1.6, padding: '1rem', background: '#FAFAFA', borderRadius: '8px' }}>{expanded.act}</div>
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <button onClick={() => setExpanded(null)} style={{ background: '#fff', color: '#800000', border: '1.5px solid #800000', padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (admin) */}
      {editModal && isAdmin && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 9998, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem',
        }} onClick={() => { setEditModal(null); setDeleteMode(false) }}>
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '1.5rem',
            width: '500px', maxWidth: '90%', maxHeight: '80vh', overflowY: 'auto',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '0.9rem', color: '#800000', marginBottom: '0.5rem' }}>
              {deleteMode ? 'Delete Activity' : editText ? 'Edit Activity' : 'Add Activity'}
            </h3>
            <p style={{ fontSize: '0.7rem', color: '#737373', marginBottom: '0.75rem' }}>
              {month} {editModal.day}, {year}
            </p>

            {!deleteMode ? (
              <>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#737373', display: 'block', marginBottom: '0.25rem' }}>Assign Engineers:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem', maxHeight: '150px', overflowY: 'auto' }}>
                  {data?.engineers?.map(eng => (
                    <label key={eng} onClick={() => toggleEngineer(eng)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem',
                      padding: '0.2rem 0.4rem', borderRadius: '4px', cursor: 'pointer',
                      border: selectedEngs.includes(eng) ? '1px solid #800000' : '1px solid #E5E5E5',
                      background: selectedEngs.includes(eng) ? '#FDF7F7' : '#fff',
                      borderLeft: `3px solid ${getColor(eng)}`,
                    }}>
                      <input type="checkbox" checked={selectedEngs.includes(eng)} onChange={() => {}} style={{ cursor: 'pointer' }} />
                      {eng}
                    </label>
                  ))}
                </div>

                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#737373', display: 'block', marginBottom: '0.25rem' }}>Activity Details:</label>
                <textarea value={editText} onChange={e => setEditText(e.target.value)}
                  placeholder="e.g., Santa Rosa Laguna - Installation & Demo"
                  style={{ width: '100%', padding: '0.5rem', border: '1.5px solid #E5E5E5', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'inherit', resize: 'vertical', minHeight: '60px', marginBottom: '0.5rem' }}
                  rows={3} />
              </>
            ) : (
              <>
                <p style={{ color: '#CC0000', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', margin: '0.5rem 0' }}>⚠️ This action cannot be undone.</p>
                <p style={{ color: '#B45309', fontSize: '0.7rem', textAlign: 'center', margin: '0.5rem 0', fontWeight: 600 }}>
                  Select engineers to remove from this schedule, or use "Delete All" to clear the entire day.
                </p>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#737373', display: 'block', marginBottom: '0.25rem' }}>Select engineers to remove:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem', maxHeight: '150px', overflowY: 'auto' }}>
                  {data?.engineers?.map(eng => (
                    <label key={eng} onClick={() => toggleEngineer(eng)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem',
                      padding: '0.2rem 0.4rem', borderRadius: '4px', cursor: 'pointer',
                      border: selectedEngs.includes(eng) ? '1px solid #CC0000' : '1px solid #E5E5E5',
                      background: selectedEngs.includes(eng) ? '#FEF2F2' : '#fff',
                      borderLeft: `3px solid ${getColor(eng)}`,
                    }}>
                      <input type="checkbox" checked={selectedEngs.includes(eng)} onChange={() => {}} style={{ cursor: 'pointer' }} />
                      {eng}
                    </label>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={() => { setEditModal(null); setDeleteMode(false) }}
                style={{ background: '#fff', color: '#737373', border: '1.5px solid #E5E5E5', padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>
                {deleteMode ? 'Go Back' : 'Cancel'}
              </button>

              {!deleteMode && editText && (
                <button onClick={() => setDeleteMode(true)}
                  style={{ background: '#CC0000', color: '#fff', padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Trash2 size={14} /> Delete
                </button>
              )}

              {deleteMode && (
                <>
                  <button onClick={deleteActivity} disabled={selectedEngs.length === 0}
                    style={{ background: '#B45309', color: '#fff', padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', border: 'none', opacity: selectedEngs.length === 0 ? 0.5 : 1 }}>
                    Delete Selected
                  </button>
                  <button onClick={deleteAllDay}
                    style={{ background: '#CC0000', color: '#fff', padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', border: 'none' }}>
                    Delete All
                  </button>
                </>
              )}

              {!deleteMode && (
                <button onClick={saveActivity} disabled={saving}
                  style={{ background: '#800000', color: '#fff', padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: saving ? 0.6 : 1 }}>
                  <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Month Modal */}
      {createMonthModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 9998, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem',
        }} onClick={() => setCreateMonthModal(false)}>
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '1.5rem',
            maxWidth: '400px', width: '90%', textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '0.9rem', color: '#800000', marginBottom: '0.75rem' }}>Create New Month</h3>
            <p style={{ fontSize: '0.75rem', color: '#737373', marginBottom: '1rem' }}>
              Create a new sheet for <strong>{MONTHS[(MONTHS.indexOf(month) + 1) % 12]} {MONTHS.indexOf(month) === 11 ? parseInt(year) + 1 : year}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button onClick={() => setCreateMonthModal(false)}
                style={{ background: '#fff', color: '#737373', border: '1.5px solid #E5E5E5', padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={createNextMonth}
                style={{ background: '#800000', color: '#fff', padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', border: 'none' }}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saving overlay */}
      {saving && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #E5E5E5', borderTop: '3px solid #800000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#800000' }}>{savingProgress || 'Saving...'}</span>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}