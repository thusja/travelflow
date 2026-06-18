import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LoadingState from '@/components/Common/LoadingState.jsx';
import EmptyState from '@/components/Common/EmptyState.jsx';
import ErrorState from '@/components/Common/ErrorState.jsx';

const Packages = () => {
  const [selectedPackage, setSelectedPackage] = useState('Hot Deals');
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const tabs = ['Hot Deals', 'Special Offers', 'Discounts'];

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/packages");
        const data = await res.json();
        if (!res.ok) {
          throw new Error("패키지 로딩 실패");
        }
        setPackages(data);
      } catch (err) {
        console.error("홈 패키지 조회 오류:", err);
        setError("패키지 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const tabPackages = useMemo(() => {
    const byPriceDesc = [...packages].sort((a, b) => Number(b.price) - Number(a.price));
    const byPriceAsc = [...packages].sort((a, b) => Number(a.price) - Number(b.price));

    return {
      'Hot Deals': byPriceDesc.slice(0, 3),
      'Special Offers': packages.slice(0, 3),
      'Discounts': byPriceAsc.slice(0, 3),
    };
  }, [packages]);

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-12">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
        Best Packages For You
      </h2>

      {/* 탭 선택 */}
      <div className="flex justify-center border-b border-gray-300 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedPackage(tab)}
            className={`px-6 py-2 transition-colors duration-300 text-sm sm:text-base font-medium 
              ${
                selectedPackage === tab
                  ? 'bg-blue-600 text-white rounded-t'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="min-h-[120px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPackage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              <LoadingState message="패키지를 불러오는 중..." />
            ) : error ? (
              <ErrorState message={error} />
            ) : (tabPackages[selectedPackage] || []).length === 0 ? (
              <EmptyState message="표시할 패키지가 없습니다." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(tabPackages[selectedPackage] || []).map((pkg) => (
                  <div key={pkg.id} className="border rounded-lg p-4 bg-white text-left">
                    <p className="text-sm text-gray-400 mb-1">#{pkg.id}</p>
                    <h3 className="font-semibold text-gray-800 mb-2">{pkg.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{pkg.description}</p>
                    <p className="text-emerald-700 font-bold">
                      {Number(pkg.price || 0).toLocaleString()}원
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Discover More 버튼 */}
      <div className="mt-10 text-center">
        <button
          onClick={() => navigate('/package')}
          className="inline-block bg-emerald-600 text-white px-10 py-4 rounded hover:bg-emerald-500 transition duration-300 text-base font-semibold"
        >
          Discover More
        </button>
      </div>
    </section>
  );
};

export default Packages;
