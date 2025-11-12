import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <h2>Добро пожаловать, {user?.fullName}!</h2>
      
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Ваш профиль</h3>
          <div className="profile-info">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Роль:</strong> {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
            <p><strong>Статус:</strong> {user?.isActive ? 'Активен' : 'Заблокирован'}</p>
            <p><strong>Дата рождения:</strong> {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('ru-RU') : '-'}</p>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="dashboard-card">
            <h3>Быстрые действия</h3>
            <div className="quick-actions">
              <a href="/users" className="action-link">
                Управление пользователями
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

