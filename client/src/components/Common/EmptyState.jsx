const EmptyState = ({ message = "표시할 데이터가 없습니다." }) => {
  return <p className="text-center text-gray-500 py-4">{message}</p>;
};

export default EmptyState;
