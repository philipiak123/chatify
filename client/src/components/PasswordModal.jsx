import React, { useState } from 'react';
import './PasswordModal.css'; // Upewnij się, że masz plik CSS dla stylów

const PasswordModal = ({ isOpen, onClose, onSubmit, darkMode }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setError('Proszę wypełnić wszystkie pola.');
      return;
    }
    onSubmit(oldPassword, newPassword);
    onClose(); // Zamknij modal po wysłaniu
  };

  if (!isOpen) return null; // Jeśli modal nie jest otwarty, nie renderuj nic

  return (
    <div className={`modal-overlay ${darkMode ? 'dark' : ''}`}>
      <div className={`modal-content ${darkMode ? 'dark' : ''}`}>
        <h2>Zmień hasło</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Stare hasło"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Nowe hasło"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button className="Change" type="submit">Zmień hasło</button>
          <button className="Change" type="button" onClick={onClose}>Anuluj</button>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
