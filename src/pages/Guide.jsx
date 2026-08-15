import { useState } from 'react'
import { ChevronDown, HelpCircle, Bell, Calendar, ClipboardList, FileText, Search, Headset, Star, Megaphone, Settings, LogOut, BarChart3, TrendingUp } from 'lucide-react'

export default function Guide() {
  const [openSection, setOpenSection] = useState('getting-started')

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section)
  }

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: HelpCircle,
      content: (
        <>
          <p>Welcome to the OTMSR Portal! This guide will help you navigate and use the portal effectively.</p>
          
          <h3>Logging In</h3>
          <p>Enter your username and password on the login page. You'll see a Data Privacy & Intellectual Property notice — click "I Agree and Understand" to proceed.</p>
          
          <h3>Navigation</h3>
          <p>Use the sidebar on the left to navigate between pages. On mobile, tap the hamburger menu (☰) to open the sidebar.</p>
          
          <h3>Top Bar Icons</h3>
          <ul>
            <li><strong>❓ Help</strong> — Opens this guide</li>
            <li><strong>🔔 Bell</strong> — Notifications and announcements</li>
            <li><strong>📋 DWAR</strong> — Quick access to Daily Work Accomplishment Report</li>
            <li><strong>👤 Profile</strong> — Your account settings</li>
          </ul>
        </>
      )
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: BarChart3,
      content: (
        <>
          <p>The dashboard shows quick links to all modules. Announcements will pop up as a modal when you log in.</p>
          <p>If you have unread announcements, the bell icon will show a red badge with the count.</p>
        </>
      )
    },
    {
      id: 'coa',
      title: 'COA Calendar',
      icon: Calendar,
      content: (
        <>
          <h3>Viewing Schedules</h3>
          <p>Use the month and year dropdowns to navigate. Click any activity tag to view details (non-admin) or edit (admin).</p>
          
          <h3>For Admins</h3>
          <ul>
            <li><strong>Add Activity:</strong> Click any empty cell or the + icon</li>
            <li><strong>Assign Engineers:</strong> Check the engineers in the modal</li>
            <li><strong>Extended Schedule:</strong> Check "Extended Schedule" to set multiple days</li>
            <li><strong>Delete:</strong> Click an activity → Delete button</li>
            <li><strong>Create Next Month:</strong> Button in the header initializes the next month</li>
          </ul>
          
          <h3>Notifications</h3>
          <p>When admin saves COA changes, all engineers receive an in-app notification via the bell icon.</p>
        </>
      )
    },
    {
      id: 'dwar',
      title: 'My DWAR',
      icon: ClipboardList,
      content: (
        <>
          <h3>Daily Work Accomplishment Report</h3>
          <p>DWAR is organized by quarter (Q1-Q4). Each quarter has multiple weeks with Monday-Friday working days.</p>
          
          <h3>How to Fill</h3>
          <ul>
            <li>Select Quarter and Year</li>
            <li>Select Week (each week shows Mon-Fri dates)</li>
            <li>Click + icon on a date row to add entry</li>
            <li>Fill Time In, Time Out, Work Schedule, Activity Done, Remarks</li>
            <li>Click Save</li>
          </ul>
          
          <h3>Print</h3>
          <p>Click Print to generate a PDF. You can select quarter range and week range.</p>
        </>
      )
    },
    {
      id: 'soa',
      title: 'My SOA',
      icon: FileText,
      content: (
        <>
          <h3>Summary of Accomplishment</h3>
          <p>Track your accomplishments by month. Each entry includes Date, PO, Region, Hospital/Location, Description, FSR#, and Remarks.</p>
          
          <h3>How to Fill</h3>
          <ul>
            <li>Select Month and Year</li>
            <li>Click "Add Entry"</li>
            <li>Fill the required fields</li>
            <li>Click Save</li>
          </ul>
        </>
      )
    },
    {
      id: 'po-tracker',
      title: 'PO Tracker',
      icon: Search,
      content: (
        <>
          <h3>Search Purchase Orders</h3>
          <p>Enter a PO number or facility name and click Search. Results show equipment model, brand, and quantity without expanding.</p>
          <p>Click any result to see full details.</p>
        </>
      )
    },
    {
      id: 'concerns',
      title: 'Customer Concerns',
      icon: Headset,
      content: (
        <>
          <h3>Track Customer Issues</h3>
          <p>View all customer concerns submitted via the Google Form. Filter by status or region.</p>
          
          <h3>Status Updates</h3>
          <p>Change the status dropdown (New → In Progress → Resolved → Closed). An email is automatically sent to the customer.</p>
        </>
      )
    },
    {
      id: 'announcements',
      title: 'Announcements (Admin Only)',
      icon: Megaphone,
      content: (
        <>
          <h3>Send Announcements</h3>
          <p>Admins can send announcements to all engineers. These appear as:</p>
          <ul>
            <li>Popup modal on dashboard</li>
            <li>In-app notification (bell icon)</li>
            <li>Email notification</li>
            <li>Push notification (if subscribed)</li>
          </ul>
        </>
      )
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      content: (
        <>
          <h3>Bell Icon</h3>
          <p>The bell icon in the top bar shows unread notifications. Click it to see:</p>
          <ul>
            <li>Announcements (amber dot)</li>
            <li>COA updates (maroon dot)</li>
          </ul>
          <p>Click any notification to mark it as read and navigate to the relevant page.</p>
          <p>Use "Mark all read" to clear all notifications.</p>
        </>
      )
    },
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: Settings,
      content: (
        <>
          <h3>Account Information</h3>
          <p>View your full name, role, and username. You can also:</p>
          <ul>
            <li>Upload profile picture (with crop/zoom)</li>
            <li>Change password</li>
          </ul>
        </>
      )
    },
  ]

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900">User Guide</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Everything you need to know about the OTMSR Portal</p>
      </div>

      <div className="space-y-2">
        {sections.map(section => (
          <div key={section.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-4 md:px-6 py-3 md:py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2 md:gap-3">
                <section.icon size={16} className="text-maroon flex-shrink-0" />
                <span className="text-sm md:text-base font-medium text-gray-900">{section.title}</span>
              </div>
              <ChevronDown 
                size={16} 
                className={`text-gray-400 transition-transform ${openSection === section.id ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {openSection === section.id && (
              <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-100 text-sm text-gray-700">
                <div className="space-y-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-maroon [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:text-xs md:[&_p]:text-sm [&_p]:text-gray-600 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-xs md:[&_ul]:text-sm [&_ul]:text-gray-600 [&_li]:mb-1">
                  {section.content}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 bg-maroon/5 border border-maroon/10 rounded-xl p-4 text-center">
        <p className="text-xs text-gray-600">
          Need more help? Contact <strong>Engr. Brian Ezekiel D. Batalon</strong>
        </p>
        <p className="text-xs text-gray-500 mt-1">brianezekiel.onetop@gmail.com</p>
      </div>
    </div>
  )
}