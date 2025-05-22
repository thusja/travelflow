import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';
import HomePage from "@/pages/HomePage";
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import BookingPage from './pages/BookingPage';


function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='Login' element={<LoginPage />} />
      <Route path='SignUp' element={<SignUpPage />} />
      <Route path='/Booking' element={<BookingPage />} />
    </Routes>
    </BrowserRouter>
  )
}

export default App
