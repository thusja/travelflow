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


function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='Login' element={<LoginPage />} />
      <Route path='SignUp' element={<SignUpPage />} />
      <Route path='booking' element={<BookingPage />} />
      <Route path='package' element={<PackagePage />} />
      <Route path='planner' element={<PlannerPage />} />
      <Route path='suggest' element={<SuggestPage />}/>
      <Route path='util' element={<UtilPage />} />
      <Route path='About' element={<AboutPage />}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App
