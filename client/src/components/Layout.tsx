import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1>User Management System</h1>
          <div className="header-actions">
            <span className="user-info">
              {user?.fullName} ({user?.role})
            </span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Выйти
            </button>
          </div>
        </div>
      </header>

      <nav className="nav">
        <Link to="/" className="nav-link">
          Dashboard
        </Link>
        {user?.role === 'admin' && (
          <Link to="/users" className="nav-link">
            Пользователи
          </Link>
        )}
      </nav>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

