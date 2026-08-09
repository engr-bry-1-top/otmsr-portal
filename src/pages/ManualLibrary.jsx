import { useState, useEffect } from 'react'
import { Search, BookOpen, ArrowRight, Grid3X3, List, FileText, Library } from 'lucide-react'

const BASE_URL = 'https://jyryudfbdfhvgfnmmnam.supabase.co/storage/v1/object/public/manuals'

const FILE_LIST = [
  ['AMOUL/Defibrillator', 'i6 Service Manual.pdf'],
  ['AMOUL/Defibrillator', 'i6 User Manual.pdf'],
  ['AMOUL/Ventilator', 'T6 User Manual.pdf'],
  ['BEMEMS', 'User Manual Pinkview-DR PLUS - User Manual (Rev.3).pdf'],
  ['BIOBASE', '7 Digital Dry Bath Manual.pdf'],
  ['BIOBASE', 'BIOBASE Blood Bank Refrigerator BBR-4V120_210_1000 User Manual 202205.pdf'],
  ['BIOBASE', 'BIOBASE Laboratory Refrigerator BPR-5V588,1000 User Manual（AC220V 50Hz）202203.pdf'],
  ['BNG', 'BN300 phototherapy user manual.pdf'],
  ['BNG', 'EcoLa3000 infant incubator user manual.pdf'],
  ['BNG', 'Ecosy 930 Infant radiant warmer user manual.PDF'],
  ['BROWINER/Portable X-Ray', 'MobileCooper Operation Manual.pdf'],
  ['CAREVIEW', 'CareView 1800Cwe Operation Manual A3-20221130 (XRAY flatpanel detectors).pdf'],
  ['COMEN/Defibrillator Monitor', 'comen-s8-service-manual_compress.pdf'],
  ['COMEN/Defibrillator Monitor', 's8-user-manual_compress.pdf'],
  ['COMEN/ECG', 'H12 User Manual.pdf'],
  ['COMEN/ECG', 'H3 Service Manual.pdf'],
  ['COMEN/ECG', 'H3 User Manual.pdf'],
  ['COMEN/Ventilator', 'V3 V3 PRO User Manual.pdf'],
  ['DAWEI', 'HRJ-H500 Operation manual.pdf'],
  ['DAWEI/Ultrasound Mobile', 'DW-F3 User Manual.pdf'],
  ['FOCUS AND FUSION', 'Danus 30_User Manual_CE.pdf'],
  ['HEALFORCE/Electrosurgical Unit', 'EB05 Service Manual.pdf'],
  ['HEALFORCE/Electrosurgical Unit', 'EB05 User Manual（220V）.pdf'],
  ['HEALFORCE/PCR Machine', 'X960A_X960B User Manual.pdf'],
  ['HRJ-BIO/Chemistry Analyzer', 'HRJ-C100 Operation Manual.docx.pdf'],
  ['HRJ-BIO/Chemistry Analyzer', 'HRJ-C100 Service Manual.pdf'],
  ['HRJ-BIO/Chemistry Analyzer', 'HRJ-C400 Operation manual.pdf'],
  ['HRJ-BIO/Chemistry Analyzer', 'HRJ-C400 Service Manual.pdf'],
  ['HRJ-BIO/Electrolyte Analyzer', 'HRJ-E800 Operation manual.pdf'],
  ['HRJ-BIO/Electrolyte Analyzer', 'HRJ-E800 Service Manual.pdf'],
  ['HRJ-BIO/Hematology Analyzer', 'HRJ-H350 Operation Manual.pdf'],
  ['HRJ-BIO/Hematology Analyzer', 'HRJ-H350 Service manual.pdf'],
  ['HRJ-BIO/Hematology Analyzer', 'HRJ-H500 Operation manual.pdf'],
  ['HRJ-BIO/Hematology Analyzer', 'HRJ-H500 Service manual.pdf'],
  ['HRJ-BIO/Hematology Analyzer', 'HRJ-H700 Operation manual.pdf'],
  ['HRJ-BIO/Immunofluoroscence Analyzer', 'HRJ-F100 Operation Manual.pdf'],
  ['HRJ-BIO/Immunofluoroscence Analyzer', 'HRJ-F100 Service Manual.pdf'],
  ['HRJ-BIO/Immunofluoroscence Analyzer', 'HRJ-F100S Operation manual.pdf'],
  ['HRJ-BIO/Immunofluoroscence Analyzer', 'HRJ-F100S Service Manual.pdf'],
  ['MEDICAL DEVICES', '9 EENT Diagnostic Set Manual.pdf'],
  ['MELING', 'Operation Manual-Pharmacy Refrigerator.pdf'],
  ['METHER', 'MPC-5V656 User Manual.pdf'],
  ['MINDRAY', '4 Automated External Defibrillator Manual mindray.pdf'],
  ['MINDRAY', '8 ECG Machine 12 Leads Manual mindray.pdf'],
  ['MINDRAY', 'A5-Manual Mindray.pdf'],
  ['MINDRAY', 'Anaesthesia machine - mindray-wato-ex-55pro-service-manual-474.pdf'],
  ['MINDRAY/PMLS/ECG/R12', 'BeneHeart-R12-Operator-Manual (ECG 12 LEADS).pdf'],
  ['MOTEK/C-mill Training', 'POC CAT.pdf'],
  ['MOTEK/C-mill Training', 'SY012-3014(Instal Manual).pdf'],
  ['MOTEK/C-mill Training', 'SY012-8001(Service Manual).pdf'],
  ['MOTEK/C-mill Training/Other Files', 'C-Mill room requirements.pdf'],
  ['MOTEK/C-mill Training/Other Files', 'RB011-3005 - C-Mill BWS Installation Manual.pdf'],
  ['MOTEK/C-mill Training/Other Files', 'SY012-3014 - C-Mill Installation Manual.pdf'],
  ['POWEAM', '4 Auto Hematology Analyzer POWEAM Quick Operation Guide.pdf'],
  ['POWEAM', '4 Auto Hematology Analyzer POWEAM Service Manual.pdf'],
  ['POWEAM', '5 Dental Chair with complete accessories Manual POWEAM.pdf'],
  ['POWEAM', 'POWEAM WHY6580 Auto Hematology Analyzer Manual.pdf'],
  ['SAIKANG', '10 Emergency Cart Manual.pdf'],
  ['SAIKANG', '20 Spineboard Adult and Pedia Manual.pdf'],
  ['SAIKANG', '23 Wheeled stretcher with O2 tank carrier Manual.pdf'],
  ['SONTU', 'SONTU590-Sirius User Manual.pdf'],
  ['TECHNIMEN', '3, 7, 13, 14 & 16 Technimen Agha Instrument Care.pdf'],
  ['TESALYS', 'DOC-SAV-06-V03 USER MANUAL SP 80.pdf'],
  ['TESALYS', 'DOC-SAV-16-V05 INSTALLATION MANUAL STERIPLUS 80 - EN (1).pdf'],
  ['TESALYS', 'DOC-SAV-26-V02 MAINTENANCE MANUAL SP80.pdf'],
  ['TESALYS', 'Electrical Diagram - Steriplus 80_V2 (EN).pdf'],
  ['TRIUP', '21 Suction Machine 2L TRIUP Manual.pdf'],
  ['Unbranded', '10 Fetal Doppler,  Pocket type Manual.pdf'],
  ['Unbranded', '15 Nebulizer ordinary Manual.pdf'],
  ['UNICARE', 'F3 Operation Manual V1.50.pdf'],
  ['UNICARE', 'F3 Service Manual-(A5)-2023.pdf'],
  ['UNICARE', 'F8 Operation Manual V1.90.pdf'],
  ['UNICARE', 'F8 Service Manual (V2.1)-(A10).pdf'],
  ['ZENITHLAB', '2 Clinical Centrifuge 24 placer Manual.pdf'],
  ['ZENITHLAB', '5 High Speed Centrifuge.pdf'],
]

export default function ManualLibrary() {
  const [manuals, setManuals] = useState([])
  const [search, setSearch] = useState('')
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    const allFiles = FILE_LIST.map(([folderPath, fileName]) => {
      const category = folderPath.split('/')[0]
      const url = `${BASE_URL}/${folderPath.split('/').map(encodeURIComponent).join('/')}/${encodeURIComponent(fileName)}`
      return { name: fileName, category, url }
    })
    setManuals(allFiles)
  }, [])

  const brands = [...new Set(manuals.map(m => m.category))].sort()
  const brandStats = {}
  manuals.forEach(m => { brandStats[m.category] = (brandStats[m.category] || 0) + 1 })

  const filteredBrands = brands.filter(b => b.toLowerCase().includes(search.toLowerCase()))
  const selectedFiles = selectedBrand ? manuals.filter(m => m.category === selectedBrand) : []

  return (
    <div>
      {!selectedBrand && (
        <div className="relative overflow-hidden rounded-2xl mb-8" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-white blur-3xl" />
          </div>
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }} />
          <div className="relative px-8 py-10 md:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Library size={30} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Installation Manual Library</h1>
                <p className="text-white/50 text-sm mt-2 max-w-md">Technical documentation and installation guides for all medical equipment brands</p>
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <span className="text-white/70 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    {manuals.length} manuals
                  </span>
                  <span className="text-white/70 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    {brands.length} brands
                  </span>
                </div>
              </div>
            </div>
            <div className="relative w-full md:w-72">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search brands..."
                className="w-full pl-12 pr-4 py-3 text-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 outline-none focus:bg-white/15 focus:border-white/40 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {selectedBrand ? (
        <div>
          <button onClick={() => setSelectedBrand(null)} className="text-sm text-gray-500 hover:text-maroon mb-1 flex items-center gap-1">
            ← Back to Library
          </button>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{selectedBrand}</h1>
              <p className="text-sm text-gray-500">{selectedFiles.length} manuals</p>
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-white text-maroon shadow-sm' : 'text-gray-500'}`}>
                <Grid3X3 size={15} className="inline mr-1" />Grid
              </button>
              <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white text-maroon shadow-sm' : 'text-gray-500'}`}>
                <List size={15} className="inline mr-1" />List
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedFiles.map((manual, i) => (
                <a key={i} href={manual.url} target="_blank" rel="noopener noreferrer"
                  className="bg-white rounded-xl border border-gray-100 p-4 hover:border-maroon/30 hover:shadow-sm transition-all group flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:bg-maroon/10 transition-colors">
                    <FileText size={18} className="text-maroon" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 group-hover:text-maroon transition-colors line-clamp-2">{manual.name}</p>
                    <p className="text-xs text-gray-400 mt-1">PDF Document</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {selectedFiles.map((manual, i) => (
                <a key={i} href={manual.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                  <FileText size={18} className="text-gray-300 group-hover:text-maroon flex-shrink-0" />
                  <span className="text-sm text-gray-700 group-hover:text-maroon flex-1 truncate">{manual.name}</span>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-maroon flex-shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-end mb-4">
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-white text-maroon shadow-sm' : 'text-gray-500'}`}>
                <Grid3X3 size={15} className="inline mr-1" />Grid
              </button>
              <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white text-maroon shadow-sm' : 'text-gray-500'}`}>
                <List size={15} className="inline mr-1" />List
              </button>
            </div>
          </div>

          {filteredBrands.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-20 text-center">
              <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 text-sm">No brands found</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredBrands.map(brand => (
                <button key={brand} onClick={() => setSelectedBrand(brand)}
                  className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:border-maroon/30 hover:shadow-lg transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-maroon/5 to-maroon/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen size={26} className="text-maroon" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-maroon transition-colors">{brand}</p>
                  <p className="text-xs text-gray-400 mt-1.5">{brandStats[brand] || 0} document{brandStats[brand] !== 1 ? 's' : ''}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {filteredBrands.map(brand => (
                <button key={brand} onClick={() => setSelectedBrand(brand)}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group w-full text-left">
                  <div className="w-10 h-10 rounded-lg bg-maroon/5 flex items-center justify-center flex-shrink-0 group-hover:bg-maroon/10 transition-colors">
                    <BookOpen size={18} className="text-maroon" />
                  </div>
                  <span className="text-sm font-medium text-gray-800 group-hover:text-maroon flex-1">{brand}</span>
                  <span className="text-xs text-gray-400">{brandStats[brand] || 0} docs</span>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-maroon" />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}