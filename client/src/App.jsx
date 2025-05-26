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

import MyProfileSidebar from "@/components/Profiles/MyProfileSidebar";
import Info from "@/components/Profiles/profile/Info";
import Password from "@/components/Profiles/profile/Password";
import Logs from "@/components/Profiles/profile/Logs";
import Withdraw from "@/components/Profiles/profile/Withdraw";
import BookingHistory from "@/components/Profiles/myBookings/History";
import BookingCancel from "@/components/Profiles/myBookings/Cancel";
import BookingReview from "@/components/Profiles/myBookings/Review";
import BookingPoints from "@/components/Profiles/myBookings/Points";
import AppSetting from "@/components/Profiles/settings/AppSetting";
import Notifications from "@/components/Profiles/settings/Notifications";
import Language from "@/components/Profiles/settings/Language";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* 인증 관련 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* 메인 레이아웃 안에서 */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="package" element={<PackagePage />} />
          <Route path="planner" element={<PlannerPage />} />
          <Route path="suggest" element={<SuggestPage />} />
          <Route path="util" element={<UtilPage />} />
          <Route path="about" element={<AboutPage />} />

          {/* 공통 프로필 사이드바 구조 */}
          <Route
            path="/profile/*"
            element={
              <div className="flex min-h-screen bg-gray-50">
                <MyProfileSidebar />
                <div className="flex-1 p-6">
                  <Routes>
                    <Route path="info" element={<Info />} />
                    <Route path="password" element={<Password />} />
                    <Route path="logs" element={<Logs />} />
                    <Route path="withdraw" element={<Withdraw />} />
                  </Routes>
                </div>
              </div>
            }
          />

          <Route
            path="/myBookings/*"
            element={
              <div className="flex min-h-screen bg-gray-50">
                <MyProfileSidebar />
                <div className="flex-1 p-6">
                  <Routes>
                    <Route index element={<BookingHistory />} />
                    <Route path="history" element={<BookingHistory />} />
                    <Route path="cancel" element={<BookingCancel />} />
                    <Route path="review" element={<BookingReview />} />
                    <Route path="points" element={<BookingPoints />} />
                  </Routes>
                </div>
              </div>
            }
          />

          <Route
            path="/settings/*"
            element={
              <div className="flex min-h-screen bg-gray-50">
                <MyProfileSidebar />
                <div className="flex-1 p-6">
                  <Routes>
                    <Route path="app" element={<AppSetting />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="language" element={<Language />} />
                  </Routes>
                </div>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
