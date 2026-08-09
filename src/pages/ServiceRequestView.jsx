import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Printer, Edit3, Save } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ServiceRequestView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sr, setSr] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [remarks, setRemarks] = useState('')
  const [receivedBy, setReceivedBy] = useState('')
  const [receivedDate, setReceivedDate] = useState('')

  useEffect(() => { fetchRequest() }, [id])

  const fetchRequest = async () => {
    const { data } = await supabase.from('service_requests').select('*').eq('id', id).single()
    if (data) { setSr(data); setRemarks(data.engineers_remarks || ''); setReceivedBy(data.received_by || ''); setReceivedDate(data.received_date || '') }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('service_requests').update({ engineers_remarks: remarks, received_by: receivedBy, received_date: receivedDate }).eq('id', id)
    setSr(prev => ({ ...prev, engineers_remarks: remarks, received_by: receivedBy, received_date: receivedDate }))
    setEditing(false); setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-200 border-t-maroon rounded-full animate-spin" /></div>
  if (!sr) return <div className="bg-white rounded-xl border border-gray-100 p-8 md:p-16 text-center"><p className="text-gray-500">Request not found.</p></div>

  return (
    <div>
      <style>{`
        @media print {
          @page { size: A4; margin: 8mm; }
          body { background: #fff !important; visibility: hidden; }
          .print-area { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; }
          .print-area * { visibility: visible; }
          .no-print { display: none !important; }
          .paper { box-shadow: none !important; border: 2px solid #000 !important; width: 100% !important; min-width: 0 !important; }
          textarea, input { border: none !important; background: transparent !important; resize: none !important; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6 no-print">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">{sr.requested_by}</h1>
          <p className="text-xs md:text-sm text-gray-500">{sr.location} &middot; {new Date(sr.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2">
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-navy text-white text-xs md:text-sm font-medium rounded-xl"><Edit3 size={14} /> Edit</button>
          ) : (
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-maroon text-white text-xs md:text-sm font-medium rounded-xl"><Save size={14} /> {saving ? 'Saving...' : 'Save'}</button>
          )}
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-charcoal text-white text-xs md:text-sm font-medium rounded-xl"><Printer size={14} /> Print</button>
        </div>
      </div>

      <div className="overflow-x-auto print-area">
        <div className="bg-white border-2 border-gray-800 shadow-lg paper min-w-[600px] md:min-w-0">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-800 text-center p-3 md:p-4" style={{ width: '22%' }}>
                  <img src="/images/logo.png" alt="" className="h-10 md:h-14 mx-auto" />
                </td>
                <td className="border border-gray-800 text-center p-3 md:p-4">
                  <p className="text-sm md:text-lg font-extrabold text-maroon tracking-wide leading-tight">ONE TOP MEDICAL SYSTEMS RESOURCES OPC</p>
                </td>
                <td className="border border-gray-800 p-3 md:p-4 text-[9px] md:text-[11px] text-gray-600 leading-relaxed" style={{ width: '22%' }}>
                  TEL: 63-2-5012247<br />Email: onetop.dohengineer@gmail.com<br />Website: www.onetop.ph
                </td>
              </tr>
            </tbody>
          </table>

          <div className="border border-t-0 border-gray-800 bg-gray-100 text-center py-2 md:py-2.5">
            <span className="text-sm md:text-base font-extrabold text-maroon tracking-[3px] uppercase">Service Request Form</span>
          </div>

          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-800 p-3 md:p-4" style={{ width: '50%' }}>
                  <span className="text-[9px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wide">Date</span><br />
                  <span className="text-sm md:text-base text-gray-800">{sr.created_at ? new Date(sr.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</span>
                </td>
                <td className="border border-gray-800 p-3 md:p-4" style={{ width: '50%' }}>
                  <span className="text-[9px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wide">Requested By</span><br />
                  <span className="text-sm md:text-base text-gray-800">{sr.requested_by || '—'}</span>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-800 p-3 md:p-4" colSpan={2}>
                  <span className="text-[9px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wide">Signature</span><br />
                  {sr.signature_data ? <img src={sr.signature_data} alt="" className="h-10 md:h-12 mt-1" /> : <div className="h-10 md:h-12 border-b border-gray-400 mt-1" />}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-800 p-3 md:p-4">
                  <span className="text-[9px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wide">Date of Activity / Delivery</span><br />
                  <span className="text-sm md:text-base text-gray-800">{sr.date_of_activity || '—'}</span>
                </td>
                <td className="border border-gray-800 p-3 md:p-4">
                  <span className="text-[9px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wide">Location</span><br />
                  <span className="text-sm md:text-base text-gray-800">{sr.location || '—'}</span>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-800 p-3 md:p-4" colSpan={2}>
                  <span className="text-[9px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wide">Type of Services</span><br />
                  <span className="text-sm md:text-base text-gray-800">{sr.service_types?.join(', ') || '—'}{sr.other_service ? ` — ${sr.other_service}` : ''}</span>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-800 p-3 md:p-4" colSpan={2}>
                  <span className="text-[9px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wide">Brief Details of Request / Concern</span><br />
                  <div className="mt-1 text-sm md:text-base text-gray-800 whitespace-pre-wrap">{sr.details || '—'}</div>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-800 p-3 md:p-4" colSpan={2}>
                  <span className="text-[9px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wide">Engineers Remarks</span><br />
                  {editing ? (
                    <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3} className="w-full border-2 border-maroon rounded p-2 mt-1 text-sm outline-none resize-none no-print" />
                  ) : (
                    <div className="mt-1 text-sm md:text-base text-gray-800 whitespace-pre-wrap">{sr.engineers_remarks || '—'}</div>
                  )}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-800 p-3 md:p-4" colSpan={2}>
                  <span className="text-[9px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wide">Approved By</span><br />
                  <span className="text-sm md:text-base text-gray-800 font-semibold">Joshua Rydell C. Velasco — Supervisor, Engineering & Services</span>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-800 p-3 md:p-4 bg-red-50" colSpan={2}>
                  <p className="text-xs md:text-sm text-red-700 font-bold text-center">⚠ NOTE: All requests must be received by the engineering department 5 days in advance before the activity.</p>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-800 p-3 md:p-4">
                  <span className="text-[9px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wide">Received By</span><br />
                  {editing ? (
                    <input type="text" value={receivedBy} onChange={e => setReceivedBy(e.target.value)} className="w-full border-2 border-maroon rounded p-2 mt-1 text-sm outline-none no-print" />
                  ) : (
                    <span className="text-sm md:text-base text-gray-800">{sr.received_by || '____________________'}</span>
                  )}
                </td>
                <td className="border border-gray-800 p-3 md:p-4">
                  <span className="text-[9px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wide">Received Date</span><br />
                  {editing ? (
                    <input type="date" value={receivedDate} onChange={e => setReceivedDate(e.target.value)} className="w-full border-2 border-maroon rounded p-2 mt-1 text-sm outline-none no-print" />
                  ) : (
                    <span className="text-sm md:text-base text-gray-800">{sr.received_date || '____________________'}</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}