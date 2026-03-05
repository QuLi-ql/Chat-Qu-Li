// 使用 Node.js 内存存储（Vercel 边缘网络会共享，但简单计数足够）
const onlineUsers = new Map();
const TIMEOUT = 2 * 60 * 1000; // 2分钟

// 每分钟清理一次
setInterval(() => {
  const now = Date.now();
  for (const [userId, time] of onlineUsers.entries()) {
    if (now - time > TIMEOUT) onlineUsers.delete(userId);
  }
}, 60000);

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  onlineUsers.set(userId, Date.now());
  res.status(200).json({ onlineCount: onlineUsers.size });
}