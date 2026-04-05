import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadPDF from "./pages/UploadPDF";
import UploadBill from "./pages/UploadBill";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <UploadPDF />
            </PrivateRoute>
          }
        />

        <Route
          path="/upload-bill"
          element={
            <PrivateRoute>
              <UploadBill />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
