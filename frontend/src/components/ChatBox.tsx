import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// API configuration
const API_BASE_URL = 'http://localhost:8000';

const callAgentAPI = async (message: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Fix: Your backend returns { response: "text" }, not { success: true, response: "text" }
    if (data.response) {
      return data.response;
    } else {
      return "I'm sorry, I encountered an error processing your request. Please try again.";
    }
  } catch (error) {
    console.error('Error calling agent API:', error);
    return "I'm having trouble connecting to the service. Please check if the backend is running.";
  }
};

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your home insurance expert. I can help you find the right insurance coverage based on your location's weather patterns and risk factors. What's your city or area of interest?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    const newMessage: Message = {
      id: Date.now().toString(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev: Message[]) => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Call the agent API
      const aiResponseText = await callAgentAPI(userMessage);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages((prev: Message[]) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble responding right now. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev: Message[]) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-[#c9d4bc] border-b-4 border-[#a0a089] p-4 flex items-center gap-4">
        <div className="w-16 h-16 bg-[#7a8c6f] rounded-full border-4 border-[#5a5a4a] flex items-center justify-center shadow-lg">
          <div className="w-8 h-8 bg-[#e8e8d8] rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-[#7a8c6f] rounded-full"></div>
          </div>
        </div>
        <div>
          <h2 className="text-[#4a5a3f]">Home Insurance Expert</h2>
          <p className="text-sm text-[#6b7b5f]">● online</p>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f5f5e8]"
        style={{
          backgroundImage: 'radial-gradient(circle, #e8e8d8 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          maxHeight: '400px',
        }}
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#7a8c6f] rounded-full border-3 border-[#5a5a4a] flex items-center justify-center shadow-md flex-shrink-0">
              <div className="w-5 h-5 bg-[#e8e8d8] rounded-full"></div>
            </div>
            <div className="bg-[#e8e8d8] border-3 border-[#a0a089] rounded-2xl rounded-tl-sm px-5 py-3 shadow-md">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-[#7a8c6f] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-[#6b7b5f] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-[#7a8c6f] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#c9d4bc] border-t-4 border-[#a0a089]">
        <div className="flex gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-[#f5f5e8] border-3 border-[#a0a089] focus:border-[#7a8c6f] rounded-full px-5 h-12 text-[#4a5a3f] placeholder:text-[#a0a089] shadow-inner"
          />
          <Button
            onClick={handleSendMessage}
            className="bg-[#7a8c6f] hover:bg-[#6b7b5f] border-3 border-[#5a5a4a] rounded-full h-12 w-12 p-0 shadow-lg"
            disabled={!inputValue.trim()}
          >
            <Send className="w-5 h-5 text-[#e8e8d8]" />
          </Button>
        </div>
      </div>
    </div>
  );
}
