import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CreditCard, BookOpen, FileText, ShoppingCart, BarChart3, TrendingUp, Calendar, Star, Search, Headset, ClipboardCheck, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import AnnouncementModal from '../components/AnnouncementModal'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({ srTotal: 0, srPending: 0, manuals: 0 })
  const [showAnnouncements, setShowAnnouncements] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('otmsr_user')
    if (!stored) { navigate('/'); return }
    const userData = JSON.parse(stored)
    setUser(userData)
    fetchStats()
    checkAnnouncements(userData)
  }, [navigate])

  const checkAnnouncements = async (userData) => {
    try {
      const { data } = await supabase
        .from('announcements')
        .select('id')
        .eq('username', userData.username)
        .eq('is_read', false)
        .limit(1)
      
      if (data && data.length > 0) {
        setShowAnnouncements(true)
      }
    } catch (err) { console.error(err) }
  }

  const fetchStats = async () => {
    const { data: sr } = await supabase.from('service_requests').select('status')
    if (sr) {
      setStats(prev => ({
        ...prev,
        srTotal: sr.length,
        srPending: sr.filter(r => r.status === 'pending').length,
      }))
    }
  }

  if (!user) return null

  const quickLinks = [
    { path: '/deployment', label: 'Deployment', desc: 'Equipment tracking & analytics', icon: BarChart3, color: 'maroon' },
    { path: '/team-performance', label: 'Team Performance', desc: 'Productivity audit & scoring', icon: TrendingUp, color: 'navy' },
    { path: '/coa', label: 'COA Calendar', desc: 'Calendar of activities', icon: Calendar, color: 'maroon' },
    { path: '/manuals', label: 'Manual Library', desc: 'Installation guides', icon: BookOpen, color: 'navy' },
    { path: '/service-requests', label: 'Service Requests', desc: `${stats.srTotal} total · ${stats.srPending} pending`, icon: FileText, color: 'maroon' },
    { path: '/card/edit', label: 'Calling Card', desc: 'Digital business card', icon: CreditCard, color: 'navy' },
    { path: '/feedback', label: 'Client Feedback', desc: 'Satisfaction analytics', icon: Star, color: 'maroon' },
    { path: '/po-tracker', label: 'PO Tracker', desc: 'Search purchase orders', icon: Search, color: 'navy' },
    { path: '/pms-tracker', label: 'PMS Tracker', desc: 'Preventive maintenance', icon: ClipboardCheck, color: 'maroon' },
    { path: '/concerns', label: 'Concerns', desc: 'Customer issue tracking', icon: Headset, color: 'navy' },
    { path: '/purchase-request/new', label: 'Purchase Requests', desc: 'Internal requisitions', icon: ShoppingCart, color: 'maroon' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.full_name?.split(' ')[0]}</h1>
        <p className="text-sm text-gray-500 mt-1">Engineering & Services Department</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {quickLinks.map((card, i) => (
          <Link
            key={i}
            to={card.path}
            className="group bg-white rounded-xl border border-gray-100 p-5 hover:border-maroon/30 hover:shadow-md transition-all duration-300 flex flex-col"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
              card.color === 'maroon' ? 'bg-maroon/5' : 'bg-navy/5'
            }`}>
              <card.icon size={20} className={card.color === 'maroon' ? 'text-maroon' : 'text-navy'} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{card.label}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
            </div>
            <div className="flex items-center gap-1 mt-4 text-xs font-medium text-maroon opacity-0 group-hover:opacity-100 transition-opacity">
              Open <ArrowRight size={12} />
            </div>
          </Link>
        ))}
      </div>

      {/* Announcement Modal */}
      <AnnouncementModal 
        isOpen={showAnnouncements}
        onClose={() => setShowAnnouncements(false)}
        isMobile={isMobile}
      />
    </div>
  )
}