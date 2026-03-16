export default async function handler(req, res) {
  // Добавляем CORS-заголовки на всякий случай, если фронт и апи чуть разъедутся
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { userId } = req.query;
  const BOT_TOKEN = process.env.BOT_TOKEN; 
  const CHANNEL = '@airdrop_depin_news';

  if (!userId) {
    return res.status(400).json({ error: 'Не передан userId' });
  }

  if (!BOT_TOKEN) {
    return res.status(500).json({ error: 'Токен бота не настроен на сервере' });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${CHANNEL}&user_id=${userId}`);
    const data = await response.json();

    if (data.ok) {
      const status = data.result.status;
      // Если статус member, administrator или creator — доступ разрешен
      if (['member', 'administrator', 'creator'].includes(status)) {
        return res.status(200).json({ subscribed: true });
      }
    }
    
    // В любых других случаях (left, kicked и т.д.) или если юзер вообще не найден — отказ
    return res.status(200).json({ subscribed: false });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Ошибка сервера при проверке' });
  }
}