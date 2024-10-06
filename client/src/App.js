import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import { ChatProvider } from './context/ChatContext';
import './App.css'; // Import pliku CSS

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null oznacza, że jeszcze nie wiemy
  const [loading, setLoading] = useState(true);

  // Sprawdzanie sesji na backendzie
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('http://localhost:3001/check-auth',
        { withCredentials: true });
        setIsLoggedIn(response.data.loggedIn); // Ustawiamy stan na podstawie odpowiedzi
      } catch (error) {
        console.error('Błąd podczas sprawdzania statusu sesji:', error);
        setIsLoggedIn(false);
      } finally {
        setLoading(false); // Ustawiamy koniec ładowania
      }
    };

    checkAuthStatus();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Wyświetlamy komunikat podczas ładowania
  }

  return (
    <ChatProvider>
      <Router>
        <Routes>
          <Route path="/login" element={isLoggedIn ? <Navigate to="/home" /> : <Login />} />
          <Route path="/register" element={isLoggedIn ? <Navigate to="/home" /> : <Register />} />
          <Route path="/home" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
          <Route path="/chat" element={isLoggedIn ? <Chat /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </ChatProvider>
  );
};

export default App;
