import React from 'react';
import { MessageCenter } from '@/components/messaging/message-center';
import { EmojiPicker } from '@/components/communication/emoji-picker';
import { PulseButton } from '@/components/ui/pulse-button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logger from '@/lib/logger';
import { useAuth } from '@/contexts/AuthContext';

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleEmojiSend = (emoji: string, category: string) => {
    logger.info('Sending emoji:', emoji, 'from category:', category);
    // This would integrate with the MessageCenter to send emojis
  };

  return (
    <div className="min-h-screen bg-gradient-soft p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <PulseButton
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </PulseButton>
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">Messages</h1>
              <p className="text-muted-foreground">Stay connected with your partner</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Message Center */}
          <div className="lg:col-span-2">
            <MessageCenter
              pulseEmoji={user?.pulseEmoji}
              pulseColor={user?.pulseColor}
              secretPulse={user?.secretPulse}
              secretPulseIcon={user?.secretPulseIcon}
            />
          </div>

          {/* Emoji Picker Sidebar */}
          <div className="lg:col-span-1">
            <EmojiPicker onSend={handleEmojiSend} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;