import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar/Navbar';
import Footer from './components/common/Footer/Footer';
import HomePage from './pages/Home/HomePage';
import AboutPage from './pages/About/AboutPage';
import ServicesPage from './pages/Services/ServicesPage';
import CoursesPage from './pages/Courses/CoursesPage';
import CourseDetailPage from './pages/Courses/CourseDetailPage';
import EnrollmentPage from './pages/Enrollment/EnrollmentPage';
import ProjectsPage from './pages/Projects/ProjectsPage';
import CareersPage from './pages/Careers/CareersPage';
import BlogPage from './pages/Blog/BlogPage';
import ContactPage from './pages/Contact/ContactPage';
import PrivacyPolicyPage from './pages/Legal/PrivacyPolicyPage';
import TermsPage from './pages/Legal/TermsPage';
import AdminPage from './pages/Admin/AdminPage';
import AdminLoginPage from './pages/Admin/AdminLoginPage';
import AdminProtectedRoute from './components/common/AdminProtectedRoute/AdminProtectedRoute';
import PlaceholderPage from './pages/Placeholders/PlaceholderPage';
import QuickChatBot from './components/common/QuickChatBot/QuickChatBot';
import { AuthProvider } from './context/AuthContext';
import { EnrollmentProvider } from './context/EnrollmentContext';
import EnrollmentModal from './components/common/EnrollmentModal/EnrollmentModal';
import './styles/global.css';
import './styles/responsive.css';

// ScrollToTop on route changes
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    } else {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }
    }
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <EnrollmentProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL || '/'}>
          <ScrollToTop />
          <Navbar />
          <main id="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/enrollment" element={<EnrollmentPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-and-conditions" element={<TermsPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Public Admin Authentication */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminProtectedRoute>
                    <AdminPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <AdminProtectedRoute>
                    <AdminPage />
                  </AdminProtectedRoute>
                }
              />

              <Route path="*" element={<PlaceholderPage />} />
            </Routes>
          </main>
          <EnrollmentModal />
          <QuickChatBot />
          <Footer />
        </BrowserRouter>
      </EnrollmentProvider>
    </AuthProvider>
  );
}
