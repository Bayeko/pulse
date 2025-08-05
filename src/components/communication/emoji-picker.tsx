import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PulseButton } from '@/components/ui/pulse-button';
import { Badge } from '@/components/ui/badge';
import { Heart, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';

interface EmojiPickerProps {
  onSend: (emoji: string, category: string) => void;
  className?: string;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSend, className }) => {
  const { t } = useTranslation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const emojiCategories = useMemo(
    () =>
      ({
        romantic: {
          name: 'Romantic',
          emojis: ['❤️', '💕', '💖', '💗', '💘', '💝', '💞', '💌', '💐', '🌹', '🥰', '😍']
        },
        playful: {
          name: 'Playful',
          emojis: ['😉', '😘', '🤗', '😜', '🙃', '😏', '🤭', '😇', '🥳', '✨', '🎉', '🔥']
        },
        intimate: {
          name: `${t('intimacy')[0].toUpperCase()}${t('intimacy').slice(1)}`,
          emojis: ['🫦', '👀', '🤫', '💋', '🌙', '🌟', '🍾', '🥂', '🛁', '🕯️', '🎭', '💎']
        },
        moods: {
          name: 'Moods',
          emojis: ['☺️', '😌', '🤤', '😴', '🥱', '🤒', '🤧', '😋', '🍯', '🧘‍♀️', '💭', '💤']
        }
      } as const),
    []
  );

  const [selectedCategory, setSelectedCategory] = useState<keyof typeof emojiCategories>('romantic');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
  };

  const handleSend = () => {
    if (selectedEmoji) {
      onSend(selectedEmoji, selectedCategory);
      setSelectedEmoji(null);
    }
  };

  return (
    <Card className={cn("shadow-card animate-scale-in", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Sparkles className="w-5 h-5 text-primary" />
          Send a Pulse
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(emojiCategories).map(([key, category]) => (
            <Badge
              key={key}
              variant={selectedCategory === key ? "default" : "secondary"}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:scale-105",
                selectedCategory === key 
                  ? "bg-primary text-primary-foreground shadow-glow" 
                  : "hover:bg-primary/10"
              )}
              onClick={() => setSelectedCategory(key as keyof typeof emojiCategories)}
            >
              {category.name}
            </Badge>
          ))}
        </div>

        {/* Emoji Grid */}
        <div className="grid grid-cols-6 gap-2 min-h-[200px]">
          {emojiCategories[selectedCategory].emojis.map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              onClick={() => handleEmojiSelect(emoji)}
              className={cn(
                "aspect-square flex items-center justify-center text-2xl rounded-lg border transition-all duration-200 hover:scale-110",
                selectedEmoji === emoji
                  ? "bg-primary/20 border-primary shadow-glow"
                  : "bg-muted hover:bg-primary/10 border-border"
              )}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Send Button */}
        {selectedEmoji && (
          <div className="animate-fade-in-up space-y-3">
            <div className="flex items-center justify-center gap-3 p-3 bg-gradient-card rounded-lg border border-primary/20">
              <span className="text-2xl">{selectedEmoji}</span>
              <Heart className="w-4 h-4 text-primary animate-heartbeat" />
            </div>
            <PulseButton 
              variant="pulse" 
              size="lg" 
              className="w-full"
              onClick={handleSend}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Pulse
            </PulseButton>
          </div>
        )}

        {/* Recent Pulses */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Recent Pulses</h4>
          <div className="flex gap-2">
            {['💕', '😘', '🔥', '🌙'].map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiSelect(emoji)}
                className="w-10 h-10 flex items-center justify-center text-lg bg-muted hover:bg-primary/10 rounded-lg border border-border transition-all duration-200 hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};