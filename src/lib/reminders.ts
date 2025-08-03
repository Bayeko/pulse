import { supabase } from '@/integrations/supabase/client';

interface ReminderSlot {
  id: string;
  date: string;
  start: string;
}

export const scheduleReminder = async (userId: string, slot: ReminderSlot) => {
  const slotTime = new Date(`${slot.date}T${slot.start}`);
  const remindAt = new Date(slotTime.getTime() - 2 * 60 * 60 * 1000);
  await supabase.from('reminders').insert({
    user_id: userId,
    time_slot_id: slot.id,
    remind_at: remindAt.toISOString(),
  });
};
