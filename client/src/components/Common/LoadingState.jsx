const LoadingState = ({ message = "불러오는 중..." }) => {
  return <p className="text-center text-gray-500 py-4">{message}</p>;
};

export default LoadingState;
