import { Link, useNavigate } from "react-router-dom";

function Layout({ children }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div>
      <nav style={styles.nav}>
        <h3>SpendSmart</h3>

        <div>
          <Link to="/upload">Upload</Link>
          <Link to="/dashboard">Dashboard</Link>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <div style={styles.container}>{children}</div>
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 20px",
    background: "#222",
    color: "white",
  },
  container: {
    padding: "20px",
  },
};

export default Layout;
