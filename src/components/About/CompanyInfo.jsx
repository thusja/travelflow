const CompanyInfo = () => {
  return (
    <section className="bg-white p-6 rounded-md shadow max-w-3xl w-full mx-auto">
      <h3 className="text-2xl font-semibold mb-4 text-left">회사정보</h3>
      <p className="text-gray-700 mb-4 text-left">
        📌 <span className="font-medium">Travel Flow</span>는 여행을 쉽게 만드는 플랫폼입니다.
      </p>
      <ul className="text-gray-600 list-disc list-outside pl-5 space-y-1 text-left">
        <li>회사명: Travel Flow Inc.</li>
        <li>설립연도: 2025</li>
        <li>위치: 서울 금천구 가산디지털1로 70</li>
        <li>미션: 누구나 쉽게 여행을 설계하고 실행할 수 있게</li>
      </ul>
    </section>
  );
};

export default CompanyInfo;
