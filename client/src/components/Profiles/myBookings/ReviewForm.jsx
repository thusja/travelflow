import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

const ReviewForm = () => {
  const { bookingId } = useParams();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleImageRemove = () => {
    setImage(null);
    setPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!rating || !content.trim()) {
      alert("별점과 후기를 입력해 주세요.");
      return;
    }

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("bookingId", bookingId);
    formData.append("rating", rating);
    formData.append("content", content);
    if (image) {
      formData.append("image", image);
    }

    try {
      const res = await fetch("http://localhost:5000/api/review", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "리뷰 제출 실패");
      }

      alert("후기가 성공적으로 제출되었습니다.");
      navigate("/myBookings/review");
    }
    catch(err) {
      console.error(err);
      alert("후기 제출 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow mt-30">
      <h2 className="text-2xl font-bold mb-4">후기 작성</h2>
      <p className="mb-6 text-gray-600">예약번호: {bookingId}</p>

      {/* 별점 + 사진 업로드 + 미리보기 수평 정렬 */}
      <div className="mb-4 flex justify-between items-start gap-6">
        {/* 별점 */}
        <div>
          <p className="mb-2 text-gray-700 text-left">별점 평가</p>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) =>
              star <= (hover || rating) ? (
                <AiFillStar
                  key={star}
                  size={30}
                  className="text-yellow-400 cursor-pointer"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                />
              ) : (
                <AiOutlineStar
                  key={star}
                  size={30}
                  className="text-gray-400 cursor-pointer"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                />
              )
            )}
          </div>
        </div>

        {/* 사진 업로드 및 미리보기 */}
        <div className="flex flex-col items-end">
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded"
          >
            사진 선택
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <p className="text-xs text-gray-500 mt-1 mb-2">
            {image ? image.name : "선택된 파일 없음"}
          </p>

          {preview && (
            <div className="flex flex-col items-end">
              <img
                src={preview}
                alt="미리보기"
                className="w-32 h-32 object-cover rounded border mb-2"
              />
              <button
                onClick={handleImageRemove}
                className="text-xs text-red-500 underline hover:text-red-700"
              >
                이미지 삭제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 후기 내용 */}
      <div className="mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="6"
          className="w-full p-3 border rounded resize-none"
          placeholder="후기를 작성해 주세요."
        />
      </div>

      {/* 제출 버튼 */}
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        후기 제출
      </button>
    </div>
  );
};

export default ReviewForm;
