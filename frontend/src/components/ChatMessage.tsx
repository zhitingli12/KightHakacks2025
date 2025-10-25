interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAI = message.sender === 'ai';

  return (
    <div className={`flex items-start gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full border-3 border-[#5a5a4a] flex items-center justify-center shadow-md flex-shrink-0 ${
          isAI ? 'bg-[#7a8c6f]' : 'bg-[#d4a574]'
        }`}
      >
        <div className={`w-5 h-5 rounded-full ${isAI ? 'bg-[#e8e8d8]' : 'bg-[#5a5a4a]'}`}></div>
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[70%] px-5 py-3 rounded-2xl border-3 shadow-md ${
          isAI
            ? 'bg-[#e8e8d8] border-[#a0a089] rounded-tl-sm'
            : 'bg-[#7a8c6f] border-[#5a5a4a] rounded-tr-sm'
        }`}
      >
        <p className={isAI ? 'text-[#4a5a3f]' : 'text-[#e8e8d8]'}>{message.text}</p>
      </div>
    </div>
  );
}
