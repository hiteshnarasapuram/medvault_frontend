import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../../styles/ChatBot.css";

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const OPENROUTER_KEY = "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";
// const OPENROUTER_KEY = "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";
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { sender: "user", text: userMessage }]);
    setInput("");

    // Medical keyword filter
    const medicalKeywords = [
      "symptom", "treatment", "doctor", "appointment",
      "medication", "disease", "health", "vaccine",
      "illness", "diagnosis", "prescription", "clinic",
      "hospital", "surgery", "therapy", "infection",
      "fever", "cough", "pain", "allergy", "blood",
      "test", "scan", "x-ray", "mri", "ultrasound",
      "heart", "diabetes", "cancer", "virus", "bacteria",
      "mental health", "depression", "anxiety", "nutrition",
      "immunization", "emergency", "first aid", "pharmacy"
    ];
    const isMedical = medicalKeywords.some(k => userMessage.toLowerCase().includes(k));
    if (!isMedical) {
      setMessages(prev => [...prev, { sender: "bot", text: "Sorry, I can only answer medical-related questions." }]);
      return;
    }

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-4o",
          messages: [
            { role: "system", content: "You are a helpful assistant that only answers medical-related questions." },
            { role: "user", content: userMessage }
          ],
          max_tokens: 300
        },
        {
          headers: {
            "Authorization": `Bearer ${OPENROUTER_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const botAnswer = response.data?.choices?.[0]?.message?.content
                        || response.data?.choices?.[0]?.text
                        || "No response from AI.";

      setMessages(prev => [...prev, { sender: "bot", text: botAnswer }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: "bot", text: "Error connecting to AI." }]);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-message ${m.sender}`}>
            <div className="bubble">{m.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Type your medical question..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatBot;
