import React, { useState, useEffect } from 'react';
import '../styles/Chatbot.css';
import logo from '../assets/logo.png';
import { useRef } from 'react';
import { marked } from 'marked';

const Chatbot = () => {
  const [text2, setText2] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(true);
  const [isWelcomeScreen, setIsWelcomeScreen] = useState(true); 
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

        return () => clearTimeout(timeoutRef.current);
    }, []);

  useEffect(() => {
    setTimeout(() => {
      setIsWelcomeScreen(false);
      setMessages([{ text: 'Hola! Como puedo ayudarte?', sender: 'bot' }]);
      setIsBotTyping(false);
    }, 3000); 
  }, []);

  const handleSendMessage = async () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');
      setIsBotTyping(true);
  
      const url = 'http://localhost:8000/chat'; 
      const body = JSON.stringify({
        user_propmt: input,
        thread_id: "12345"
      });
      console.log(body);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const botReply = data.response || "No entendí ello, discúlpame."; 
        
        setMessages(prevMessages => [
          ...prevMessages,
          { text: botReply, sender: 'bot' }
        ]);
  
      } catch (error) {
        console.error("Error fetching response:", error);
        setMessages(prevMessages => [
          ...prevMessages,
          { text: "Hubo un problema procesando tu consulta...", sender: 'bot' }
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
