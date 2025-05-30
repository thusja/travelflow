import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

const ReviewForm = () => {
  const { bookingId } = useParams();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if(file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">후기 작성</h2>
      <p className="mb-2 text-gray-700">예약번호: {bookingId}</p>
      {/* 여기에 별점, 후기내용, 이미지 업로드 등 폼 추가 */}
      <textarea
        className="w-full border p-3 rounded-lg"
        placeholder="후기를 작성해 주세요."
        rows={6}
      ></textarea>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        제출하기
      </button>
    </div>
  );
};

export default ReviewForm;
