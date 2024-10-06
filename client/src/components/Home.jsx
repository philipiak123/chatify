import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import PasswordModal from './PasswordModal';
import './Home.css'; // Importujemy plik CSS
import defaultAvatar from './avatar.png'; // Upewnij się, że ścieżka jest poprawna

const Home = () => {
  const [users, setUsers] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // Stan dla trybu ciemnego
  const navigate = useNavigate();
  const { setRecipient } = useChat();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const authResponse = await axios.get('http://localhost:3001/check-auth', { withCredentials: true });
        if (authResponse.data.loggedIn) {
          setLoggedInUser(authResponse.data.user);
          setDarkMode(authResponse.data.user.darkMode); // Ustawienie trybu ciemnego na podstawie sesji
        }

        const response = await axios.get('http://localhost:3001/users', {
          withCredentials: true,
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3001/logout', {}, {
        withCredentials: true,
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleChat = (user) => {
    setRecipient(user);
    navigate('/chat');
  };

  const handleAvatarChange = async (e) => {
    e.preventDefault();
    if (!selectedAvatar) {
      alert('Wybierz plik awatara!');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', selectedAvatar);

    try {
      const response = await axios.post('http://localhost:3001/change-avatar', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(response.data.message);
      setLoggedInUser(prevUser => ({ ...prevUser, avatarUrl: response.data.avatarUrl }));
      setUsers((prevUsers) => prevUsers.map(user => 
        user.userId === response.data.userId ? { ...user, avatarUrl: response.data.avatarUrl } : user
      ));
    } catch (error) {
      console.error('Error changing avatar:', error);
      alert('Błąd podczas zmiany awatara!');
    }
  };

  const handlePasswordChange = async (oldPassword, newPassword) => {
    try {
      const response = await axios.post('http://localhost:3001/change-password', 
        { oldPassword, newPassword }, 
        { withCredentials: true } 
      );
      alert(response.data.message);
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Błąd podczas zmiany hasła!');
    }
  };

  const toggleDarkMode = async () => {
    try {
      const response = await axios.post('http://localhost:3001/toggle-dark-mode', {}, {
        withCredentials: true,
      });
      setDarkMode(response.data.darkMode); // Ustawienie trybu ciemnego po odpowiedzi
    } catch (error) {
      console.error('Błąd podczas zmiany trybu ciemnego:', error);
    }
  };

  return (
    <div className={`home-container ${darkMode ? 'dark-mode' : ''}`}>
      <h1>Home Page</h1>
      <button onClick={handleLogout}>Logout</button>

      {loggedInUser && (
        <div>
          <h2>Twój profil</h2>
          {loggedInUser.avatarUrl && (
            <img
              src={loggedInUser.avatarUrl}
              alt="Your avatar"
              style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px' }}
            />
          )}
          <span>{loggedInUser.email}</span>
          <button onClick={() => setIsModalOpen(true)}>Zmień hasło</button>
          <button onClick={toggleDarkMode}>
            {darkMode ? 'Przełącz na jasny tryb' : 'Przełącz na ciemny tryb'}
          </button> 
        </div>
      )}

<h2>Users List</h2>
<ul>
  {users
    .filter(user => user.userId !== loggedInUser.userId) // Filtrujemy, aby nie wyświetlać naszego użytkownika
    .map(user => (
      <li key={`${user.userId}-${user.email}`} style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={user.avatarUrl ? user.avatarUrl : defaultAvatar} // Używamy zaimportowanej zmiennej
          alt="user's avatar" // Zawsze ustawiamy bardziej opisowy alt, np. "user's avatar"
          style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
        />
        {user.email} {/* Wyświetlamy e-mail tylko innych użytkowników */}
        <button onClick={() => handleChat(user)}>Chat</button>
      </li>
  ))}
</ul>


      <h2>Change Avatar</h2>
      <form onSubmit={handleAvatarChange}>
        <input
          type="file"
          accept="image/png, image/jpeg, image/bmp"
          onChange={(e) => setSelectedAvatar(e.target.files[0])}
        />
        <button type="submit">Change Avatar</button>
      </form>

<PasswordModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handlePasswordChange}
  darkMode={darkMode} // Przekazanie stanu darkMode do modala
/>

    </div>
  );
};

export default Home;
