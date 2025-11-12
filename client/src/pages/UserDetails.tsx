import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api/client';
import { User } from '../types';
import './UserDetails.css';

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getById(id!);
      setUser(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки пользователя');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!id || !window.confirm('Вы уверены, что хотите заблокировать этого пользователя?')) {
      return;
    }

    try {
      setBlocking(true);
      await usersAPI.block(id);
      await loadUser(); // Перезагружаем данные пользователя
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка блокировки пользователя');
    } finally {
      setBlocking(false);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (error && !user) {
    return (
      <div className="user-details">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          Назад
        </button>
      </div>
    );
  }

  if (!user) {
    return <div className="error-message">Пользователь не найден</div>;
  }

  const canBlock = currentUser?.role === 'admin' || currentUser?._id === user._id;

  return (
    <div className="user-details">
      <div className="user-details-header">
        <h2>Информация о пользователе</h2>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          Назад
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="user-details-card">
        <div className="detail-row">
          <strong>ФИО:</strong>
          <span>{user.fullName}</span>
        </div>
        <div className="detail-row">
          <strong>Email:</strong>
          <span>{user.email}</span>
        </div>
        <div className="detail-row">
          <strong>Дата рождения:</strong>
          <span>
            {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('ru-RU') : '-'}
          </span>
        </div>
        <div className="detail-row">
          <strong>Роль:</strong>
          <span className={`role-badge ${user.role}`}>
            {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
          </span>
        </div>
        <div className="detail-row">
          <strong>Статус:</strong>
          <span className={`status-badge ${user.isActive ? 'active' : 'blocked'}`}>
            {user.isActive ? 'Активен' : 'Заблокирован'}
          </span>
        </div>
        <div className="detail-row">
          <strong>Дата регистрации:</strong>
          <span>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</span>
        </div>
        <div className="detail-row">
          <strong>Последнее обновление:</strong>
          <span>{new Date(user.updatedAt).toLocaleDateString('ru-RU')}</span>
        </div>
      </div>

      {canBlock && user.isActive && (
        <div className="user-actions">
          <button
            onClick={handleBlock}
            className="btn btn-danger"
            disabled={blocking}
          >
            {blocking ? 'Блокировка...' : 'Заблокировать пользователя'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDetails;

