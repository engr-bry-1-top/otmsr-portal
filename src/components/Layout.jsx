import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { LayoutDashboard, CreditCard, BookOpen, FileText, ShoppingCart, Settings, LogOut, Menu, X, ChevronLeft, BarChart3, TrendingUp, Search, ClipboardCheck, Calendar, Headset, Star, ClipboardList, Bell, Megaphone } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [avatar, setAvatar] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem('otmsr_user')
    if (!stored) { navigate('/'); return }
    const userData = JSON.parse(stored)
    setUser(userData)
    fetchAvatar(userData)
  }, [navigate])

  useEffect(() => {
    if (user?.username) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchAvatar = async (userData) => {
    const { data } = await supabase.from('profiles').select('avatar_url').eq('username', userData.username).single()
    if (data?.avatar_url) setAvatar(data.avatar_url)
  }

  const fetchNotifications = async () => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('username', user.username)
        .order('created_at', { ascending: false })
        .limit(20)
      
      const { data: annData } = await supabase
        .from('announcements')
        .select('*')
        .eq('username', user.username)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10)
      
      const combined = [
        ...(annData || []).map(a => ({ ...a, type: 'announcement' })),
        ...(data || []).map(n => ({ ...n, type: 'notification' }))
      ]
      
      setNotifications(combined)
      setUnreadCount(combined.filter(n => !n.is_read).length)
    } catch (err) { console.error(err) }
  }

  const markNotificationRead = async (id, link) => {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
      if (link) navigate(link)
      setNotificationOpen(false)
    } catch (err) { console.error(err) }
  }

  const markAnnouncementRead = async (id, link) => {
    try {
      await supabase.from('announcements').update({ is_read: true }).eq('id', id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
      if (link) navigate(link)
      setNotificationOpen(false)
    } catch (err) { console.error(err) }
  }

  const markAllRead = async () => {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('username', user.username).eq('is_read', false)
      await supabase.from('announcements').update({ is_read: true }).eq('username', user.username).eq('is_read', false)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) { console.error(err) }
  }

  const handleLogout = () => {
    setLoggingOut(true)
    setTimeout(() => {
      localStorage.removeItem('otmsr_user')
      navigate('/')
    }, 700)
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/announcements', label: 'Announcements', icon: Megaphone },
    { path: '/deployment', label: 'Deployment', icon: BarChart3 },
    { path: '/team-performance', label: 'Team Performance', icon: TrendingUp },
    { path: '/card/edit', label: 'Calling Card', icon: CreditCard },
    { path: '/manuals', label: 'Manual Library', icon: BookOpen },
    { path: '/service-requests', label: 'Service Requests', icon: FileText },
    { path: '/po-tracker', label: 'PO Tracker', icon: Search },
    { path: '/pms-tracker', label: 'PMS Tracker', icon: ClipboardCheck },
    { path: '/coa', label: 'COA Calendar', icon: Calendar },
    { path: '/concerns', label: 'Concerns', icon: Headset },
    { path: '/feedback', label: 'Feedback', icon: Star },
    { path: '/my-soa', label: 'My SOA', icon: FileText },
    { path: '/purchase-request/new', label: 'Purchase Requests', icon: ShoppingCart },
  ]

  const isActive = (path) => location.pathname === path

  if (!user) return null

  return (
    <div className="min-h-screen flex">
      <style>{`
        @keyframes pageSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-in {
          animation: pageSlideIn 0.3s ease-out;
        }
        .overlay-in {
          animation: overlayFadeIn 0.2s ease-out;
        }
      `}</style>

      {loggingOut && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-[3px] border-gray-100 border-t-maroon rounded-full animate-spin" />
          <p className="text-sm font-semibold text-maroon tracking-wide">Signing out...</p>
        </div>
      )}

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden overlay-in" onClick={() => setSidebarOpen(false)} />
      )}

      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 bg-maroon flex flex-col lg:static lg:h-screen ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ 
          width: sidebarCollapsed ? '64px' : '240px',
          transition: 'width 0.25s ease, transform 0.3s ease-in-out',
          minWidth: sidebarCollapsed ? '64px' : '240px',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <div className={`h-16 flex items-center border-b border-white/10 px-3 flex-shrink-0 ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-5'}`}>
          {!sidebarCollapsed && (
            <>
              <img src="/images/logo.png" alt="" className="h-7 brightness-0 invert flex-shrink-0" />
              <div className="leading-tight min-w-0">
                <p className="text-sm font-bold text-white tracking-tight truncate">OTMSR</p>
                <p className="text-[10px] text-white/50 truncate">Engineering & Services</p>
              </div>
            </>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-white/40 hover:text-white hover:bg-white/10 flex-shrink-0" title={sidebarCollapsed ? 'Expand' : 'Collapse'}>
            <ChevronLeft size={16} style={{ transition: 'transform 0.25s ease', transform: sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          {navItems.map(item => (
            <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} title={sidebarCollapsed ? item.label : ''}
              className={`flex items-center gap-3 rounded-lg text-sm font-medium ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'} ${isActive(item.path) ? 'bg-white text-maroon shadow-lg' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
              <item.icon size={18} className="flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <Link to="/profile" onClick={() => setSidebarOpen(false)} title={sidebarCollapsed ? 'Profile' : ''}
            className={`flex items-center gap-3 rounded-lg text-sm font-medium ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'} ${isActive('/profile') ? 'bg-white text-maroon' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
            <Settings size={18} className="flex-shrink-0" />
            {!sidebarCollapsed && <span>Profile Settings</span>}
          </Link>
          <button onClick={handleLogout} title={sidebarCollapsed ? 'Sign out' : ''}
            className={`flex items-center gap-3 rounded-lg text-sm font-medium text-white/40 hover:bg-white/10 hover:text-white w-full mt-1 ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'}`}>
            <LogOut size={18} className="flex-shrink-0" />
            {!sidebarCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-2 md:px-6 flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-gray-400 hover:text-gray-600 p-1">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-1.5 md:gap-2 ml-auto">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotificationOpen(!notificationOpen)} 
                className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-maroon transition-colors"
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotificationOpen(false)} />
                  <div className="fixed left-3 right-3 top-16 md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:w-96 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 max-h-[60vh] md:max-h-[400px] overflow-y-auto">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50">
                      <p className="text-sm font-semibold text-gray-800">Notifications</p>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-maroon hover:text-maroon-dark font-medium">
                          Mark all read
                        </button>
                      )}
                    </div>
                    
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell size={28} className="mx-auto text-gray-200 mb-2" />
                        <p className="text-sm text-gray-400">No notifications</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <button
                          key={`${notif.type}-${notif.id}`}
                          onClick={() => notif.type === 'announcement' 
                            ? markAnnouncementRead(notif.id, notif.link)
                            : markNotificationRead(notif.id, notif.link)
                          }
                          className={`flex items-start gap-3 px-4 py-3 w-full text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                            !notif.is_read ? 'bg-maroon/5' : ''
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notif.is_read ? (notif.type === 'announcement' ? 'bg-amber-500' : 'bg-maroon') : 'bg-gray-200'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${!notif.is_read ? 'text-gray-900' : 'text-gray-500'} break-words`}>
                              {notif.type === 'announcement' ? '📢 ' : ''}{notif.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 break-words whitespace-normal">{notif.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(notif.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* My DWAR button */}
            <Link to="/my-dwar" className="flex items-center gap-1.5 md:gap-2 hover:bg-maroon/5 text-maroon rounded-lg px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium">
              <ClipboardList size={16} className="flex-shrink-0" />
              <span className="hidden sm:inline">My DWAR</span>
              <span className="sm:hidden">DWAR</span>
            </Link>

            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-1.5 md:gap-3 hover:bg-gray-50 rounded-lg px-1.5 md:px-3 py-1.5">
                <div className="w-8 h-8 rounded-full bg-maroon flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                  {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-700 leading-tight">{user.full_name?.split(' ')[0]}</p>
                  <p className="text-xs text-gray-400 leading-tight">{user.role}</p>
                </div>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-medium text-gray-800">{user.full_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{user.role}</p>
                    </div>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                      <Settings size={16} /> Profile Settings
                    </Link>
                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full">
                        <LogOut size={16} /> Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 md:p-6 overflow-y-auto">
          <div className="animate-in" key={location.key}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}