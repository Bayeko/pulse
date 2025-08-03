import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PulseButton } from '@/components/ui/pulse-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Heart,
  Shield,
  LifeBuoy,
  Smartphone,
  Moon,
  Sun,
  Camera,
  Save,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

interface SettingsData {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  notifications: {
    pulses: boolean;
    messages: boolean;
    calendar: boolean;
    reminders: boolean;
  };
  privacy: {
    shareLocation: boolean;
    showOnlineStatus: boolean;
    readReceipts: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
}

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [settings, setSettings] = useState<SettingsData>({
    name: user?.name || '',
    email: user?.email || '',
    bio: 'Living life with my amazing partner 💕',
    avatar: '',
    notifications: {
      pulses: true,
      messages: true,
      calendar: true,
      reminders: false,
    },
    privacy: {
      shareLocation: false,
      showOnlineStatus: true,
      readReceipts: true,
    },
    theme: 'light',
  });

  const [activeSection, setActiveSection] = useState<'profile' | 'notifications' | 'privacy' | 'general'>('profile');

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('name, email, bio, avatar')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading settings:', error);
        return;
      }

      const profile = data as (Tables<'profiles'> & { bio?: string; avatar?: string }) | null;

      if (profile) {
        setSettings((prev) => ({
          ...prev,
          name: profile.name || '',
          email: profile.email || '',
          bio: profile.bio || '',
          avatar: profile.avatar || '',
        }));
      }
    };

    loadSettings();
  }, [user]);

  const saveSettings = async () => {
    if (!user) return;
    const updates: TablesUpdate<'profiles'> & { bio?: string; avatar?: string } = {
      name: settings.name,
      email: settings.email,
      bio: settings.bio,
      avatar: settings.avatar,
    };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Save failed',
        description: 'Could not update settings.',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Settings saved', description: 'Your changes have been saved.' });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setSettings({ ...settings, avatar: data.publicUrl });
      toast({ title: 'Avatar updated' });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload failed',
        description: 'Could not upload avatar.',
        variant: 'destructive',
      });
    }
  };

  const settingSections = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'general', name: 'General', icon: SettingsIcon },
  ] as const;

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
              <h1 className="text-3xl font-serif font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground">Customize your Pulse experience</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation */}
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-4">
              <nav className="space-y-2">
                {settingSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200",
                        activeSection === section.id
                          ? "bg-primary text-primary-foreground shadow-glow"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {section.name}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Content */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(settingSections.find(s => s.id === activeSection)?.icon || SettingsIcon, {
                  style: { width: '20px', height: '20px' }
                })}
                {settingSections.find(s => s.id === activeSection)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeSection === 'profile' && (
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={settings.avatar} />
                      <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                        {settings.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <PulseButton variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Camera className="w-4 h-4 mr-2" />
                        Change Photo
                      </PulseButton>
                      <p className="text-sm text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Profile Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={settings.name}
                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={settings.bio}
                      onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                      placeholder="Tell your partner something sweet..."
                    />
                  </div>

                  {/* Partner Info */}
                  <div className="p-4 bg-gradient-card rounded-lg border border-primary/20">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-primary" />
                      Partner Connection
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Connected with <span className="font-medium text-foreground">{user?.partnerName}</span>
                    </p>
                    <Badge variant="outline" className="mt-2 text-primary border-primary">
                      Connected
                    </Badge>
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Pulse Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Get notified when your partner sends you a pulse
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.pulses}
                        onCheckedChange={(checked) => {
                          setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, pulses: checked },
                          });
                          toast({
                            title: `Pulse notifications ${checked ? 'enabled' : 'disabled'}`,
                          });
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Messages</h3>
                        <p className="text-sm text-muted-foreground">
                          Notifications for new messages
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.messages}
                        onCheckedChange={(checked) => {
                          setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, messages: checked },
                          });
                          toast({
                            title: `Message notifications ${checked ? 'enabled' : 'disabled'}`,
                          });
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Calendar Events</h3>
                        <p className="text-sm text-muted-foreground">
                          Reminders for upcoming shared events
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.calendar}
                        onCheckedChange={(checked) => {
                          setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, calendar: checked },
                          });
                          toast({
                            title: `Calendar notifications ${checked ? 'enabled' : 'disabled'}`,
                          });
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Daily Reminders</h3>
                        <p className="text-sm text-muted-foreground">
                          Gentle reminders to connect with your partner
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.reminders}
                        onCheckedChange={(checked) => {
                          setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, reminders: checked },
                          });
                          toast({
                            title: `Daily reminders ${checked ? 'enabled' : 'disabled'}`,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'privacy' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Share Location</h3>
                        <p className="text-sm text-muted-foreground">
                          Let your partner see your location
                        </p>
                      </div>
                      <Switch
                        checked={settings.privacy.shareLocation}
                        onCheckedChange={(checked) => {
                          setSettings({
                            ...settings,
                            privacy: { ...settings.privacy, shareLocation: checked },
                          });
                          toast({
                            title: `Location sharing ${checked ? 'enabled' : 'disabled'}`,
                          });
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Online Status</h3>
                        <p className="text-sm text-muted-foreground">
                          Show when you're active in the app
                        </p>
                      </div>
                      <Switch
                        checked={settings.privacy.showOnlineStatus}
                        onCheckedChange={(checked) => {
                          setSettings({
                            ...settings,
                            privacy: { ...settings.privacy, showOnlineStatus: checked },
                          });
                          toast({
                            title: `Online status ${checked ? 'shown' : 'hidden'}`,
                          });
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Read Receipts</h3>
                        <p className="text-sm text-muted-foreground">
                          Let your partner know when you've read their messages
                        </p>
                      </div>
                      <Switch
                        checked={settings.privacy.readReceipts}
                        onCheckedChange={(checked) => {
                          setSettings({
                            ...settings,
                            privacy: { ...settings.privacy, readReceipts: checked },
                          });
                          toast({
                            title: `Read receipts ${checked ? 'enabled' : 'disabled'}`,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'general' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-3">Theme</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {([
                          { id: 'light', name: 'Light', icon: Sun },
                          { id: 'dark', name: 'Dark', icon: Moon },
                          { id: 'auto', name: 'Auto', icon: Smartphone },
                        ] as const).map(({ id, name, icon: Icon }) => (
                          <button
                            key={id}
                            onClick={() => {
                              setSettings({ ...settings, theme: id });
                              toast({ title: `${name} theme selected` });
                            }}
                            className={cn(
                              "p-3 rounded-lg border text-center transition-all duration-200",
                              settings.theme === id
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <Icon className="w-5 h-5 mx-auto mb-1" />
                            <span className="text-sm">{name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="font-medium">Support</h3>
                      <p className="text-sm text-muted-foreground">Need help with Pulse?</p>
                      <PulseButton onClick={() => navigate('/faq')}>
                        <LifeBuoy className="w-4 h-4 mr-2" />
                        Help Center
                      </PulseButton>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="font-medium text-destructive">Danger Zone</h3>
                      <div className="p-4 border border-destructive/20 rounded-lg">
                        <PulseButton
                          variant="ghost"
                          onClick={logout}
                          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          Sign Out
                        </PulseButton>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t">
                <PulseButton onClick={saveSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </PulseButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;