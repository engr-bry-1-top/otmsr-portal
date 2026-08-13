import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ServiceRequests from './pages/ServiceRequests'
import ServiceRequestView from './pages/ServiceRequestView'
import CallingCard from './pages/CallingCard'
import Profile from './pages/Profile'
import ServiceForm from './pages/ServiceForm'
import Deployment from './pages/Deployment'
import POTracker from './pages/POTracker'
import PMSTracker from './pages/PMSTracker'
import CustomerConcerns from './pages/CustomerConcerns'
import ClientFeedback from './pages/ClientFeedback'
import COACalendar from './pages/COACalendar'
import TeamPerformance from './pages/TeamPerformance'
import Layout from './components/Layout'
import ManualLibrary from './pages/ManualLibrary'
import PurchaseRequest from './pages/PurchaseRequest'
import MyDwar from './pages/MyDwar'
import TeamDwar from './pages/TeamDwar'
import MySoa from './pages/MySoa'
import TeamSoa from './pages/TeamSoa'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/service-request" element={<ServiceForm />} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/service-requests" element={<Layout><ServiceRequests /></Layout>} />
      <Route path="/service-request/view/:id" element={<Layout><ServiceRequestView /></Layout>} />
      <Route path="/card/edit" element={<Layout><CallingCard /></Layout>} />
      <Route path="/profile" element={<Layout><Profile /></Layout>} />
      <Route path="/deployment" element={<Layout><Deployment /></Layout>} />
      <Route path="/po-tracker" element={<Layout><POTracker /></Layout>} />
      <Route path="/pms-tracker" element={<Layout><PMSTracker /></Layout>} />
      <Route path="/concerns" element={<Layout><CustomerConcerns /></Layout>} />
      <Route path="/feedback" element={<Layout><ClientFeedback /></Layout>} />
      <Route path="/coa" element={<Layout><COACalendar /></Layout>} />
      <Route path="/team-performance" element={<Layout><TeamPerformance /></Layout>} />
      <Route path="/manuals" element={<Layout><ManualLibrary /></Layout>} />
      <Route path="/purchase-request/new" element={<Layout><PurchaseRequest /></Layout>} />
      <Route path="/my-dwar" element={<Layout><MyDwar /></Layout>} />
      <Route path="/team-dwar" element={<Layout><TeamDwar /></Layout>} />
      <Route path="/my-soa" element={<Layout><MySoa /></Layout>} />
      <Route path="/team-soa" element={<Layout><TeamSoa /></Layout>} />
    </Routes>
  )
}

export default App