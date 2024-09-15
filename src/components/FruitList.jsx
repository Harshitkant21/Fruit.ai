// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import FruitCard from "./FruitCard";

// const FruitList = () => {
//   const [fruits, setFruits] = useState([]);
//   const [selectedFruit, setSelectedFruit] = useState(null);
//   const [userMessage, setUserMessage] = useState("");
//   const [chatResponse, setChatResponse] = useState("");

//   useEffect(() => {
//     axios
//       .get("http://localhost:5000/fruits")
//       .then((response) => {
//         setFruits(Object.values(response.data));
//       })
//       .catch((error) => {
//         console.error("Error fetching fruits:", error);
//       });
//   }, []);

//   const handleClick = (fruit) => {
//     setSelectedFruit(fruit);
//   };

//   const handleSendMessage = () => {
//     if (!userMessage.trim()) return;
  
//     axios
//       .post("http://localhost:5000/chat", {
//         message: userMessage,
//         selectedFruit: selectedFruit ? selectedFruit.name : null,
//       })
//       .then((response) => {
//         const plainTextResponse = response.data.response.replace(/\*/g, "");
//         setChatResponse(plainTextResponse);
//         cleanup();
//       })
//       .catch((error) => {
//         console.error("Error sending message:", error);
//       });
//   };
  
//   const cleanup = () => {
//     setUserMessage("");
//   };

//   return (
//     <div className="fruit-list">
//       {selectedFruit ? (
//         <FruitCard fruit={selectedFruit} />
//       ) : (
//         fruits.map((fruit) => (
//           <div key={fruit.name} onClick={() => handleClick(fruit)}>
//             <img
//               src={`/${fruit.image}`}
//               alt={fruit.name}
//               className="fruit-size"
//             />
//             <h3>{fruit.name}</h3>
//           </div>
//         ))
//       )}
//       <div className="chat">
//         <textarea
//           value={userMessage}
//           onChange={(e) => setUserMessage(e.target.value)}
//           placeholder="Type a message..."
//         />
//         <button onClick={handleSendMessage}>Send</button>
//         <div className="response">{chatResponse}</div>
//       </div>
//     </div>
//   );
// };

// export default FruitList;


import React, { useState, useEffect } from "react";
import axios from "axios";
import FruitCard from "./FruitCard";
import "../componentCss/fruitlist.css";


const FruitList = () => {
  const [fruits, setFruits] = useState([]);
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]); // To store chat history

  // Fetch fruits from API
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

  // Handle fruit selection
  const handleClick = (fruit) => {
    setSelectedFruit(fruit);
  };

  // Handle sending message
  const handleSendMessage = () => {
    if (!userMessage.trim()) return;

    // Add user message to chat history
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
        // Add bot response to chat history
        setChatHistory((prevHistory) => [
          ...prevHistory,
          { sender: "bot", message: plainTextResponse },
        ]);
        setUserMessage(""); // Clear input after message is sent
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  };

  return (
    <div className="container">
      {/* Fruit Selection */}
      {!selectedFruit ? (
        <div className="row">
          <h2 className="mb-3 text-center">Select a Fruit</h2>
          {fruits.map((fruit) => (
            <div key={fruit.name} className="col-6 col-md-4 mb-3">
              <div
                className="card"
                onClick={() => handleClick(fruit)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={`/${fruit.image}`}
                  alt={fruit.name}
                  className="card-img-top fruit-size"
                />
                <div className="card-body">
                  <h5 className="card-title text-center">{fruit.name}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Chat Area
        <div className="chat-container">
          <h3 className="text-center mb-3">Chat about {selectedFruit.name}</h3>

          {/* Chat History */}
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
          </div>

          {/* Chat Input */}
          <div className="input-group mt-3">
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              className="form-control"
              placeholder="Type a message..."
              rows="2"
            />
            <button
              className="btn btn-primary"
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
