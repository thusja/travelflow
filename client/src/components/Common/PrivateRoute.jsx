import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";

const PrivateRoute = ({ children }) => {
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return <div className="p-6 text-center text-gray-600">세션 확인 중...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
