
export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { song, greeting } = req.body;

    if (!song || !greeting) {
        return res.status(400).json({ success: false, error: 'Missing data' });
    }

    const BOT_TOKEN = '8568661443:AAHcgiktPePfN5AjaoFTa8JLddcY56aK69s';
    const CHAT_ID = '954676667';

    const time = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });

    const message =
        `🎵 ЗАКАЗ ПЕСНИ\n\n` +
        `🕒 Время: ${time}\n\n` +
        `🎤 Песня: ${song}\n\n` +
        `💌 Поздравление:\n${greeting}\n\n` +
        `💰 Оплата: Yandex Tips`;

    try {
        const response = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: CHAT_ID, text: message })
            }
        );

        const data = await response.json();

        if (data.ok) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(500).json({ success: false, error: data.description });
        }
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}
