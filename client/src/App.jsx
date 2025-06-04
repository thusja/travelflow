import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

import HomePage from "@/pages/HomePage";
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import BookingPage from '@/pages/BookingPage';
import PackagePage from "@/pages/PackagePage";
import PlannerPage from '@/pages/PlannerPage';
import SuggestPage from '@/pages/SuggestPage';
import UtilPage from '@/pages/UtilPage';
import AboutPage from '@/pages/AboutPage';

import Layout from '@/components/Common/Layout';
import ScrollToTop from '@/components/Common/ScrollToTop';
import PrivateRoute from '@/components/Common/PrivateRoute';

import MyProfileSidebar from "@/components/Profiles/MyProfileSidebar";
import Info from "@/components/Profiles/profile/Info";
import ProfileEdit from './components/Profiles/profile/ProfileEdit';
import Password from "@/components/Profiles/profile/Password";
import Logs from "@/components/Profiles/profile/Logs";
import Withdraw from "@/components/Profiles/profile/Withdraw";
import BookingHistory from "@/components/Profiles/myBookings/History";
import BookingDetail from '@/components/Profiles/myBookings/BookingDetail';
import BookingCancel from "@/components/Profiles/myBookings/Cancel";
import BookingReview from "@/components/Profiles/myBookings/Review";
import ReviewForm from '@/components/Profiles/myBookings/ReviewForm';
import BookingPoints from "@/components/Profiles/myBookings/Points";
import AppSetting from "@/components/Profiles/settings/AppSetting";
import Notifications from "@/components/Profiles/settings/Notifications";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
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

          {/* 마이페이지 */}
          <Route
            path="/profile/*"
            element={
              <PrivateRoute>
                <div className="flex min-h-screen bg-gray-50">
                  <MyProfileSidebar />
                  <div className="flex-1 p-6">
                    <Routes>
                      <Route path="info" element={<Info />} />
                      <Route path='edit' element={<ProfileEdit />} />
                      <Route path="password" element={<Password />} />
                      <Route path="logs" element={<Logs />} />
                      <Route path="withdraw" element={<Withdraw />} />
                    </Routes>
                  </div>
                </div>
              </PrivateRoute>
            }
          />

          {/* 나의 예약 */}
          <Route
            path="/myBookings/*"
            element={
              <PrivateRoute>
                <div className="flex min-h-screen bg-gray-50">
                  <MyProfileSidebar />
                  <div className="flex-1 p-6">
                    <Routes>
                      <Route index element={<BookingHistory />} />
                      <Route path="history" element={<BookingHistory />} />
                      <Route path="detail/:bookingId" element={<BookingDetail />} />
                      <Route path="cancel" element={<BookingCancel />} />
                      <Route path="review" element={<BookingReview />} />
                      <Route path="review/:bookingId" element={<ReviewForm />} />
                      <Route path="points" element={<BookingPoints />} />
                    </Routes>
                  </div>
                </div>
              </PrivateRoute>
            }
          />

          {/* 나의 세팅 */}
          <Route
            path="/settings/*"
            element={
              <PrivateRoute>
                <div className="flex min-h-screen bg-gray-50">
                  <MyProfileSidebar />
                  <div className="flex-1 p-6">
                    <Routes>
                      <Route path="app" element={<AppSetting />} />
                      <Route path="notifications" element={<Notifications />} />
                    </Routes>
                  </div>
                </div>
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
