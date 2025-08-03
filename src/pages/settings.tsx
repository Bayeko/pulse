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
 codex/add-language-selection-in-settings
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

 codex/add-face-id-switch-in-settings
 main
import {
  Settings as SettingsIcon,
  User,
  Bell,
 codex/add-language-selection-in-settings
  Heart,

  Heart, 
 main
  Shield, 
  Smartphone, 
  Moon, 

import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/i18n';
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Heart,
  Shield,
 codex/add-help-center-section-in-settings
  HelpCircle,

  LifeBuoy,
 main
  Smartphone,
  Moon,
 main
  Sun,
  Camera,
  Save,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';
 codex/add-language-selection-in-settings
import { useTranslation } from '@/i18n';
import { useToast } from '@/hooks/use-toast';

import { useToast } from '@/hooks/use-toast';
 codex/add-face-id-switch-in-settings
import { useTranslation } from '@/i18n';

 main
 main

interface SettingsData {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  historyEnabled: boolean;
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
 codex/add-face-id-switch-in-settings
    useFaceID: boolean;

    autoDelete30d: boolean;
 main
  };
  theme: 'light' | 'dark' | 'auto';
}

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
 codex/add-language-selection-in-settings
  const { lang, setLang } = useTranslation();
  const { toast } = useToast();

  const handleLanguageChange = (value: string) => {
    setLang(value as 'en' | 'fr');
    toast({ description: `Language set to ${value === 'en' ? 'English' : 'Français'}` });
  };


  const { toast } = useToast();
 codex/add-face-id-switch-in-settings
  const { t } = useTranslation();

 codex/add-auto-delete-setting-for-messages
  const { t } = useTranslation();

codex/add-export-data-feature-in-settings

  const fileInputRef = useRef<HTMLInputElement>(null);
 main
 main
 main
  
 main
  const [settings, setSettings] = useState<SettingsData>({
    name: user?.name || '',
    email: user?.email || '',
    bio: 'Living life with my amazing partner 💕',
    avatar: '',
    historyEnabled: true,
    notifications: {
      pulses: true,
      messages: true,
      calendar: true,
      reminders: false,
    },
 codex/add-face-id-switch-in-settings
    privacy: {
      shareLocation: false,
      showOnlineStatus: true,
      readReceipts: true,
      useFaceID: false,
    },
    theme: 'light',
  });

      privacy: {
        shareLocation: false,
        showOnlineStatus: true,
        readReceipts: true,
        autoDelete30d: false,
      },
      theme: 'light',
    });
 main

  const [activeSection, setActiveSection] = useState<'profile' | 'notifications' | 'privacy' | 'general' | 'help'>('profile');

  useEffect(() => {
    const stored = localStorage.getItem('historyEnabled');
    if (stored !== null) {
      setSettings((prev) => ({ ...prev, historyEnabled: stored === 'true' }));
    }
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('name, email, bio, avatar, use_face_id')
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
          privacy: {
            ...prev.privacy,
            useFaceID: profile.use_face_id ?? false,
          },
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

 codex/add-auto-delete-setting-for-messages
    const { error: scheduleError } = await supabase.functions.invoke(
      'schedule-auto-delete',
      {
        body: { enabled: settings.privacy.autoDelete30d },
      }
    );

    if (error || scheduleError) {
      console.error('Error saving settings:', error || scheduleError);
      toast({ description: 'Failed to save settings' });
    } else {
      toast({ description: 'Settings saved' });

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

  const exportUserData = async () => {
    if (!user) return;
    try {
      const [profileRes, messagesRes, timeSlotsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
        supabase.from('time_slots').select('*').eq('user_id', user.id),
      ]);

      if (profileRes.error || messagesRes.error || timeSlotsRes.error) {
        throw new Error('Error fetching data');
      }

      const exportData = {
        profile: profileRes.data,
        messages: messagesRes.data,
        time_slots: timeSlotsRes.data,
      } as {
        profile: Tables<'profiles'> | null;
        messages: Tables<'messages'>[];
        time_slots: Tables<'time_slots'>[];
      };

      const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.download = 'pulse-data.json';
      jsonLink.click();

      const convertToCsv = <T extends Record<string, unknown>>(items: T[]) => {
        if (!items || items.length === 0) return '';
        const headers = Object.keys(items[0]);
        const rows = items.map((row) =>
          headers.map((field) => JSON.stringify(row[field] ?? '')).join(',')
        );
        return [headers.join(','), ...rows].join('\n');
      };

      const csvSections: string[] = [];
      if (exportData.profile) {
        csvSections.push('Profiles');
        csvSections.push(convertToCsv([exportData.profile]));
      }
      if (exportData.messages) {
        csvSections.push('Messages');
        csvSections.push(convertToCsv(exportData.messages));
      }
      if (exportData.time_slots) {
        csvSections.push('Time Slots');
        csvSections.push(convertToCsv(exportData.time_slots));
      }

      const csvBlob = new Blob([csvSections.join('\n\n')], {
        type: 'text/csv;charset=utf-8;',
      });
      const csvUrl = URL.createObjectURL(csvBlob);
      const csvLink = document.createElement('a');
      csvLink.href = csvUrl;
      csvLink.download = 'pulse-data.csv';
      csvLink.click();

      toast({
        title: 'Export complete',
        description: 'Your data has been downloaded.',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export failed',
        description: 'Could not export your data.',
        variant: 'destructive',
      });
 main
    }
  };

  const registerBiometrics = async () => {
    if (!window.PublicKeyCredential) {
      toast({ description: 'Biometrics not supported', variant: 'destructive' });
      return false;
    }
    try {
      const publicKey: PublicKeyCredentialCreationOptions = {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: 'Pulse' },
        user: {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: user?.email || 'user@example.com',
          displayName: user?.name || 'User',
        },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        authenticatorSelection: { userVerification: 'preferred' },
        timeout: 60000,
        attestation: 'none',
      };
      await navigator.credentials.create({ publicKey });
      const authOptions: PublicKeyCredentialRequestOptions = {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        userVerification: 'preferred',
      };
      await navigator.credentials.get({ publicKey: authOptions });
      return true;
    } catch (error) {
      console.error('Biometric registration failed', error);
      return false;
    }
  };

  const handleFaceIDToggle = async (checked: boolean) => {
    if (!user) return;
    if (checked) {
      const ok = await registerBiometrics();
      if (!ok) return;
    }
    setSettings({
      ...settings,
      privacy: { ...settings.privacy, useFaceID: checked },
    });
    const { error } = await supabase
      .from('profiles')
      .update({ use_face_id: checked })
      .eq('user_id', user.id);
    if (error) {
      toast({ description: 'Unable to update Face ID preference', variant: 'destructive' });
    } else {
      toast({ description: checked ? 'Face ID enabled' : 'Face ID disabled' });
    }
  };

  const settingSections = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'help', name: 'Help Center', icon: HelpCircle },
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

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{t('autoDelete30d')}</h3>
                        <p className="text-sm text-muted-foreground">
                          Automatically remove messages older than 30 days
                        </p>
                      </div>
                      <Switch
                        checked={settings.privacy.autoDelete30d}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            privacy: { ...settings.privacy, autoDelete30d: checked }
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{t('useFaceID')}</h3>
                        <p className="text-sm text-muted-foreground">
                          Secure your account with biometrics
                        </p>
                      </div>
                      <Switch
                        checked={settings.privacy.useFaceID}
                        onCheckedChange={handleFaceIDToggle}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'general' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Pulse History</h3>
                        <p className="text-sm text-muted-foreground">
                          Save and display your pulse history
                        </p>
                      </div>
                      <Switch
                        checked={settings.historyEnabled}
                        onCheckedChange={(checked) => {
                          setSettings({ ...settings, historyEnabled: checked });
                          localStorage.setItem('historyEnabled', String(checked));
                        }}
                      />
                    </div>

                    <Separator />

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

                    <div>
                      <h3 className="font-medium mb-3">Language</h3>
                      <Select value={lang} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-3">
codex/add-export-data-feature-in-settings
                      <h3 className="font-medium">Data</h3>
                      <div className="p-4 border rounded-lg">
                        <PulseButton variant="ghost" onClick={exportUserData}>
                          Export my data
                        </PulseButton>
                      </div>
                    </div>


                      <h3 className="font-medium">Support</h3>
                      <p className="text-sm text-muted-foreground">Need help with Pulse?</p>
                      <PulseButton onClick={() => navigate('/faq')}>
                        <LifeBuoy className="w-4 h-4 mr-2" />
                        Help Center
                      </PulseButton>
                    </div>

                    <Separator />

main
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

              {activeSection === 'help' && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Find answers or get in touch with us.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <PulseButton asChild variant="ghost" size="sm">
                      <Link to="/faq">FAQ</Link>
                    </PulseButton>
                    <PulseButton asChild variant="ghost" size="sm">
                      <Link to="/contact">Contact Support</Link>
                    </PulseButton>
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