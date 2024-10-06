import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [recipient, setRecipient] = useState(null);

  return (
    <ChatContext.Provider value={{ recipient, setRecipient }}>
      {children}
    </ChatContext.Provider>
  );
};
