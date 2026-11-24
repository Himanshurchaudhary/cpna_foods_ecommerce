import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ScrollToTop from './Components/ScrollToTop'; // adjust path as needed


// Admin Pages & Components
import LoginPage from './Admin/Pages/Login';
import AdminLayout from './Components/AdminLayout';
import CategoriesPage from './User/Pages/CategoriesPage';
import SubCategoriesPage from "./User/Pages/SubCategoriesPage";



// User Pages & Components
import UserLoginPage from './User/Pages/UserLogin';
import UserLayout from './User/UserLayout';
import HomePage from './User/Pages/HomePage';

// User Shell — visible on all user-side pages
import UserNavbar from './User/Components/Usernavbar';
import UserFooter from './User/Components/Userfooter';
import ResetPassword from './User/Pages/ResetPassword';
import ForgotPassword from './User/Pages/ForgotPassword';


// Driver
import DeliveryAgentApp from './Driver/Deliveryagentapp';



///////////////////////////

import ProductsPage from './User/Pages/Productspage';
import BlogPage from './User/Pages/Blogpage';
import ProductDetails from './User/Pages/Productdetails';
import ContactPage from './User/Pages/Contactpage';
import AboutUs from './User/Pages/Aboutus';
import TermsAndConditions from './User/Pages/Termsandconditions';
import PrivacyPolicy from './User/Pages/Privacypolicy';
import DeleteAccount from './User/Pages/Deleteaccount';


//////////////////////////////////////////////////////////////////////////////////

import CartToast from './User/Components/Carttoast'; // adjust path as needed


/////////////////////////////////////////////////////////////////////////////////

// ─────────────────────────────────────────
// Brand colors (taken from the CPNA logo)
// ─────────────────────────────────────────
const BRAND_GREEN = '#2E8B2E';
const BRAND_GREEN_LIGHT = '#6DBE45';
const BRAND_ORANGE = '#E8641B';

// ─────────────────────────────────────────
// Full-Page Loader Component
// Styled to match the CPNA Food Stuff logo:
// three carrots + green leaves, with
// "CPNA" in green and "Food Stuff" in orange
// ─────────────────────────────────────────
const PageLoader = ({ fading }) => (
  <div style={{
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(ellipse at 50% 40%, #ffffff 0%, #f4f8ee 60%, #e8f1dc 100%)',
    zIndex: 9999,
    opacity: fading ? 0 : 1,
    transition: 'opacity 0.8s ease',
  }}>

    <style>{`
      @keyframes cpna-rise {
        0%   { transform: scaleY(0); opacity: 0; }
        60%  { transform: scaleY(1.06); opacity: 1; }
        100% { transform: scaleY(1); opacity: 1; }
      }
      @keyframes cpna-sway-left {
        0%,100% { transform: rotate(0deg); }
        50%     { transform: rotate(-4deg); }
      }
      @keyframes cpna-sway-right {
        0%,100% { transform: rotate(0deg); }
        50%     { transform: rotate(4deg); }
      }
      @keyframes cpna-spin       { to { transform: rotate(360deg); } }
      @keyframes cpna-spin-rev   { to { transform: rotate(-360deg); } }
      @keyframes cpna-fade-up {
        0%   { opacity: 0; transform: translateY(14px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes cpna-progress {
        0%   { width: 0%; }
        100% { width: 100%; }
      }
      @keyframes cpna-dot {
        0%,100% { opacity: 0.25; transform: scale(0.8); }
        50%     { opacity: 1;    transform: scale(1.15); }
      }
      @keyframes cpna-glow {
        0%,100% { box-shadow: 0 0 0 0 rgba(109,190,69,0); }
        50%     { box-shadow: 0 0 36px 8px rgba(109,190,69,0.22); }
      }

      .cpna-carrot {
        transform-origin: 80px 108px;
        animation: cpna-rise 0.9s cubic-bezier(.2,.8,.3,1) both;
      }
      .cpna-leaf-left {
        transform-origin: 80px 120px;
        animation: cpna-sway-left 3s ease-in-out infinite;
      }
      .cpna-leaf-right {
        transform-origin: 80px 120px;
        animation: cpna-sway-right 3s ease-in-out infinite;
      }
    `}</style>

    {/* Top green accent line */}
    <div style={{
      position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
      width: 140, height: 3,
      background: `linear-gradient(90deg, transparent, ${BRAND_GREEN}, transparent)`,
      borderRadius: 99,
    }} />

    {/* Bottom orange accent line */}
    <div style={{
      position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: 100, height: 3,
      background: `linear-gradient(90deg, transparent, ${BRAND_ORANGE}, transparent)`,
      borderRadius: 99,
    }} />

    {/* Main content */}
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 32, textAlign: 'center',
    }}>

      {/* Logo mark: spinning rings + carrots and leaves */}
      <div style={{
        position: 'relative', width: 190, height: 190, marginBottom: 18,
        borderRadius: '50%', animation: 'cpna-glow 2.6s ease-in-out infinite',
      }}>

        {/* Outer dashed ring — green, clockwise */}
        <svg width="190" height="190" viewBox="0 0 190 190"
          style={{ position: 'absolute', inset: 0, animation: 'cpna-spin 6s linear infinite' }}>
          <circle cx="95" cy="95" r="90" stroke={BRAND_GREEN_LIGHT} strokeWidth="2" fill="none"
            strokeDasharray="10 8" strokeLinecap="round" opacity="0.7" />
        </svg>

        {/* Inner dashed ring — orange, counter-clockwise */}
        <svg width="190" height="190" viewBox="0 0 190 190"
          style={{ position: 'absolute', inset: 0, animation: 'cpna-spin-rev 4.5s linear infinite' }}>
          <circle cx="95" cy="95" r="78" stroke={BRAND_ORANGE} strokeWidth="1.5" fill="none"
            strokeDasharray="4 12" strokeLinecap="round" opacity="0.55" />
        </svg>

        {/* White disc behind the logo, like the logo's circular badge */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 140, height: 140, background: '#ffffff', borderRadius: '50%',
          border: '1px solid rgba(46,139,46,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="120" height="112" viewBox="0 0 160 150" fill="none" xmlns="http://www.w3.org/2000/svg">

            {/* Leaves (left & right) */}
            <g className="cpna-leaf-left">
              <path d="M80 122 Q44 96 12 112 Q40 138 80 122Z" fill={BRAND_GREEN} />
              <path d="M80 122 Q46 112 22 113" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
            </g>
            <g className="cpna-leaf-right">
              <path d="M80 122 Q116 96 148 112 Q120 138 80 122Z" fill={BRAND_GREEN} />
              <path d="M80 122 Q114 112 138 113" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
            </g>

            {/* Left carrot */}
            <g transform="rotate(-24 80 112)">
              <g className="cpna-carrot" style={{ animationDelay: '0.1s' }}>
                <path d="M70 40 Q80 34 90 40 L84 104 Q80 112 76 104 Z" fill={BRAND_ORANGE} />
                <path d="M72 32 Q70 20 76 14 Q80 24 78 33Z" fill={BRAND_GREEN} />
                <path d="M80 33 Q80 18 86 12 Q88 24 84 34Z" fill={BRAND_GREEN_LIGHT} />
              </g>
            </g>

            {/* Right carrot */}
            <g transform="rotate(24 80 112)">
              <g className="cpna-carrot" style={{ animationDelay: '0.3s' }}>
                <path d="M70 40 Q80 34 90 40 L84 104 Q80 112 76 104 Z" fill={BRAND_ORANGE} />
                <path d="M72 32 Q70 20 76 14 Q80 24 78 33Z" fill={BRAND_GREEN} />
                <path d="M80 33 Q80 18 86 12 Q88 24 84 34Z" fill={BRAND_GREEN_LIGHT} />
              </g>
            </g>

            {/* Center carrot (drawn last so it sits in front) */}
            <g className="cpna-carrot" style={{ animationDelay: '0.2s' }}>
              <path d="M69 34 Q80 27 91 34 L84 108 Q80 118 76 108 Z" fill="#F07A2A" />
              <path d="M72 26 Q69 12 76 5 Q80 17 78 27Z" fill={BRAND_GREEN} />
              <path d="M78 27 Q80 10 84 4 Q88 16 83 28Z" fill={BRAND_GREEN_LIGHT} />
              <path d="M82 28 Q88 14 96 12 Q94 24 86 30Z" fill={BRAND_GREEN} />
            </g>
          </svg>
        </div>
      </div>

      {/* Brand name: CPNA (green) + Food Stuff (orange) */}
      <div style={{ animation: 'cpna-fade-up 0.6s 0.1s ease both' }}>
        <div style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 52, fontWeight: 700, letterSpacing: 10,
          color: BRAND_GREEN, lineHeight: 1, paddingLeft: 10,
        }}>
          CPNA
        </div>
        <div style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 24, fontWeight: 700, letterSpacing: 5,
          color: BRAND_ORANGE, marginTop: 6,
        }}>
          Food Stuff
        </div>
      </div>

      {/* Tagline */}
      <p style={{
        animation: 'cpna-fade-up 0.6s 0.25s ease both',
        fontSize: 12, color: '#6b7a5e', letterSpacing: '3px',
        margin: '14px 0 22px', fontWeight: 600, textTransform: 'uppercase',
      }}>
        Fresh &bull; Quality &bull; Trusted
      </p>

      {/* Progress bar */}
      <div style={{ animation: 'cpna-fade-up 0.65s 0.35s ease both', width: 220, marginBottom: 14 }}>
        <div style={{
          width: '100%', height: 4, background: 'rgba(46,139,46,0.12)',
          borderRadius: 99, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: `linear-gradient(90deg, ${BRAND_GREEN}, ${BRAND_GREEN_LIGHT}, ${BRAND_ORANGE})`,
            borderRadius: 99,
            animation: 'cpna-progress 2.2s cubic-bezier(.4,0,.2,1) infinite alternate',
          }} />
        </div>
      </div>

      {/* Loading dots */}
      <div style={{ display: 'flex', gap: 6, animation: 'cpna-fade-up 0.7s 0.45s ease both' }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: i === 1 ? BRAND_ORANGE : BRAND_GREEN,
            animation: `cpna-dot 1.2s ${delay}s ease-in-out infinite`,
          }} />
        ))}
      </div>

    </div>
  </div>
);







// ─────────────────────────────────────────
// Admin Protected Route — checks adminToken
// If no token → redirect to /admin/login
// ─────────────────────────────────────────
const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};


// ─────────────────────────────────────────
// User Protected Route — checks userToken
// If no token → redirect to /user/login
// ─────────────────────────────────────────
const UserProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('userToken');
  if (!token) {
    return <Navigate to="/user/login" replace />;
  }
  return children;
};


// ─────────────────────────────────────────
// Layout wrapper — shows navbar & footer
// only on non-admin and non-driver routes
// ─────────────────────────────────────────
const AppLayout = ({ children }) => {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');
  const isDriverRoute = pathname.startsWith('/driver');


  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {!isAdminRoute && !isDriverRoute && <UserNavbar />}
      <main className="flex-1">{children}</main>
      {!isAdminRoute && !isDriverRoute && <UserFooter />}
    </div>
  );
};


function App() {
  const [appReady, setAppReady] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Simulates waiting for fonts, tokens, configs, etc.
    // Replace this with real async calls if needed
    let unmountTimer;
    const timer = setTimeout(() => {
      setFadeOut(true); // trigger fade animation
      // Unmount the loader after the fade finishes (matches the 0.8s CSS transition)
      unmountTimer = setTimeout(() => setAppReady(true), 800);
    }, 1500); // short intentional delay so the loader doesn't just flash on fast loads

    return () => {
      clearTimeout(timer);
      clearTimeout(unmountTimer);
    };
  }, []);

  // Show loader until the app is ready
  if (!appReady) return <PageLoader fading={fadeOut} />;

  return (
    <AppLayout>
      <CartToast />
      <Routes>

        {/* 1. Default Route → Home page */}
        <Route path="/" element={<HomePage />} />

        {/* ──────────────────────────────── */}
        {/*         ADMIN ROUTES             */}
        {/* ──────────────────────────────── */}

        {/* 2. Public Route — Admin Login */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* 3. Protected Admin Routes
            - Any path under /admin/* is protected
            - No token → goes back to /admin/login automatically */}
        <Route
          path="/admin/*"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        />

        {/* ──────────────────────────────── */}
        {/*         USER ROUTES              */}
        {/* ──────────────────────────────── */}

        {/* 4. Public Routes — no token required */}
        <Route path="/user/login" element={<UserLoginPage />} />
        <Route path="/user/product" element={<ProductsPage />} />
        <Route path="/user/blog" element={<BlogPage />} />
        <Route path="/products/:slug" element={<ProductDetails />} />
        <Route path="/user/contect" element={<ContactPage />} />
        <Route path="/user/about" element={<AboutUs />} />
        <Route path="/user/termcondition" element={<TermsAndConditions />} />
        <Route path="/user/privacy" element={<PrivacyPolicy />} />
        <Route path="/user/deleteaccount" element={<DeleteAccount />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/user/categories/:categoryId" element={<SubCategoriesPage />} />
        <Route path="/user/categories" element={<CategoriesPage />} />


        {/* /////////////////// driver /////////////////////////////////// */}

        <Route path="/driver/*" element={<DeliveryAgentApp />} />

        {/* /////////////////// driver /////////////////////////////////// */}


        {/* 5. Protected User Routes
            - Any path under /user/* is protected
            - No token → goes back to /user/login automatically */}
        <Route
          path="/user/*"
          element={
            <UserProtectedRoute>
              <UserLayout />
            </UserProtectedRoute>
          }
        />

        {/* 6. 404 Fallback */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen font-bold text-2xl text-slate-400">
              404 - Page Not Found
            </div>
          }
        />

      </Routes>
    </AppLayout>
  );
}

export default App;