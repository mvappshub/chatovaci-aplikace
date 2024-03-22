import React, { useRef, useState } from 'react';
import Groq from 'groq-sdk';
import './App.css';
import typingSound from './assets/audio/typing.mp3';
import logo from './assets/images/logo.webp';


const groq = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
});

function App() {
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const audioRef = useRef(null);

  const playTypingSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const handleSendMessage = async (event) => {
    if (event.key === 'Enter' && userInput.trim() !== '') {
      setConversation((prevConversation) => [
        ...prevConversation,
        { role: 'user', content: userInput },
      ]);

      try {
        console.log('Sending message to Groq API:', userInput);
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "you are a helpful assistant."
            },
            ...conversation,
            { role: 'user', content: userInput },
          ],
          model: 'mixtral-8x7b-32768',
          temperature: 0.5,
          max_tokens: 1024,
          top_p: 1,
          stop: null,
          stream: false,
        });
        console.log('Received response from Groq API:', completion);

        const assistantResponse = completion.choices[0]?.message?.content || '';
        setConversation((prevConversation) => [
          ...prevConversation,
          { role: 'assistant', content: assistantResponse },
        ]);
        setUserInput('');
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className="app">
      <div className="header">
        <div className="header-right">
        <img src={logo} alt="Logo" className="logo" />
          <ul>
            {/* Add any navigation items here */}
          </ul>
        </div>
      </div>
      <div className="content">
        <h2>PIPBOY 1.0</h2>
        <p>THIS IS THE TEST VERSION.</p>
      </div>
      <div className="content">
        <p>LLM (Language Model) PIPBOY CONSOLE.</p>
      </div>
      <div className="terminal">
        <div className="terminal-inner">
          <div className="terminal-output">
            {conversation.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <span className="role">{message.role}:</span>
                <span className="content">{message.content}</span>
              </div>
            ))}
          </div>
          <div className="terminal-input">
            <span className="terminal-prompt">></span>
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={(event) => {
                playTypingSound();
                handleSendMessage(event);
              }}
              placeholder="Type your message..."
              className="terminal-input-field"
            />
          </div>
        </div>
        <audio ref={audioRef} src={typingSound} />

      </div>
      <div className="footer">
        <span>© 2023, licensed under <a href="MVAppsHub Corporation">MVAppsHub Corporation</a></span>
      </div>
    </div>
  );
}

export default App;