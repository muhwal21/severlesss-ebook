const axios = require('axios');

export default async function handler(req, res) {
    // Tambahkan header CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); // Mengizinkan semua origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Tangani preflight request (OPTIONS method)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { amount, customerName, email, phoneNumber } = req.body;

        try {
            const response = await axios.post('https://api.xendit.co/v2/invoices', {
                external_id: 'order-' + Date.now(),
                payer_email: email,
                description: 'Pembelian Buku',
                amount: amount
            }, {
                headers: {
                    Authorization: `Basic ${Buffer.from(process.env.XENDIT_SECRET_KEY).toString('base64')}`
                }
            });

            // Mengirim URL invoice kembali ke frontend
            res.status(200).json({ url: response.data.invoice_url });
        } catch (error) {
            console.error('Error while creating Xendit invoice:', error.response ? error.response.data : error.message);
            res.status(500).json({ error: error.response ? error.response.data : error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
