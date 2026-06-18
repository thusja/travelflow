import { Navigate } from "react-router-dom";
import { getStoredUser } from "@/utils/authStorage.js";

const PrivateRoute = ({ children }) => {
  const user = getStoredUser();

  if(!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;
