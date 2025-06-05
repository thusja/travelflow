import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

// 🔧 누락된 요소 등록: 에러 방지
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend
);

const CurrencyCard = ({ name, code, rate, change, percent, history }) => {
  const data = {
    labels: history.map((_, i) => i),
    datasets: [
      {
        data: history,
        borderColor: "#4ade80", // green-400
        backgroundColor: "rgba(74, 222, 128, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { display: false },
    },
    elements: { point: { radius: 0 } },
    maintainAspectRatio: false, // ⚠️ 필요시 유연한 크기 조정
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <div className="text-sm text-gray-500 mb-1">{name} ({code})</div>
      <div className="text-xl font-bold">{rate.toLocaleString()}</div>
      <div className={`text-sm ${percent < 0 ? 'text-blue-600' : 'text-red-600'}`}>
        {change >= 0 ? "+" : ""}
        {change} ({percent}%)
      </div>
      <div className="mt-2 h-16">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default CurrencyCard;
