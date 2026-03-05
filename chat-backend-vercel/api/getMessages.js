import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { userId, lastMessageId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  try {
    let query = supabase
      .from('offline_messages')
      .select('*')
      .or(`user_id.eq.${userId},user_id.eq.all`)
      .order('id', { ascending: true });

    if (lastMessageId && !isNaN(parseInt(lastMessageId))) {
      query = query.gt('id', parseInt(lastMessageId));
    }

    const { data, error } = await query;
    if (error) throw error;

    const messages = data.map(row => ({
      id: row.id.toString(),
      senderId: row.sender_id,
      senderName: row.sender_name,
      type: row.message_type,
      content: row.content,
      sentTime: row.create_time,
      targetUserId: row.user_id
    }));

    res.status(200).json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}