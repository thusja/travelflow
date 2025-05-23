const CustomerService = () => {
  return (
    <section className="bg-white p-6 rounded-md shadow max-w-3xl w-full mx-auto">
      <h3 className="text-2xl font-semibold mb-4 text-left">고객센터 및 상담</h3>
      <p className="text-gray-700 mb-4 text-left">
        궁금한 점이 있으시면 언제든지 연락 주세요.
      </p>
      <ul className="text-gray-600 list-disc list-outside pl-5 space-y-1 text-left">
        <li>📞 전화: 1588-0000</li>
        <li>✉️ 이메일: support@travelflow.com</li>
        <li>🕒 운영시간: 평일 오전 9시 ~ 오후 6시</li>
      </ul>
    </section>
  );
};

export default CustomerService;
