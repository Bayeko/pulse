import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { Tables } from '../integrations/supabase/types';

const PAGE_SIZE = 20;

async function fetchMessages(userId: string, partnerId: string, page: number) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error } = await supabase
    .from('messages')
    .select('id, content, type, sender_id, receiver_id, created_at, read_at')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw error;
  return (data || []) as Tables<'messages'>[];
}

export function useMessages(userId?: string, partnerId?: string) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ['messages', userId, partnerId],
    queryFn: ({ pageParam = 0 }) => {
      if (!userId || !partnerId) return Promise.resolve([] as Tables<'messages'>[]);
      return fetchMessages(userId, partnerId, pageParam);
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    enabled: !!userId && !!partnerId,
    initialPageParam: 0,
  });

  return {
    ...query,
    queryClient,
    pageSize: PAGE_SIZE,
  };
}

