import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PulseButton } from '@/components/ui/pulse-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Heart, Image, Mic, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  type: 'text' | 'emoji' | 'image';
  sender: 'user' | 'partner';
  timestamp: Date;
  read: boolean;
}

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Good morning my love! ☀️',
    type: 'text',
    sender: 'partner',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true
  },
  {
    id: '2',
    content: '❤️',
    type: 'emoji',
    sender: 'user',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    read: true
  },
  {
    id: '3',
    content: 'Can\'t wait to see you tonight! 💕',
    type: 'text',
    sender: 'partner',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false
  }
];

interface MessageCenterProps {
  className?: string;
}

export const MessageCenter: React.FC<MessageCenterProps> = ({ className }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      type: 'text',
      sender: 'user',
      timestamp: new Date(),
      read: false
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const sendEmoji = (emoji: string) => {
    const message: Message = {
      id: Date.now().toString(),
      content: emoji,
      type: 'emoji',
      sender: 'user',
      timestamp: new Date(),
      read: false
    };

    setMessages([...messages, message]);
    setShowEmojiPicker(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <Card className={cn("shadow-card animate-scale-in flex flex-col h-[600px]", className)}>
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2 font-serif">
          <MessageCircle className="w-5 h-5 text-primary" />
          Messages with {user?.partnerName || 'Partner'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 scroll-smooth">
          {messages.map((message, index) => {
            const showDate = index === 0 || 
              formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
            
            return (
              <div key={message.id}>
                {showDate && (
                  <div className="flex justify-center mb-4">
                    <Badge variant="secondary" className="text-xs">
                      {formatDate(message.timestamp)}
                    </Badge>
                  </div>
                )}
                
                <div className={cn(
                  "flex",
                  message.sender === 'user' ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2 relative animate-fade-in-up",
                    message.sender === 'user'
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}>
                    {message.type === 'emoji' ? (
                      <div className="text-2xl">{message.content}</div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    
                    <div className={cn(
                      "text-xs mt-1 flex items-center gap-1",
                      message.sender === 'user' 
                        ? "text-primary-foreground/70 justify-end" 
                        : "text-muted-foreground"
                    )}>
                      <span>{formatTime(message.timestamp)}</span>
                      {message.sender === 'user' && (
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          message.read ? "bg-green-400" : "bg-muted-foreground/50"
                        )} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Emoji Quick Actions */}
        {showEmojiPicker && (
          <div className="mb-4 p-3 bg-muted rounded-lg animate-fade-in-up">
            <div className="grid grid-cols-8 gap-2">
              {['❤️', '💕', '😘', '🥰', '😍', '🔥', '✨', '💯', '👌', '🙌', '😂', '😊', '😉', '🌹', '💐', '🎉'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => sendEmoji(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-primary/10 rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="min-h-[40px] max-h-[120px] resize-none"
            />
          </div>
          
          <div className="flex gap-1">
            <PulseButton
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="w-4 h-4" />
            </PulseButton>
            
            <PulseButton
              variant="ghost"
              size="sm"
            >
              <Image className="w-4 h-4" />
            </PulseButton>
            
            <PulseButton
              variant="pulse"
              size="sm"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </PulseButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};