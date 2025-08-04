import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PulseButton } from '@/components/ui/pulse-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Heart, Image, Mic, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  type: 'text' | 'emoji';
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read_at: string | null;
  sender_name?: string;
}

interface DatabaseMessage {
  id: string;
  content: string;
  type: 'text' | 'emoji';
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read_at: string | null;
}

interface MessageCenterProps {
  className?: string;
}

export const MessageCenter: React.FC<MessageCenterProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const now = new Date();
  const isSnoozed = user?.snoozeUntil && new Date(user.snoozeUntil) > now;
  const partnerSnoozed = user?.partnerSnoozeUntil && new Date(user.partnerSnoozeUntil) > now;
  const disabledMessaging = isSnoozed || partnerSnoozed;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Récupère les messages lorsque l’utilisateur et son partenaire sont disponibles
  useEffect(() => {
    if (user && user.partnerId) {
      fetchMessages();
    }
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user || !user.partnerId) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${user.partnerId}),and(sender_id.eq.${user.partnerId},receiver_id.eq.${user.id}))`
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as DatabaseMessage;
          const formattedMessage: Message = {
            ...newMessage,
            sender_name: newMessage.sender_id === user.id ? user.name : user.partnerName
          };
          setMessages(prev => [...prev, formattedMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${user.partnerId}),and(sender_id.eq.${user.partnerId},receiver_id.eq.${user.id}))`
        },
        (payload) => {
          console.log('Message updated:', payload);
          const updatedMessage = payload.new as DatabaseMessage;
          setMessages(prev => prev.map(msg =>
            msg.id === updatedMessage.id
              ? { ...msg, read_at: updatedMessage.read_at }
              : msg
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when they come into view
  useEffect(() => {
    if (!user) return;
    
    const unreadMessages = messages.filter(msg => 
      msg.sender_id !== user.id && !msg.read_at
    );

    if (unreadMessages.length > 0) {
      markMessagesAsRead(unreadMessages.map(msg => msg.id));
    }
  }, [messages, user]);

  const fetchMessages = async () => {
    if (!user || !user.partnerId) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          type,
          sender_id,
          receiver_id,
          created_at,
          read_at
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${user.partnerId}),and(sender_id.eq.${user.partnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error loading messages",
          description: "Failed to load your conversation.",
          variant: "destructive",
        });
        return;
      }

      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        type: msg.type as 'text' | 'emoji',
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        created_at: msg.created_at,
        read_at: msg.read_at,
        sender_name: msg.sender_id === user.id ? user.name : user.partnerName
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markMessagesAsRead = async (messageIds: string[]) => {
    if (!user || messageIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', messageIds)
        .eq('receiver_id', user.id);

      if (error) {
        console.error('Error marking messages as read:', error);
      }
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error);
    }
  };

  const sendMessage = async (content: string, type: 'text' | 'emoji' = 'text') => {
    if (!content.trim() || !user || !user.partnerId) return;

    const now = new Date();
    if (user.snoozeUntil && new Date(user.snoozeUntil) > now) {
      toast({
        title: 'Snoozed',
        description: 'You are currently snoozed.',
      });
      return;
    }
    if (user.partnerSnoozeUntil && new Date(user.partnerSnoozeUntil) > now) {
      toast({
        title: 'Partner snoozed',
        description: 'Your partner is currently snoozed.',
      });
      return;
    }

    // Check partner availability through status or explicit message
    const partnerStatus = (user as unknown as { partnerStatus?: string })?.partnerStatus;
    if (partnerStatus === 'away' || partnerStatus === 'offline') {
      const feedback: Message = {
        id: `local-${Date.now()}`,
        content: 'Merci, on se retrouve plus tard !',
        type: 'text',
        sender_id: user.id,
        receiver_id: user.partnerId,
        created_at: new Date().toISOString(),
        read_at: null,
        sender_name: user.name,
      };
      setMessages(prev => [...prev, feedback]);
      toast({ description: 'Merci, on se retrouve plus tard !' });
      return;
    }

    try {
      const { data: profile, error: statusError } = await supabase
        .from('profiles')
        .select('status')
        .eq('user_id', user.partnerId)
        .maybeSingle();

      if (!statusError && (profile?.status === 'away' || profile?.status === 'offline')) {
        const feedback: Message = {
          id: `local-${Date.now()}`,
          content: 'Merci, on se retrouve plus tard !',
          type: 'text',
          sender_id: user.id,
          receiver_id: user.partnerId,
          created_at: new Date().toISOString(),
          read_at: null,
          sender_name: user.name,
        };
        setMessages(prev => [...prev, feedback]);
        toast({ description: 'Merci, on se retrouve plus tard !' });
        return;
      }

      const { data: lastMessage, error: messageError } = await supabase
        .from('messages')
        .select('content')
        .eq('sender_id', user.partnerId)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!messageError && lastMessage?.content === '⏰ Pas dispo') {
        const feedback: Message = {
          id: `local-${Date.now()}`,
          content: 'Merci, on se retrouve plus tard !',
          type: 'text',
          sender_id: user.id,
          receiver_id: user.partnerId,
          created_at: new Date().toISOString(),
          read_at: null,
          sender_name: user.name,
        };
        setMessages(prev => [...prev, feedback]);
        toast({ description: 'Merci, on se retrouve plus tard !' });
        return;
      }
    } catch (err) {
      console.error('Error checking partner availability:', err);
    }

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: content.trim(),
          type,
          sender_id: user.id,
          receiver_id: user.partnerId,
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Failed to send message",
          description: "Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Clear input only if message was sent successfully
      if (type === 'text') {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast({
        title: "Failed to send message",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const sendEmoji = async (emoji: string) => {
    await sendMessage(emoji, 'emoji');
    setShowEmojiPicker(false);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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

  // Show loading state or partner connection required
  if (isLoading) {
    return (
      <Card className={cn("shadow-card animate-scale-in flex flex-col h-[600px]", className)}>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 animate-pulse" />
            <p>Loading messages...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user?.partnerId) {
    return (
      <Card className={cn("shadow-card animate-scale-in flex flex-col h-[600px]", className)}>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Heart className="w-8 h-8 mx-auto mb-2 text-primary/50" />
            <p>Connect with your partner to start messaging</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              formatDate(message.created_at) !== formatDate(messages[index - 1].created_at);
            const isFromUser = message.sender_id === user.id;
            
            return (
              <div key={message.id}>
                  {showDate && (
                    <div className="flex justify-center mb-4">
                      <Badge variant="secondary" className="text-xs">
                        {formatDate(message.created_at)}
                      </Badge>
                    </div>
                  )}
                
                <div className={cn(
                  "flex",
                  isFromUser ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2 relative animate-fade-in-up",
                    isFromUser
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
                      isFromUser
                        ? "text-primary-foreground/70 justify-end" 
                        : "text-muted-foreground"
                    )}>
                      <span>{formatTime(message.created_at)}</span>
                      {isFromUser && (
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          message.read_at ? "bg-green-400" : "bg-muted-foreground/50"
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
              placeholder={disabledMessaging ? 'Messaging unavailable during snooze' : 'Type your message...'}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(newMessage);
                }
              }}
              disabled={disabledMessaging}
              className="min-h-[40px] max-h-[120px] resize-none"
            />
          </div>
          
          <div className="flex gap-1">
            <PulseButton
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={disabledMessaging}
            >
              <Smile className="w-4 h-4" />
            </PulseButton>
            
            <PulseButton
              variant="ghost"
              size="sm"
              disabled={disabledMessaging}
            >
              <Image className="w-4 h-4" />
            </PulseButton>
            
            <PulseButton
              variant="pulse"
              size="sm"
              onClick={() => sendMessage(newMessage)}
              disabled={!newMessage.trim() || disabledMessaging}
            >
              <Send className="w-4 h-4" />
            </PulseButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};