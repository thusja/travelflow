import React from "react";
import Header from "@/components/Common/Header";
import BookingLayout from "@/components/Booking/BookingLayout";


const BookingPage = () => {
  return (
    <div className="w-screen min-h-screen bg-gray-100 flex justify-center items-start pt-20">
      <BookingLayout />
    </div>
  )
}

export default BookingPage;
