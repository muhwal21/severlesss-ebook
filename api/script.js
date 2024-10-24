// File: api/xenditPayment.js (contoh di server Vercel)
const axios = require('axios');

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { amount, customerName, email, phoneNumber } = req.body;
        
        try {
            const response = await axios.post('https://api.xendit.co/v2/invoices', {
                external_id: 'order-' + Date.now(),
                payer_email: email,
                description: 'Pembayaran Buku',
                amount: amount
            }, {
                headers: {
                    Authorization: `Basic ${Buffer.from(process.env.XENDIT_SECRET_KEY).toString('base64')}`
                }
            });
            
            res.status(200).json({ url: response.data.invoice_url });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
