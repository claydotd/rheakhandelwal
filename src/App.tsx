import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './admin/AdminLayout'
import FaqEditor from './admin/FaqEditor'
import HomeEditor from './admin/HomeEditor'
import PageEditor from './admin/PageEditor'
import DocumentTitle from './components/DocumentTitle'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import AboutMe from './pages/AboutMe'
import Contact from './pages/Contact'
import Fees from './pages/Fees'
import Home from './pages/Home'
import HowIWork from './pages/HowIWork'
import Privacy from './pages/Privacy'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <DocumentTitle />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="how-i-work" element={<HowIWork />} />
          <Route path="fees" element={<Fees />} />
          <Route path="about" element={<AboutMe />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<HomeEditor />} />
          <Route
            path="how-i-work"
            element={<PageEditor pageKey="howIWork" />}
          />
          <Route path="fees" element={<PageEditor pageKey="fees" />} />
          <Route path="about" element={<PageEditor pageKey="about" />} />
          <Route path="contact" element={<PageEditor pageKey="contact" />} />
          <Route path="faq" element={<FaqEditor />} />
          <Route path="privacy" element={<PageEditor pageKey="privacy" />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
