import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode.react';
import { getConfetti } from '@/lib/confetti';

type ProfileSummary = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'avatar_url' | 'partner_id'
>;
type AvatarOnly = Pick<Database['public']['Tables']['profiles']['Row'], 'avatar_url'>;

const Pairing = () => {
  const { user, connectByCode } = useAuth();
  const { code: codeParam } = useParams<{ code?: string }>();
  const [code, setCode] = useState('');
  const [link, setLink] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [paired, setPaired] = useState(false);
  const [avatars, setAvatars] = useState<{ me?: string; partner?: string }>({});

  useEffect(() => {
    if (!user) return;
    const setup = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, avatar_url, partner_id')
        .eq('user_id', user.id)
        .returns<ProfileSummary>()
        .single();
      if (data) {
        const generated = data.id.replace(/-/g, '').slice(0, 6).toUpperCase();
        setCode(generated);
        setLink(`${window.location.origin}/pair/${generated}`);
        setAvatars((a) => ({ ...a, me: data.avatar_url ?? undefined }));
        if (data.partner_id) {
          setPaired(true);
          const { data: partner } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', data.partner_id)
            .returns<AvatarOnly>()
            .single();
          setAvatars({ me: data.avatar_url ?? undefined, partner: partner?.avatar_url ?? undefined });
        } else {
          setWaiting(true);
        }
      }
    };
    setup();
  }, [user]);

  useEffect(() => {
    if (!user || !waiting) return;
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('partner_id, avatar_url')
        .eq('user_id', user.id)
        .returns<ProfileSummary>()
        .single();
      if (data && data.partner_id) {
        setPaired(true);
        setWaiting(false);
        const { data: partner } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', data.partner_id)
          .returns<AvatarOnly>()
          .single();
        setAvatars({ me: data.avatar_url ?? undefined, partner: partner?.avatar_url ?? undefined });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [user, waiting]);

  useEffect(() => {
    if (paired) {
      getConfetti().then((confetti) =>
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } }),
      );
    }
  }, [paired]);

  const handleAccept = async () => {
    if (!codeParam) return;
    const success = await connectByCode(codeParam);
    if (success) {
      setWaiting(true);
    }
  };

  if (codeParam && !paired) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4">
        <p className="text-lg">Code d'invitation: {codeParam}</p>
        <Button onClick={handleAccept}>Accepter la connexion</Button>
      </div>
    );
  }

  if (!paired) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4">
        <div className="text-3xl font-bold tracking-widest">{code}</div>
        {link && <QRCode value={link} size={180} />}
        <p className="text-muted-foreground">En attente de connexion…</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4">
      <div className="flex space-x-4">
        <Avatar className="h-20 w-20">
          {avatars.me ? (
            <AvatarImage src={avatars.me} alt="Vous" />
          ) : (
            <AvatarFallback>VOUS</AvatarFallback>
          )}
        </Avatar>
        <Avatar className="h-20 w-20">
          {avatars.partner ? (
            <AvatarImage src={avatars.partner} alt="Partenaire" />
          ) : (
            <AvatarFallback>PART</AvatarFallback>
          )}
        </Avatar>
      </div>
    </div>
  );
};

export default Pairing;
