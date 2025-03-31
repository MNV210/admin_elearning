import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import chatService from "../../services/chatService";

const ChatTab = ({ isDark, lecture }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const params = useParams()
  console.log(params)
  // const handleSendMessage = (e) => {
  //   e.preventDefault();
    
  //   if (!newMessage.trim()) return;
    
  //   // Add user message
  //   const userMessage = {
  //     id: messages.length + 1,
  //     type: "user",
  //     text: newMessage,
  //     timestamp: new Date().toISOString()
  //   };
    
  //   // Simulate system response
  //   const systemResponse = {
  //     id: messages.length + 2,
  //     type: "system",
  //     text: `Cảm ơn câu hỏi của bạn về "${newMessage}". Giảng viên sẽ phản hồi sớm nhất có thể.`,
  //     timestamp: new Date().toISOString()
  //   };
    
  //   setMessages([...messages, userMessage, systemResponse]);
  //   setNewMessage("");
  // };

  const getAllMesssage= async() => {
    const response = await chatService.getAllMessage({
      course_id : params.course_id
    })
    console.log(response.data)
    setMessages(response.data)
  }

  useEffect(()=>{
    getAllMesssage()
  },[])

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Chat messages */}
      <div 
        className={`flex-1 overflow-y-auto p-3 ${isDark ? "bg-gray-700" : "bg-gray-100"} rounded-lg mb-3`} 
        style={{ minHeight: "300px", maxHeight: "calc(100vh-260px)" }}
      >
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`mb-3 flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div 
              className={`max-w-[85%] rounded-lg px-3 py-2 ${
                message.type === "user" 
                  ? isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white" 
                  : isDark ? "bg-gray-600 text-white" : "bg-white text-gray-800"
              } shadow`}
            >
              <div className="flex items-center mb-1">
                <span className={`font-medium text-sm ${message.type === "user" ? "" : "text-green-400"}`}>
                  {message.type === "user" ? "Bạn" : "Hệ thống"}
                </span>
                {/* <span className={`text-xs ml-2 ${isDark ? "text-orage-300" : "text-orage-500"}`}>
                  {formatTime(message.created_at)}
                </span> */}
              </div>
              <p className="text-sm">{message.message}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Message input */}
      <div className={`${isDark ? "bg-gray-700" : "bg-gray-100"} rounded-lg p-2`}>
        <form className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập câu hỏi hoặc ý kiến của bạn..."
            className={`flex-1 p-2 rounded-lg mr-2 text-sm ${
              isDark 
                ? "bg-gray-800 text-white border-gray-600" 
                : "bg-white text-gray-800 border-gray-300"
            } border`}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`p-2 rounded-lg ${
              newMessage.trim() 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-gray-400 text-gray-200"
            } flex items-center justify-center`}
          >
            <span className="material-icons text-sm">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatTab; 