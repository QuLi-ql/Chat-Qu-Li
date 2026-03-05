import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { senderId, senderName, type, content, targetUserId, sentTime } = req.body;

    if (!senderId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('offline_messages')
      .insert([{
        user_id: targetUserId || 'all',
        sender_id: senderId,
        sender_name: senderName || 'anonymous',
        message_type: type || 'text',
        content,
        create_time: new Date(sentTime || Date.now()).toISOString()
      }])
      .select('id');

    if (error) throw error;

    res.status(200).json({
      id: data[0].id.toString(),
      sentTime: sentTime || new Date().toISOString()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}