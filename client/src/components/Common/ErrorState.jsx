const ErrorState = ({ message = "오류가 발생했습니다." }) => {
  return <p className="text-center text-red-500 py-4">{message}</p>;
};

export default ErrorState;
