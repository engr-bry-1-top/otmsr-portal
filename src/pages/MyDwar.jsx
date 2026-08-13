import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Printer, Plus, Trash2, Save, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const ADMIN_USERS = ['rob.onetop', 'josh.onetop', 'bry.onetop']

export default function MyDwar() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentDate = new Date()
  const currentMonthName = MONTHS[currentDate.getMonth()]
  const currentYearString = currentDate.getFullYear().toString()
  const currentWeek = Math.ceil(currentDate.getDate() / 7)

  const [user, setUser] = useState(null)
  const [month, setMonth] = useState(currentMonthName)
  const [year, setYear] = useState(currentYearString)
  const [week, setWeek] = useState(currentWeek)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editModal, setEditModal] = useState(null)
  const [editEntry, setEditEntry] = useState({ time_in: '', time_out: '', work_schedule: '', activity_done: '', remarks: '' })
  const [saving, setSaving] = useState(false)
  const [showContactEdit, setShowContactEdit] = useState(false)
  const [editContact, setEditContact] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [contactMessage, setContactMessage] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [saveMessage, setSaveMessage] = useState(null)
  const [printModal, setPrintModal] = useState(false)
  const [printStartMonth, setPrintStartMonth] = useState(currentMonthName)
  const [printEndMonth, setPrintEndMonth] = useState(currentMonthName)
  const [printStartWeek, setPrintStartWeek] = useState(1)
  const [printEndWeek, setPrintEndWeek] = useState(5)
  const [printYear, setPrintYear] = useState(currentYearString)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('otmsr_user')
    const viewUserData = location.state?.selectedUserData
    
    if (stored) {
      const userData = JSON.parse(stored)
      setUser(userData)
      setIsAdmin(ADMIN_USERS.includes(userData.username))
      
      if (viewUserData) {
        setSelectedUser(viewUserData)
      } else {
        setSelectedUser(userData)
      }
    }
  }, [location.state])

  useEffect(() => {
    if (selectedUser?.username) fetchEntries()
  }, [month, year, week, selectedUser])

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const username = selectedUser?.username
      if (!username) { setEntries([]); setLoading(false); return }
      
      const { data } = await supabase
        .from('dwar_entries')
        .select('*')
        .eq('username', username)
        .eq('month_name', month)
        .eq('year', parseInt(year))
        .eq('week', week)
        .order('day')
      
      setEntries(data || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const getDayInfo = (dayNum) => {
    const monthIdx = MONTHS.indexOf(month)
    const daysInMonth = new Date(parseInt(year), monthIdx + 1, 0).getDate()
    
    if (dayNum <= daysInMonth) {
      const dateObj = new Date(parseInt(year), monthIdx, dayNum)
      return {
        dayNum,
        dayName: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
        label: `${dateObj.toLocaleDateString('en-US', { weekday: 'short' })} ${dayNum}`,
        actualDay: dayNum,
        actualMonth: month,
        actualMonthShort: month.substring(0, 3),
        actualYear: parseInt(year)
      }
    } else {
      const actualDay = dayNum - daysInMonth
      let nextMonthIdx = monthIdx + 1
      let nextYear = parseInt(year)
      if (nextMonthIdx > 11) {
        nextMonthIdx = 0
        nextYear++
      }
      const dateObj = new Date(nextYear, nextMonthIdx, actualDay)
      const nextMonthName = MONTHS[nextMonthIdx]
      return {
        dayNum,
        dayName: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
        label: `${dateObj.toLocaleDateString('en-US', { weekday: 'short' })} ${actualDay} (${nextMonthName.substring(0, 3)})`,
        actualDay,
        actualMonth: nextMonthName,
        actualMonthShort: nextMonthName.substring(0, 3),
        actualYear: nextYear
      }
    }
  }

  const getWorkingDaysForWeek = (wk) => {
    const days = []
    const monthIdx = MONTHS.indexOf(month)
    const daysInMonth = new Date(parseInt(year), monthIdx + 1, 0).getDate()
    
    if (wk >= 1 && wk <= 5) {
      const startDay = (wk - 1) * 7 + 1
      
      for (let offset = 0; offset < 7; offset++) {
        const d = startDay + offset
        
        let actualMonth = monthIdx
        let actualDay = d
        let actualYear = parseInt(year)
        
        if (d > daysInMonth) {
          actualDay = d - daysInMonth
          actualMonth++
          if (actualMonth > 11) {
            actualMonth = 0
            actualYear++
          }
        }
        
        const dateObj = new Date(actualYear, actualMonth, actualDay)
        const dayOfWeek = dateObj.getDay()
        
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          days.push(d)
        }
      }
    }
    
    return days
  }

  const daysInWeek = getWorkingDaysForWeek(week)

  const openEditModal = (day, existing = null) => {
    setEditModal({ day })
    if (existing) {
      setEditEntry({
        time_in: existing.time_in || '',
        time_out: existing.time_out || '',
        work_schedule: existing.work_schedule || '',
        activity_done: existing.activity_done || '',
        remarks: existing.remarks || '',
      })
    } else {
      setEditEntry({ time_in: '', time_out: '', work_schedule: '', activity_done: '', remarks: '' })
    }
  }

  const saveEntry = async () => {
    if (!editModal) return
    setSaving(true)
    setSaveMessage(null)
    try {
      const payload = {
        username: selectedUser.username,
        full_name: selectedUser.full_name,
        contact: selectedUser.contact || '',
        email: selectedUser.email || '',
        month_name: month,
        year: parseInt(year),
        week: week,
        day: editModal.day,
        ...editEntry,
        updated_at: new Date().toISOString(),
      }
      
      await supabase.from('dwar_entries').upsert(payload, {
        onConflict: 'username,month_name,year,week,day'
      })
      
      setEditModal(null)
      setSaveMessage({ type: 'success', text: 'Entry saved!' })
      setTimeout(() => setSaveMessage(null), 3000)
      fetchEntries()
    } catch (err) { 
      console.error(err)
      setSaveMessage({ type: 'error', text: 'Failed to save' })
    }
    setSaving(false)
  }

  const confirmDelete = async () => {
    if (!deleteModal) return
    setSaving(true)
    try {
      await supabase.from('dwar_entries')
        .delete()
        .eq('username', selectedUser.username)
        .eq('month_name', month)
        .eq('year', parseInt(year))
        .eq('week', week)
        .eq('day', deleteModal)
      setDeleteModal(null)
      setSaveMessage({ type: 'success', text: 'Entry deleted!' })
      setTimeout(() => setSaveMessage(null), 3000)
      fetchEntries()
    } catch (err) { 
      console.error(err)
      setSaveMessage({ type: 'error', text: 'Failed to delete' })
    }
    setSaving(false)
  }

  const saveContactInfo = async () => {
    setContactMessage(null)
    try {
      const { error } = await supabase.from('profiles')
        .update({ contact: editContact, email: editEmail })
        .eq('username', selectedUser.username)
      
      if (error) {
        setContactMessage({ type: 'error', text: 'Failed to save: ' + error.message })
        return
      }
      
      setSelectedUser(prev => ({ ...prev, contact: editContact, email: editEmail }))
      
      const stored = localStorage.getItem('otmsr_user')
      if (stored) {
        const userData = JSON.parse(stored)
        userData.contact = editContact
        userData.email = editEmail
        localStorage.setItem('otmsr_user', JSON.stringify(userData))
      }
      
      setShowContactEdit(false)
      setContactMessage({ type: 'success', text: 'Contact info saved!' })
      
      setTimeout(() => setContactMessage(null), 3000)
    } catch (err) { 
      setContactMessage({ type: 'error', text: 'Failed to save: ' + err.message })
    }
  }

  const getEntryForDay = (day) => {
    return entries.find(e => e.day === day)
  }

  const handlePrint = () => {
    setPrintModal(true)
  }

  const executePrint = async () => {
    const startMonthIdx = MONTHS.indexOf(printStartMonth)
    const endMonthIdx = MONTHS.indexOf(printEndMonth)
    
    if (startMonthIdx > endMonthIdx) {
      alert('Start month must be before or equal to end month')
      return
    }
    
    if (printStartWeek > printEndWeek) {
      alert('Start week must be before or equal to end week')
      return
    }
    
    const monthsToPrint = []
    for (let m = startMonthIdx; m <= endMonthIdx; m++) {
      monthsToPrint.push(MONTHS[m])
    }
    
    const weeksToPrint = []
    for (let w = printStartWeek; w <= printEndWeek; w++) {
      weeksToPrint.push(w)
    }
    
    const { data: rangeEntries } = await supabase
      .from('dwar_entries')
      .select('*')
      .eq('username', selectedUser.username)
      .eq('year', parseInt(printYear))
      .in('month_name', monthsToPrint)
      .in('week', weeksToPrint)
      .order('month_name')
      .order('week')
      .order('day')
    
    let allHTML = ''
    
    monthsToPrint.forEach(mn => {
      weeksToPrint.forEach(wk => {
        const weekEntries = (rangeEntries || []).filter(e => e.month_name === mn && e.week === wk)
        const monthIdx = MONTHS.indexOf(mn)
        const daysInThisMonth = new Date(parseInt(printYear), monthIdx + 1, 0).getDate()
        const daysInThisWeek = []
        
        if (wk >= 1 && wk <= 5) {
          const startD = (wk - 1) * 7 + 1
          
          for (let offset = 0; offset < 7; offset++) {
            const d = startD + offset
            
            let actualMonth = monthIdx
            let actualDay = d
            let actualYear = parseInt(printYear)
            
            if (d > daysInThisMonth) {
              actualDay = d - daysInThisMonth
              actualMonth++
              if (actualMonth > 11) {
                actualMonth = 0
                actualYear++
              }
            }
            
            const dateObj = new Date(actualYear, actualMonth, actualDay)
            const dayOfWeek = dateObj.getDay()
            
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
              daysInThisWeek.push({ 
                day: d, 
                label: `${dateObj.toLocaleDateString('en-US', { weekday: 'short' })} ${actualDay}${actualMonth !== monthIdx ? ` (${MONTHS[actualMonth].substring(0, 3)})` : ''}` 
              })
            }
          }
        }
        
        let rowsHTML = ''
        daysInThisWeek.forEach(({ day, label }) => {
          const entry = weekEntries.find(e => e.day === day)
          
          rowsHTML += `
            <tr>
              <td style="border:1px solid #999;padding:5px;text-align:center;font-size:8px;">${label}</td>
              <td style="border:1px solid #999;padding:5px;text-align:center;font-size:8px;">${entry?.time_in || ''}</td>
              <td style="border:1px solid #999;padding:5px;text-align:center;font-size:8px;">${entry?.time_out || ''}</td>
              <td style="border:1px solid #999;padding:5px;font-size:8px;">${entry?.work_schedule || ''}</td>
              <td style="border:1px solid #999;padding:5px;font-size:8px;">${entry?.activity_done || ''}</td>
              <td style="border:1px solid #999;padding:5px;font-size:8px;">${entry?.remarks || ''}</td>
            </tr>
          `
        })
        
        allHTML += `
          <div style="margin-bottom: 20px;">
            <div style="text-align:center;margin-bottom:10px;">
              <h2 style="color:#800000;font-size:14px;margin:0 0 3px;">DAILY WORK ACCOMPLISHMENT REPORT</h2>
              <p style="font-size:10px;color:#666;margin:2px 0;"><strong>${selectedUser?.full_name || ''}</strong> | ${selectedUser?.contact || ''} | ${selectedUser?.email || ''}</p>
              <p style="font-size:10px;color:#666;margin:2px 0;">${mn} ${printYear} — Week ${wk} (Mon-Fri)</p>
            </div>
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="background:#800000;color:#fff;padding:5px;font-size:8px;text-transform:uppercase;border:1px solid #800000;">Date</th>
                  <th style="background:#800000;color:#fff;padding:5px;font-size:8px;text-transform:uppercase;border:1px solid #800000;">Time In</th>
                  <th style="background:#800000;color:#fff;padding:5px;font-size:8px;text-transform:uppercase;border:1px solid #800000;">Time Out</th>
                  <th style="background:#800000;color:#fff;padding:5px;font-size:8px;text-transform:uppercase;border:1px solid #800000;">Work Schedule</th>
                  <th style="background:#800000;color:#fff;padding:5px;font-size:8px;text-transform:uppercase;border:1px solid #800000;">Activity Done</th>
                  <th style="background:#800000;color:#fff;padding:5px;font-size:8px;text-transform:uppercase;border:1px solid #800000;">Remarks</th>
                </tr>
              </thead>
              <tbody>${rowsHTML}</tbody>
            </table>
          </div>
          <hr style="border: none; border-top: 2px dashed #ccc; margin: 15px 0;" />
        `
      })
    })
    
    const printWindow = window.open('', '_blank', 'width=900,height=1100')
    if (!printWindow) { alert('Popup blocked. Please allow popups.') ; return }
    
    printWindow.document.write(`<!DOCTYPE html><html><head><title>DWAR Report</title>`)
    printWindow.document.write(`<style>`)
    printWindow.document.write(`@page { size: A4 portrait; margin: 10mm; }`)
    printWindow.document.write(`body { font-family: Arial, sans-serif; margin: 0; padding: 15px; color: #1A1A1A; }`)
    printWindow.document.write(`* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }`)
    printWindow.document.write(`</style></head><body>`)
    printWindow.document.write(allHTML)
    printWindow.document.write(`</body></html>`)
    printWindow.document.close()
    
    setPrintModal(false)
    
    setTimeout(() => { printWindow.print(); printWindow.close() }, 500)
  }

  if (!user) return null

  if (!selectedUser) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-maroon rounded-full animate-spin" />
      </div>
    )
  }

  const isOwnDwar = selectedUser?.username === user?.username

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-3 mb-3 md:mb-6 no-print">
        <div className="flex items-center gap-2 md:gap-3">
          {!isOwnDwar && (
            <button 
              onClick={() => navigate('/team-dwar')} 
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-maroon hover:border-maroon/40 transition-all flex-shrink-0"
              title="Back to Team DWAR"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900">
              {isOwnDwar ? 'My DWAR' : selectedUser?.full_name + "'s DWAR"}
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Daily Work Accomplishment Report</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 text-xs md:text-sm bg-maroon text-white rounded-lg md:rounded-xl hover:bg-maroon-dark">
            <Printer size={isMobile ? 14 : 16} /> Print
          </button>
          {isAdmin && (
            <button onClick={() => navigate('/team-dwar')} className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 text-xs md:text-sm bg-navy text-white rounded-lg md:rounded-xl hover:bg-navy-light">
              {isMobile ? 'Team DWAR' : 'See Team DWAR'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-2.5 md:p-4 mb-3 md:mb-6 flex flex-wrap items-center gap-1.5 md:gap-3 no-print">
        <select value={month} onChange={e => setMonth(e.target.value)} className="flex-1 min-w-[100px] px-2 md:px-3 py-2 text-xs md:text-sm border border-gray-200 rounded-lg bg-white outline-none">
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(e.target.value)} className="px-2 md:px-3 py-2 text-xs md:text-sm border border-gray-200 rounded-lg bg-white outline-none">
          {['2025','2026','2027'].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={week} onChange={e => setWeek(parseInt(e.target.value))} className="flex-1 min-w-[90px] px-2 md:px-3 py-2 text-xs md:text-sm border border-gray-200 rounded-lg bg-white outline-none">
          {isMobile ? (
            <>
              <option value={1}>W1</option>
              <option value={2}>W2</option>
              <option value={3}>W3</option>
              <option value={4}>W4</option>
              <option value={5}>W5</option>
            </>
          ) : (
            <>
              <option value={1}>Week 1</option>
              <option value={2}>Week 2</option>
              <option value={3}>Week 3</option>
              <option value={4}>Week 4</option>
              <option value={5}>Week 5</option>
            </>
          )}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 mb-3 md:mb-4">
        <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm items-center">
          <span><strong className="text-gray-500">Name:</strong> {selectedUser?.full_name}</span>
          <span className="flex items-center gap-1.5 md:gap-2">
            <strong className="text-gray-500">Contact:</strong>
            {showContactEdit ? (
              <input type="text" value={editContact} onChange={e => setEditContact(e.target.value)} className="px-2 py-1 text-xs md:text-sm border border-gray-200 rounded-lg outline-none focus:border-maroon w-32 md:w-auto" />
            ) : (
              <span>{selectedUser?.contact || '—'}</span>
            )}
          </span>
          <span className="flex items-center gap-1.5 md:gap-2">
            <strong className="text-gray-500">Email:</strong>
            {showContactEdit ? (
              <input type="text" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="px-2 py-1 text-xs md:text-sm border border-gray-200 rounded-lg outline-none focus:border-maroon w-40 md:w-auto" />
            ) : (
              <span className="truncate max-w-[150px] md:max-w-none">{selectedUser?.email || '—'}</span>
            )}
          </span>
          <span><strong className="text-gray-500">Month:</strong> {month} {year}</span>
          {isOwnDwar && !showContactEdit && (
            <button onClick={() => { setShowContactEdit(true); setEditContact(selectedUser?.contact || ''); setEditEmail(selectedUser?.email || '') }} className="px-2.5 md:px-3 py-1 bg-maroon text-white text-[10px] md:text-xs rounded-lg hover:bg-maroon-dark">
              {isMobile ? 'Edit Contact' : 'Edit Contact Info'}
            </button>
          )}
          {showContactEdit && (
            <>
              <button onClick={saveContactInfo} className="px-2.5 md:px-3 py-1 bg-maroon text-white text-[10px] md:text-xs rounded-lg hover:bg-maroon-dark">Save</button>
              <button onClick={() => setShowContactEdit(false)} className="px-2.5 md:px-3 py-1 bg-gray-100 text-gray-600 text-[10px] md:text-xs rounded-lg hover:bg-gray-200">Cancel</button>
            </>
          )}
        </div>
      </div>

      {contactMessage && (
        <div className={`mb-3 md:mb-4 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-medium ${
          contactMessage.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {contactMessage.type === 'success' ? '✓ ' : '✗ '}
          {contactMessage.text}
        </div>
      )}

      {saveMessage && (
        <div className={`mb-3 md:mb-4 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-medium ${
          saveMessage.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {saveMessage.type === 'success' ? '✓ ' : '✗ '}
          {saveMessage.text}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gray-200 border-t-maroon rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] md:min-w-[800px]">
              <thead>
                <tr className="bg-maroon text-white text-left">
                  <th className="px-2 md:px-4 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold uppercase">Date</th>
                  <th className="px-2 md:px-4 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold uppercase">Time In</th>
                  <th className="px-2 md:px-4 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold uppercase">Time Out</th>
                  <th className="px-2 md:px-4 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold uppercase">Work Schedule</th>
                  <th className="px-2 md:px-4 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold uppercase">Activity Done</th>
                  <th className="px-2 md:px-4 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold uppercase">Remarks</th>
                  <th className="px-2 md:px-4 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {daysInWeek.map(dayNum => {
                  const info = getDayInfo(dayNum)
                  const entry = getEntryForDay(dayNum)
                  const isToday = dayNum === currentDate.getDate() && month === currentMonthName && parseInt(year) === currentDate.getFullYear()
                  
                  return (
                    <tr key={dayNum} className={`border-b border-gray-100 ${isToday ? 'bg-maroon/5' : ''}`}>
                      <td className="px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-900 whitespace-nowrap">{info.label}</td>
                      <td className="px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-gray-600">{entry?.time_in || '—'}</td>
                      <td className="px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-gray-600">{entry?.time_out || '—'}</td>
                      <td className="px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-gray-600 max-w-[120px] md:max-w-[200px] truncate" title={entry?.work_schedule}>{entry?.work_schedule || '—'}</td>
                      <td className="px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-gray-600 max-w-[150px] md:max-w-[250px] truncate" title={entry?.activity_done}>{entry?.activity_done || '—'}</td>
                      <td className="px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-gray-600 max-w-[100px] md:max-w-[150px] truncate" title={entry?.remarks}>{entry?.remarks || '—'}</td>
                      <td className="px-2 md:px-4 py-1.5 md:py-2 whitespace-nowrap">
                        {isOwnDwar && (
                          <>
                            <button onClick={() => openEditModal(dayNum, entry)} className="p-1 md:p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-maroon" title="Add/Edit">
                              <Plus size={isMobile ? 12 : 14} />
                            </button>
                            {entry && (
                              <button onClick={() => setDeleteModal(dayNum)} className="p-1 md:p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600" title="Delete">
                                <Trash2 size={isMobile ? 12 : 14} />
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998, 
          display: 'flex', justifyContent: 'center', 
          alignItems: isMobile ? 'flex-end' : 'center',
          padding: isMobile ? 0 : '1rem' 
        }} onClick={() => setDeleteModal(null)}>
          <div style={{ 
            background: '#fff', 
            borderRadius: isMobile ? '16px 16px 0 0' : '14px',
            padding: isMobile ? '1.25rem' : '1.5rem', 
            width: '100%', maxWidth: '400px', 
            textAlign: 'center',
            boxShadow: isMobile ? '0 -10px 40px rgba(0,0,0,0.2)' : '0 20px 50px rgba(0,0,0,0.3)' 
          }} onClick={e => e.stopPropagation()}>
            {isMobile && <div style={{ width: '40px', height: '4px', background: '#E5E5E5', borderRadius: '2px', margin: '0 auto 0.75rem' }} />}
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗑️</div>
            <h3 style={{ fontSize: '0.95rem', color: '#CC0000', marginBottom: '0.5rem' }}>Delete Entry?</h3>
            <p style={{ fontSize: '0.8rem', color: '#737373', marginBottom: '1rem' }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={confirmDelete} disabled={saving} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                <Trash2 size={14} /> {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {printModal && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998, 
          display: 'flex', justifyContent: 'center', 
          alignItems: isMobile ? 'flex-end' : 'center',
          padding: isMobile ? 0 : '1rem' 
        }} onClick={() => setPrintModal(false)}>
          <div style={{ 
            background: '#fff', 
            borderRadius: isMobile ? '16px 16px 0 0' : '14px',
            padding: isMobile ? '1.25rem' : '1.5rem', 
            width: '100%', maxWidth: '450px', 
            boxShadow: isMobile ? '0 -10px 40px rgba(0,0,0,0.2)' : '0 20px 50px rgba(0,0,0,0.3)',
            maxHeight: '90vh', overflowY: 'auto' 
          }} onClick={e => e.stopPropagation()}>
            {isMobile && <div style={{ width: '40px', height: '4px', background: '#E5E5E5', borderRadius: '2px', margin: '0 auto 0.75rem' }} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#800000', margin: 0 }}>Print DWAR</h3>
              <button onClick={() => setPrintModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Year</label>
                <select value={printYear} onChange={e => setPrintYear(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white outline-none">
                  {['2025','2026','2027'].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Start Month</label>
                  <select value={printStartMonth} onChange={e => setPrintStartMonth(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white outline-none">
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">End Month</label>
                  <select value={printEndMonth} onChange={e => setPrintEndMonth(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white outline-none">
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Start Week</label>
                  <select value={printStartWeek} onChange={e => setPrintStartWeek(parseInt(e.target.value))} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white outline-none">
                    {[1,2,3,4,5].map(w => <option key={w} value={w}>Week {w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">End Week</label>
                  <select value={printEndWeek} onChange={e => setPrintEndWeek(parseInt(e.target.value))} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white outline-none">
                    {[1,2,3,4,5].map(w => <option key={w} value={w}>Week {w}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setPrintModal(false)} className="flex-1 py-2.5 md:py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={executePrint} className="flex-1 py-2.5 md:py-3 bg-maroon text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                <Printer size={14} /> Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && isOwnDwar && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998, 
          display: 'flex', justifyContent: 'center', 
          alignItems: isMobile ? 'flex-end' : 'center',
          padding: isMobile ? 0 : '1rem' 
        }} onClick={() => setEditModal(null)}>
          <div style={{ 
            background: '#fff', 
            borderRadius: isMobile ? '16px 16px 0 0' : '14px',
            padding: isMobile ? '1.25rem' : '1.5rem', 
            width: '100%', maxWidth: '500px', 
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: isMobile ? '0 -10px 40px rgba(0,0,0,0.2)' : '0 20px 50px rgba(0,0,0,0.3)' 
          }} onClick={e => e.stopPropagation()}>
            {isMobile && <div style={{ width: '40px', height: '4px', background: '#E5E5E5', borderRadius: '2px', margin: '0 auto 0.75rem' }} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#800000', margin: 0 }}>Day {editModal.day} — {month} {year}</h3>
              <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Time In</label>
                <input type="text" value={editEntry.time_in} onChange={e => setEditEntry(prev => ({ ...prev, time_in: e.target.value }))} placeholder="e.g., 8:00 AM"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-maroon" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Time Out</label>
                <input type="text" value={editEntry.time_out} onChange={e => setEditEntry(prev => ({ ...prev, time_out: e.target.value }))} placeholder="e.g., 5:00 PM"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-maroon" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Work Schedule</label>
                <input type="text" value={editEntry.work_schedule} onChange={e => setEditEntry(prev => ({ ...prev, work_schedule: e.target.value }))} placeholder="e.g., Site visit - Sta Rosa"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-maroon" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Activity Done</label>
                <textarea value={editEntry.activity_done} onChange={e => setEditEntry(prev => ({ ...prev, activity_done: e.target.value }))} rows={3} placeholder="Describe what was accomplished..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-maroon resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Remarks</label>
                <input type="text" value={editEntry.remarks} onChange={e => setEditEntry(prev => ({ ...prev, remarks: e.target.value }))} placeholder="Optional remarks"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-maroon" />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setEditModal(null)} className="flex-1 py-2.5 md:py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={saveEntry} disabled={saving} className="flex-1 py-2.5 md:py-3 bg-maroon text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                <Save size={14} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}