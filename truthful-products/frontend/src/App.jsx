import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';

// Lazy loaded pages for better performance
const ProductIntel = lazy(() => import('./pages/ProductIntel'));
const Pricing = lazy(() => import('./pages/Pricing'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Contact = lazy(() => import('./pages/Contact'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const CookiePolicy = lazy(() => import('./pages/legal/CookiePolicy'));

// New ClearPick AI components  
const ProductSearch = lazy(() => import('./components/product/ProductSearch'));
const ProductDossier = lazy(() => import('./components/product/ProductDossier'));

// Premium Pages
const SearchPagePremium = lazy(() => import('./pages/SearchPagePremium'));
const DossierPagePremium = lazy(() => import('./pages/DossierPagePremium'));

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
          <Route path="/" element={<Home />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          
          {/* ClearPick AI Routes - Premium Version */}
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
          
          {/* Legacy routes (old components) */}
          <Route path="/search-old" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProductSearch />
            </Suspense>
          } />
          <Route path="/product-old/:productId" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProductDossier />
            </Suspense>
          } />
          
          {/* Original Routes */}
          <Route path="/product-intel" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProductIntel />
            </Suspense>
          } />
          <Route path="/pricing" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Pricing />
            </Suspense>
          } />
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
