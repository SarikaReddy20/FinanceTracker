import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {

  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/" />;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (payload.exp * 1000 < Date.now()) {
      localStorage.clear();
      return <Navigate to="/" />;
    }

  } catch {
    localStorage.clear();
    return <Navigate to="/" />;
  }

  return children;
}

export default PrivateRoute;