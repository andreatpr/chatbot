// src/components/Chatbot.js
import React, { useState, useEffect } from 'react';
import '../styles/Chatbot.css';
import logo from '../assets/logo.png';
import { useRef } from 'react';
import { marked } from 'marked';
import { API_TOKEN, API_URL } from '../config/config';

const Chatbot = () => {
  const [text2, setText2] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(true);
  const [isWelcomeScreen, setIsWelcomeScreen] = useState(true); // Estado para controlar la pantalla de bienvenida
  const welcomeMessage = "Heello!";
  const typingSpeed = 100; 
  const indexRef = useRef(0);
  const timeoutRef = useRef(null);

    useEffect(() => {
        const type = () => {
        if (indexRef.current < welcomeMessage.length) {
            setText2(prev => prev + welcomeMessage.charAt(indexRef.current));
            indexRef.current++;
            timeoutRef.current = setTimeout(type, typingSpeed);
        }
        };
        type();

        return () => clearTimeout(timeoutRef.current); // Limpia el timeout al desmontar
    }, []);

  useEffect(() => {
    setTimeout(() => {
      setIsWelcomeScreen(false);
      setMessages([{ text: 'Hello! How can I help you?', sender: 'bot' }]);
      setIsBotTyping(false);
    }, 3000); 
  }, []);

  const handleSendMessage = async () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');
      setIsBotTyping(true);
  
      try {
        const body = JSON.stringify({
          model: "llama-3.2-3b-preview",
          messages: [{ role: "user", content: input }] 
        });
  
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_TOKEN}`,
          },
          body,
        });
  
        const data = await response.json();
        const botReply = data.choices[0]?.message?.content || "I didn't understand that.";
  
        setMessages(prevMessages => [
          ...prevMessages,
          { text: botReply, sender: 'bot' }
        ]);
  
      } catch (error) {
        console.error("Error fetching response:", error);
        setMessages(prevMessages => [
          ...prevMessages,
          { text: "Sorry, there was an error processing your request.", sender: 'bot' }
        ]);
      } finally {
        setIsBotTyping(false);
      }
    }
  };
  

  useEffect(() => {
    const chatMessages = document.querySelector('.chatbot-messages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }, [messages, isBotTyping]);

  if (isWelcomeScreen) {
    return (
      <div className="chatbot-welcome">
        <div className="welcome-icon">
          <img src={logo} alt="Chatbot icon" />
        </div>
        <div className={`welcome-text  typing ${text2.length === welcomeMessage.length ? '' : 'blink-caret'}`}>{text2}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
        <div className="chatbot">
        <div className="chatbot-messages">
            {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
                {msg.sender === 'bot' && (
                    <img src={logo} alt="Chatbot icon" />
                )}
                <div
                className="message-text"
                dangerouslySetInnerHTML={{ __html: msg.sender === 'bot' ? marked(msg.text) : msg.text }}
                 />
            </div>
            ))}
            {isBotTyping && (
            <div className="message bot">
                <span>....</span>
            </div>
            )}
        </div>
        <div className="chatbot-input">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            />
            <button onClick={handleSendMessage}>Send</button>
        </div>
        </div>
    </div>
  );
};

export default Chatbot;
