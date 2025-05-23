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
import ScrollToTop from './components/Common/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="package" element={<PackagePage />} />
          <Route path="planner" element={<PlannerPage />} />
          <Route path="suggest" element={<SuggestPage />} />
          <Route path="util" element={<UtilPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
