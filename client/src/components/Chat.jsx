import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useChat } from '../context/ChatContext';
import { io } from 'socket.io-client';
import './Chat.css'; // Import pliku CSS

// Inicjalizacja połączenia z serwerem WebSocket
const socket = io('http://localhost:3001', { withCredentials: true });

const Chat = () => {
  const { recipient } = useChat();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState([]);
  const [senderId, setSenderId] = useState(null);
  const [darkMode, setDarkMode] = useState(false); // Nowy stan dla Dark Mode

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Pobieranie danych użytkownika z sesji
        const senderIdResponse = await axios.get('http://localhost:3001/check-auth', { withCredentials: true });
        const fetchedSenderId = senderIdResponse.data.user.userId; 
        setSenderId(fetchedSenderId);
        
        // Ustawienie trybu ciemnego na podstawie user.darkMode
        if (senderIdResponse.data.user.darkMode) {
          setDarkMode(true); // Ustawienie trybu ciemnego
        }

        // Dołączanie do odpowiednich pokoi
        if (recipient) {
          socket.emit('join-room', fetchedSenderId);
          socket.emit('join-room', recipient.userId);
        }
      } catch (error) {
        console.error('Błąd podczas pobierania danych użytkownika:', error);
      }
    };

    fetchUserData();
  }, [recipient]);

  useEffect(() => {
    if (!recipient) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/messages/${recipient.userId}`, {
          withCredentials: true,
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Błąd podczas pobierania wiadomości:', error);
      }
    };

    fetchMessages();

    socket.on('new-message', (newMessage) => {
      console.log('Nowa wiadomość odebrana:', newMessage);
      if (newMessage.senderId === recipient.userId || newMessage.receiverId === recipient.userId) {
        setMessages((prevMessages) => {
          const isDuplicate = prevMessages.some(msg => msg.messageId === newMessage.messageId);
          return isDuplicate ? prevMessages : [...prevMessages, newMessage];
        });
      }
    });

    return () => {
      socket.off('new-message');
    };
  }, [recipient]);

  const handleSendMessage = async () => {
    if (!message && attachment.length === 0) return;

    try {
      const formData = new FormData();
      formData.append('receiverId', recipient.userId);
      formData.append('message', message);

      attachment.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await axios.post('http://localhost:3001/send-message', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      socket.emit('new-message', response.data.messageData);
      setMessages((prevMessages) => [...prevMessages, response.data.messageData]);

      setMessage('');
      setAttachment([]);
    } catch (error) {
      console.error('Błąd podczas wysyłania wiadomości:', error);
    }
  };

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    if (totalSize <= 25 * 1024 * 1024) {
      setAttachment(files);
    } else {
      alert('Total attachment size exceeds 25MB');
    }
  };

  const renderAttachment = (msg) => {
    if (!msg || !msg.attachmentUrls || msg.attachmentUrls.length === 0) return null;

    return (
      <div>
        {msg.attachmentUrls.map((url, index) => {
          const ext = url.split('.').pop();
          if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            return <img key={index} src={url} alt="Attachment" style={{ maxWidth: '200px' }} />;
          }
          if (['mp4', 'webm'].includes(ext)) {
            return <video key={index} src={url} controls style={{ maxWidth: '200px' }} />;
          }
          if (['mp3', 'wav'].includes(ext)) {
            return <audio key={index} src={url} controls />;
          }
          return <a key={index} href={url} download>Download File</a>;
        })}
      </div>
    );
  };

  if (!recipient) {
    return <div>Select a user to chat with.</div>;
  }

  return (
    <div className={`chat-container ${darkMode ? 'dark-mode' : ''}`}>
      <h1>Chat with {senderId === recipient.userId ? 'You' : recipient.email}</h1>
      <div>
        {messages.map((msg, index) => (
          <div key={msg.messageId || index}>
            <b>{msg.senderId === senderId ? 'You' : recipient.userId}:</b> {msg.message}
            {renderAttachment(msg)}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <input
        type="file"
        multiple
        onChange={handleAttachmentChange}
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default Chat;
