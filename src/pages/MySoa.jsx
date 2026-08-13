import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Printer, Plus, Trash2, Save, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const ADMIN_USERS = ['rob.onetop', 'josh.onetop', 'bry.onetop']

export default function MySoa() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentDate = new Date()
  const currentMonthName = MONTHS[currentDate.getMonth()]
  const currentYearString = currentDate.getFullYear().toString()

  const [user, setUser] = useState(null)
  const [month, setMonth] = useState(currentMonthName)
  const [year, setYear] = useState(currentYearString)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editModal, setEditModal] = useState(null)
  const [editEntry, setEditEntry] = useState({ day: '', purchase_order: '', region: '', hospital_location: '', description: '', fsr_number: '', remarks: '' })
  const [saving, setSaving] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)
  const [saveMessage, setSaveMessage] = useState(null)
  const [printModal, setPrintModal] = useState(false)
  const [printStartMonth, setPrintStartMonth] = useState(currentMonthName)
  const [printEndMonth, setPrintEndMonth] = useState(currentMonthName)
  const [printYear, setPrintYear] = useState(currentYearString)

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
  }, [month, year, selectedUser])

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const username = selectedUser?.username
      if (!username) { setEntries([]); setLoading(false); return }
      
      const { data } = await supabase
        .from('soa_entries')
        .select('*')
        .eq('username', username)
        .eq('month_name', month)
        .eq('year', parseInt(year))
        .order('day')
      
      setEntries(data || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const openEditModal = (existing = null) => {
    if (existing) {
      setEditModal({ id: existing.id, day: existing.day })
      setEditEntry({
        day: existing.day,
        purchase_order: existing.purchase_order || '',
        region: existing.region || '',
        hospital_location: existing.hospital_location || '',
        description: existing.description || '',
        fsr_number: existing.fsr_number || '',
        remarks: existing.remarks || '',
      })
    } else {
      setEditModal({ day: '' })
      setEditEntry({ day: '', purchase_order: '', region: '', hospital_location: '', description: '', fsr_number: '', remarks: '' })
    }
  }

  const saveEntry = async () => {
    if (!editModal) return
    if (!editEntry.day) {
      setSaveMessage({ type: 'error', text: 'Please select a date' })
      setTimeout(() => setSaveMessage(null), 3000)
      return
    }
    setSaving(true)
    setSaveMessage(null)
    try {
      const payload = {
        username: selectedUser.username,
        full_name: selectedUser.full_name,
        month_name: month,
        year: parseInt(year),
        day: parseInt(editEntry.day),
        purchase_order: editEntry.purchase_order,
        region: editEntry.region,
        hospital_location: editEntry.hospital_location,
        description: editEntry.description,
        fsr_number: editEntry.fsr_number,
        remarks: editEntry.remarks,
        updated_at: new Date().toISOString(),
      }
      
      if (editModal.id) {
        await supabase.from('soa_entries').update(payload).eq('id', editModal.id)
      } else {
        await supabase.from('soa_entries').upsert(payload, {
          onConflict: 'username,month_name,year,day'
        })
      }
      
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
      await supabase.from('soa_entries').delete().eq('id', deleteModal)
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
    
    const monthsToPrint = []
    for (let m = startMonthIdx; m <= endMonthIdx; m++) {
      monthsToPrint.push(MONTHS[m])
    }
    
    const { data: rangeEntries } = await supabase
      .from('soa_entries')
      .select('*')
      .eq('username', selectedUser.username)
      .eq('year', parseInt(printYear))
      .in('month_name', monthsToPrint)
      .order('month_name')
      .order('day')
    
    let allHTML = ''
    
    monthsToPrint.forEach(mn => {
      const monthEntries = (rangeEntries || []).filter(e => e.month_name === mn)
      
      let rowsHTML = ''
      monthEntries.forEach(entry => {
        rowsHTML += `
          <tr>
            <td style="border:1px solid #999;padding:5px;text-align:center;font-size:8px;">${mn.substring(0, 3)} ${entry.day}, ${printYear}</td>
            <td style="border:1px solid #999;padding:5px;font-size:8px;">${entry.purchase_order || ''}</td>
            <td style="border:1px solid #999;padding:5px;font-size:8px;">${entry.region || ''}</td>
            <td style="border:1px solid #999;padding:5px;font-size:8px;">${entry.hospital_location || ''}</td>
            <td style="border:1px solid #999;padding:5px;font-size:8px;">${entry.description || ''}</td>
            <td style="border:1px solid #999;padding:5px;font-size:8px;">${entry.fsr_number || ''}</td>
            <td style="border:1px solid #999;padding:5px;font-size:8px;">${entry.remarks || ''}</td>
          </tr>
        `
      })
      
      allHTML += `
        <div style="margin-bottom: 20px;">
          <div style="text-align:center;margin-bottom:10px;">
            <h2 style="color:#800000;font-size:14px;margin:0 0 3px;">SUMMARY OF ACCOMPLISHMENT</h2>
            <p style="font-size:10px;color:#666;margin:2px 0;"><strong>${selectedUser?.full_name || ''}</strong></p>
            <p style="font-size:10px;color:#666;margin:2px 0;">${mn} ${printYear}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="background:#800000;color:#fff;padding:5px;font-size:8px;text-transform:uppercase;border:1px solid #800000;">Date</th>
                <th style="background:#800000;color:#fff;padding:5px;font-size:8px;text-transform:uppercase;border:1px solid #800000;">Purchase Order</th>
                <th style="background:#800000;color:#fff;padding:5px;font-size:8px;text-transform:uppercase;border:1px solid #800000;">Region</th>
                <th style="background:#800000;color:#fff;padding:5px;font-size:8px;text-transform:uppercase;border:1px solid #800000;">Hospital/Location</th>
                <th style="background:#800000;color:#fff;padding:5px;font-size:8px;text-transform:uppercase;border:1px solid #800000;">Description</th>
                <th style="background:#800000;color:#fff;padding:5px;font-size:8px;text-transform:uppercase;border:1px solid #800000;">FSR#</th>
                <th style="background:#800000;color:#fff;padding:5px;font-size:8px;text-transform:uppercase;border:1px solid #800000;">Remarks</th>
              </tr>
            </thead>
            <tbody>${rowsHTML}</tbody>
          </table>
        </div>
        <hr style="border: none; border-top: 2px dashed #ccc; margin: 15px 0;" />
      `
    })
    
    const printWindow = window.open('', '_blank', 'width=1000,height=1100')
    if (!printWindow) { alert('Popup blocked. Please allow popups.') ; return }
    
    printWindow.document.write(`<!DOCTYPE html><html><head><title>SOA Report</title>`)
    printWindow.document.write(`<style>`)
    printWindow.document.write(`@page { size: A4 landscape; margin: 10mm; }`)
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

  const isOwnSoa = selectedUser?.username === user?.username

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-3 mb-3 md:mb-6 no-print">
        <div className="flex items-center gap-2 md:gap-3">
          {!isOwnSoa && (
            <button 
              onClick={() => navigate('/team-soa')} 
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-maroon hover:border-maroon/40 transition-all flex-shrink-0"
              title="Back to Team SOA"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900">
              {isOwnSoa ? 'My SOA' : selectedUser?.full_name + "'s SOA"}
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Summary of Accomplishment</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 text-xs md:text-sm bg-maroon text-white rounded-lg md:rounded-xl hover:bg-maroon-dark">
            <Printer size={isMobile ? 14 : 16} /> Print
          </button>
          {isAdmin && (
            <button onClick={() => navigate('/team-soa')} className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 text-xs md:text-sm bg-navy text-white rounded-lg md:rounded-xl hover:bg-navy-light">
              {isMobile ? 'Team SOA' : 'See Team SOA'}
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
      </div>

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

      <div className="mb-3 md:mb-4 no-print">
        <button onClick={() => openEditModal(null)} className="flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm bg-maroon text-white rounded-lg md:rounded-xl hover:bg-maroon-dark">
          <Plus size={isMobile ? 14 : 16} /> Add Entry
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-gray-200 border-t-maroon rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] md:min-w-[900px]">
              <thead>
                <tr className="bg-maroon text-white text-left">
                  <th className="px-2 md:px-3 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold uppercase">Date</th>
                  <th className="px-2 md:px-3 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold uppercase">PO</th>
                  <th className="px-2 md:px-3 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold uppercase">Region</th>
                  <th className="px-2 md:px-3 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold uppercase">Hospital/Location</th>
                  <th className="px-2 md:px-3 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold uppercase">Description</th>
                  <th className="px-2 md:px-3 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold uppercase">FSR#</th>
                  <th className="px-2 md:px-3 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold uppercase">Remarks</th>
                  {isOwnSoa && <th className="px-2 md:px-3 py-2 md:py-2.5 text-[10px] md:text-xs font-semibold uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id} className="border-b border-gray-100">
                    <td className="px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-900 whitespace-nowrap">
                      {month.substring(0, 3)} {entry.day}, {year}
                    </td>
                    <td className="px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-gray-600 max-w-[80px] md:max-w-[100px] truncate" title={entry.purchase_order}>{entry.purchase_order || '—'}</td>
                    <td className="px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-gray-600 max-w-[60px] md:max-w-[80px] truncate" title={entry.region}>{entry.region || '—'}</td>
                    <td className="px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-gray-600 max-w-[100px] md:max-w-[150px] truncate" title={entry.hospital_location}>{entry.hospital_location || '—'}</td>
                    <td className="px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-gray-600 max-w-[120px] md:max-w-[200px] truncate" title={entry.description}>{entry.description || '—'}</td>
                    <td className="px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-gray-600 max-w-[60px] md:max-w-[80px] truncate" title={entry.fsr_number}>{entry.fsr_number || '—'}</td>
                    <td className="px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-gray-600 max-w-[80px] md:max-w-[120px] truncate" title={entry.remarks}>{entry.remarks || '—'}</td>
                    {isOwnSoa && (
                      <td className="px-2 md:px-3 py-1.5 md:py-2 whitespace-nowrap">
                        <button onClick={() => openEditModal(entry)} className="p-1 md:p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-maroon" title="Edit">
                          <Save size={isMobile ? 12 : 14} />
                        </button>
                        <button onClick={() => setDeleteModal(entry.id)} className="p-1 md:p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600" title="Delete">
                          <Trash2 size={isMobile ? 12 : 14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr><td colSpan={isOwnSoa ? 8 : 7} className="px-4 py-10 text-center text-gray-400 text-sm">No entries yet. Click "Add Entry" to start.</td></tr>
                )}
              </tbody>
            </table>
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
              <h3 style={{ fontSize: '0.95rem', color: '#800000', margin: 0 }}>Print SOA</h3>
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

      {/* Edit Modal */}
      {editModal && isOwnSoa && (
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
              <h3 style={{ fontSize: '0.95rem', color: '#800000', margin: 0 }}>{editModal.id ? 'Edit Entry' : 'Add Entry'} — {month} {year}</h3>
              <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date</label>
                <input 
                  type="date" 
                  value={editEntry.day ? `${year}-${String(MONTHS.indexOf(month) + 1).padStart(2, '0')}-${String(editEntry.day).padStart(2, '0')}` : ''} 
                  onChange={e => {
                    const d = new Date(e.target.value)
                    if (!isNaN(d.getTime())) {
                      setEditEntry(prev => ({ ...prev, day: d.getDate() }))
                    }
                  }}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-maroon" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Purchase Order</label>
                <input type="text" value={editEntry.purchase_order} onChange={e => setEditEntry(prev => ({ ...prev, purchase_order: e.target.value }))} placeholder="PO number"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-maroon" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Region</label>
                <input type="text" value={editEntry.region} onChange={e => setEditEntry(prev => ({ ...prev, region: e.target.value }))} placeholder="e.g., Region 4A"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-maroon" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Hospital/Location</label>
                <input type="text" value={editEntry.hospital_location} onChange={e => setEditEntry(prev => ({ ...prev, hospital_location: e.target.value }))} placeholder="Facility name"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-maroon" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                <textarea value={editEntry.description} onChange={e => setEditEntry(prev => ({ ...prev, description: e.target.value }))} rows={2} placeholder="Work description..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-maroon resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">FSR#</label>
                <input type="text" value={editEntry.fsr_number} onChange={e => setEditEntry(prev => ({ ...prev, fsr_number: e.target.value }))} placeholder="FSR number"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-maroon" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Remarks</label>
                <input type="text" value={editEntry.remarks} onChange={e => setEditEntry(prev => ({ ...prev, remarks: e.target.value }))} placeholder="Remarks"
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