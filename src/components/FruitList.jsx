import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../componentCss/fruitlist.css";

const FruitList = () => {
  const [fruits, setFruits] = useState([]);
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null); // Reference for auto-scrolling

  useEffect(() => {
    axios
      .get("https://fruit-ai-backend-ljio.onrender.com/fruits")
      .then((response) => {
        setFruits(Object.values(response.data));
      })
      .catch((error) => {
        console.error("Error fetching fruits:", error);
      });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); // Scroll to bottom on new message
  }, [chatHistory]);

  const handleClick = (fruit) => {
    setSelectedFruit(fruit);
  };

  const handleSendMessage = () => {
    if (!userMessage.trim()) return;

    setChatHistory((prevHistory) => [
      ...prevHistory,
      { sender: "user", message: userMessage },
    ]);

    axios
      .post("https://fruit-ai-backend-ljio.onrender.com/chat", {
        message: userMessage,
        selectedFruit: selectedFruit ? selectedFruit.name : null,
      })
      .then((response) => {
        const plainTextResponse = response.data.response.replace(/\*/g, "");
        setChatHistory((prevHistory) => [
          ...prevHistory,
          { sender: "bot", message: plainTextResponse },
        ]);
        setUserMessage("");
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  };

  return (
    <div className="container">
      {!selectedFruit ? (
        <div className="fruit-selection">
          <h2 className="text-center">Select a Fruit</h2>
          <div className="fruit-list">
            {fruits.map((fruit) => (
              <div key={fruit.name} className="fruit-card" onClick={() => handleClick(fruit)}>
                <img src={`/${fruit.image}`} alt={fruit.name} className="fruit-image" />
                <div className="fruit-info">
                  <h5 className="fruit-name">{fruit.name}</h5>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="chat-container">
          <header className="chat-header">
            <h3>Chat about {selectedFruit.name}</h3>
          </header>
          <div className="chat-history">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`chat-bubble ${
                  chat.sender === "user" ? "chat-user" : "chat-bot"
                }`}
              >
                {chat.message}
              </div>
            ))}
            <div ref={chatEndRef} /> {/* Scroll reference */}
          </div>
          <div className="chat-input">
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              className="input-field"
              placeholder="Type a message..."
              rows="2"
            />
            <button
              className="send-button"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FruitList;

