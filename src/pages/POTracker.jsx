import { useState } from 'react'
import { Search, FileText, ChevronDown, ChevronRight } from 'lucide-react'

const API_URL = 'https://script.google.com/macros/s/AKfycbwhqFi9pK9uzhDCqLc5mVhpokaA9HWB9f1HzQ5wRErTLTK181U4h0IHsqLw-6CWalU/exec'

export default function POTracker() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [expanded, setExpanded] = useState({})

  const searchPO = async (pg = 1) => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}?api=po_search&q=${encodeURIComponent(query)}&page=${pg}`)
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setResults(data.results || [])
      setTotal(data.total || 0)
      setPage(data.page || 1)
      setTotalPages(data.totalPages || 1)
    } catch (err) { setError('Search failed: ' + err.message) }
    setLoading(false)
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') searchPO() }
  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const grouped = {}
  if (results) {
    results.forEach(row => {
      const po = (row[1] || 'Unknown').toString().trim()
      if (!grouped[po]) grouped[po] = []
      grouped[po].push(row)
    })
  }

  const getStatusClass = (status) => {
    const s = (status || '').toUpperCase()
    if (s.includes('DONE') || s.includes('NO NEED')) return 'bg-emerald-50 text-emerald-700'
    if (s.includes('NOT YET')) return 'bg-red-50 text-red-700'
    return 'bg-amber-50 text-amber-700'
  }

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">PO Tracker</h1>
        <p className="text-sm text-gray-500 mt-1">Search purchase orders and facilities</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 mb-4 md:mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
        <Search size={18} className="text-gray-400 flex-shrink-0 hidden sm:block" />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Search by PO number or facility name..." className="flex-1 border border-gray-200 sm:border-none rounded-lg sm:rounded-none px-3 py-2 text-sm outline-none" />
        <button onClick={() => searchPO()} disabled={loading}
          className="px-4 py-2 bg-maroon text-white text-sm font-medium rounded-xl hover:bg-maroon-dark disabled:opacity-50 whitespace-nowrap">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600 mb-4">{error}</div>}

      {total > 0 && <p className="text-sm text-gray-500 mb-3">{total} result(s) found</p>}

      {results && results.length === 0 && !loading && (
        <div className="bg-white rounded-xl border border-gray-100 p-16 md:p-20 text-center">
          <FileText size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400">No results found</p>
        </div>
      )}

      <div className="space-y-3 md:space-y-4">
        {Object.keys(grouped).map(po => (
          <div key={po} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2 md:gap-3">
              <FileText size={16} className="text-maroon flex-shrink-0" />
              <span className="font-semibold text-gray-900 text-sm truncate">{po}</span>
              <span className="text-xs text-gray-400 flex-shrink-0">({grouped[po].length})</span>
            </div>

            {grouped[po].map((row, idx) => {
              const itemId = `${po}-${idx}`
              const facility = (row[4] || 'Unknown').toString().trim()
              const status = (row[20] || 'PENDING').toString().trim()
              const isOpen = expanded[itemId]

              return (
                <div key={itemId} className="border-b border-gray-50 last:border-b-0">
                  <div onClick={() => toggleExpand(itemId)} className="px-4 md:px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-sm font-medium text-gray-800 truncate">{facility}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold mt-1 ${getStatusClass(status)}`}>{status}</span>
                    </div>
                    {isOpen ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />}
                  </div>

                  {isOpen && (
                    <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-50/50">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[400px]">
                          <tbody>
                            {[
                              ['PO Number', row[1]], ['Region', row[2]], ['Province', row[3]],
                              ['Equipment', row[5]], ['Category', row[6]], ['Model', row[7]],
                              ['Brand', row[8]], ['QTY', row[9]], ['Serial', row[10]],
                              ['Delivery Date', row[15]], ['Install Date', row[19]],
                              ['Assigned Engineer', row[22]], ['Implementor', row[23]],
                              ['Received By', row[17]], ['Contact', row[18]], ['Remarks', row[21]],
                            ].map(([label, value], i) => (
                              <tr key={i} className="border-b border-gray-100 last:border-b-0">
                                <td className="py-1.5 pr-4 text-gray-500 font-medium w-36 md:w-40 flex-shrink-0">{label}</td>
                                <td className="py-1.5 text-gray-700">
                                  {label.includes('Date') && value ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : (value || '—')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 md:gap-3 mt-6">
          <button onClick={() => searchPO(1)} disabled={page === 1} className="px-3 py-1.5 text-xs md:text-sm border rounded-lg disabled:opacity-30">First</button>
          <button onClick={() => searchPO(page - 1)} disabled={page === 1} className="px-3 py-1.5 text-xs md:text-sm border rounded-lg disabled:opacity-30">Prev</button>
          <span className="text-xs md:text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button onClick={() => searchPO(page + 1)} disabled={page === totalPages} className="px-3 py-1.5 text-xs md:text-sm border rounded-lg disabled:opacity-30">Next</button>
          <button onClick={() => searchPO(totalPages)} disabled={page === totalPages} className="px-3 py-1.5 text-xs md:text-sm border rounded-lg disabled:opacity-30">Last</button>
        </div>
      )}
    </div>
  )
}