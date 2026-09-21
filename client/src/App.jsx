import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

import Layout from '@/components/Common/Layout';
import ScrollToTop from '@/components/Common/ScrollToTop';
import PrivateRoute from '@/components/Common/PrivateRoute';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/components/Common/ToastProvider.jsx';

const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignUpPage = lazy(() => import('@/pages/SignUpPage'));
const BookingPage = lazy(() => import('@/pages/BookingPage'));
const PackagePage = lazy(() => import('@/pages/PackagePage'));
const PlannerPage = lazy(() => import('@/pages/PlannerPage'));
const SuggestPage = lazy(() => import('@/pages/SuggestPage'));
const UtilPage = lazy(() => import('@/pages/UtilPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));

const MyProfileSidebar = lazy(() => import('@/components/Profiles/MyProfileSidebar'));
const Info = lazy(() => import('@/components/Profiles/profile/Info'));
const ProfileEdit = lazy(() => import('./components/Profiles/profile/ProfileEdit'));
const Password = lazy(() => import('@/components/Profiles/profile/Password'));
const Logs = lazy(() => import('@/components/Profiles/profile/Logs'));
const Withdraw = lazy(() => import('@/components/Profiles/profile/Withdraw'));
const BookingHistory = lazy(() => import('@/components/Profiles/myBookings/History'));
const BookingDetail = lazy(() => import('@/components/Profiles/myBookings/BookingDetail'));
const BookingCancel = lazy(() => import('@/components/Profiles/myBookings/Cancel'));
const BookingReview = lazy(() => import('@/components/Profiles/myBookings/Review'));
const ReviewForm = lazy(() => import('@/components/Profiles/myBookings/ReviewForm'));
const BookingPoints = lazy(() => import('@/components/Profiles/myBookings/Points'));
const AppSetting = lazy(() => import('@/components/Profiles/settings/AppSetting'));
const Notifications = lazy(() => import('@/components/Profiles/settings/Notifications'));

const ProfileShell = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <MyProfileSidebar />
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
};

const AuthLogoutHandler = () => {
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleForcedLogout = () => {
      logout();
      toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('auth:logout-required', handleForcedLogout);
    return () => {
      window.removeEventListener('auth:logout-required', handleForcedLogout);
    };
  }, [location.pathname, logout, navigate, toast]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <AuthLogoutHandler />
      <ScrollToTop />
      <Suspense fallback={<div className="p-6 text-center text-gray-600">페이지를 불러오는 중...</div>}>
        <Routes>
          {/* 로그인 / 로그아웃 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* 메인 / Header */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="booking" element={<BookingPage />} />
            <Route path="package" element={<PackagePage />} />
            <Route path="planner" element={<PlannerPage />} />
            <Route path="suggest" element={<SuggestPage />} />
            <Route path="util" element={<UtilPage />} />
            <Route path="about" element={<AboutPage />} />

            <Route
              element={
                <PrivateRoute>
                  <ProfileShell />
                </PrivateRoute>
              }
            >
              {/* 마이페이지 */}
              <Route path="profile">
                <Route index element={<Navigate to="info" replace />} />
                <Route path="info" element={<Info />} />
                <Route path="edit" element={<ProfileEdit />} />
                <Route path="password" element={<Password />} />
                <Route path="logs" element={<Logs />} />
                <Route path="withdraw" element={<Withdraw />} />
              </Route>

              {/* 나의 예약 */}
              <Route path="myBookings">
                <Route index element={<Navigate to="history" replace />} />
                <Route path="history" element={<BookingHistory />} />
                <Route path="detail/:bookingId" element={<BookingDetail />} />
                <Route path="cancel" element={<BookingCancel />} />
                <Route path="review" element={<BookingReview />} />
                <Route path="review/:bookingId" element={<ReviewForm />} />
                <Route path="points" element={<BookingPoints />} />
              </Route>

              {/* 나의 세팅 */}
              <Route path="settings">
                <Route index element={<Navigate to="app" replace />} />
                <Route path="app" element={<AppSetting />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
