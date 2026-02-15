import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Lazy loaded pages
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Contact = lazy(() => import('./pages/Contact'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const CookiePolicy = lazy(() => import('./pages/legal/CookiePolicy'));

// Core Product Intelligence pages
const SearchPagePremium = lazy(() => import('./pages/SearchPagePremium'));
const DossierPagePremium = lazy(() => import('./pages/DossierPagePremium'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const BrandPage = lazy(() => import('./pages/BrandPage'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-600"></div>
  </div>
);

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Home and Search are the same unified page */}
          <Route path="/" element={
            <Suspense fallback={<LoadingSpinner />}>
              <SearchPagePremium />
            </Suspense>
          } />
          <Route path="/search" element={
            <Suspense fallback={<LoadingSpinner />}>
              <SearchPagePremium />
            </Suspense>
          } />
          <Route path="/product/:productId" element={
            <Suspense fallback={<LoadingSpinner />}>
              <DossierPagePremium />
            </Suspense>
          } />
          <Route path="/report/:id" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ReportPage />
            </Suspense>
          } />
          <Route path="/brand/:name" element={
            <Suspense fallback={<LoadingSpinner />}>
              <BrandPage />
            </Suspense>
          } />
          
          {/* Standard website pages */}
          <Route path="/about" element={
            <Suspense fallback={<LoadingSpinner />}>
              <AboutUs />
            </Suspense>
          } />
          <Route path="/contact" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Contact />
            </Suspense>
          } />
          <Route path="/terms" element={
            <Suspense fallback={<LoadingSpinner />}>
              <TermsOfService />
            </Suspense>
          } />
          <Route path="/privacy" element={
            <Suspense fallback={<LoadingSpinner />}>
              <PrivacyPolicy />
            </Suspense>
          } />
          <Route path="/cookies" element={
            <Suspense fallback={<LoadingSpinner />}>
              <CookiePolicy />
            </Suspense>
          } />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
