import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { PulseButton } from '../components/ui/pulse-button';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

export const AvatarSetup: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      let avatarUrl: string | null = null;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = data.publicUrl;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ name, avatar_url: avatarUrl })
        .eq('user_id', user.id);
      if (updateError) throw updateError;

      toast({ title: 'Profile updated' });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Could not update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="w-24 h-24">
          {previewUrl ? (
            <AvatarImage src={previewUrl} />
          ) : (
            <AvatarFallback>👤</AvatarFallback>
          )}
        </Avatar>
        <Input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Pseudo</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <PulseButton className="w-full" onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save'}
      </PulseButton>
    </div>
  );
};
