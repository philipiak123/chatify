import React, { useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import './Register.css'; // Importujemy plik CSS

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    if (avatar) {
      formData.append('avatar', avatar);
    }

    try {
      await axios.post('http://localhost:3001/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setRegistered(true);
    } catch (error) {
      setError('Błąd rejestracji: Sprawdź swoje dane.');
      console.error('Register error:', error);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];

    if (file && ['image/png', 'image/jpeg', 'image/bmp'].includes(file.type)) {
      setAvatar(file);
    } else {
      alert('Proszę wybrać plik w formacie PNG, JPG, JPEG lub BMP.');
      setAvatar(null);
    }
  };

  if (registered) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="register-container">
      <form onSubmit={handleRegister} className="register-form">
        <h1>Register</h1>
        {error && <p className="error-message">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="file"
          accept=".png, .jpg, .jpeg, .bmp"
          onChange={handleAvatarChange}
          className="input-field"
        />
        <button type="submit" className="register-button">Register</button>
        <p className="login-link">
          Masz już konto? <a href="/login">Zaloguj się</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
