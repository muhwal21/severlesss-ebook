export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    const { customerName, whatsappNumber, email, items, totalAmount } = req.body;

    const invoiceData = {
        external_id: `invoice_${Date.now()}`,
        amount: totalAmount,
        payer_email: email,
        payer_name: customerName,
        description: `Pembelian Buku - Nama: ${customerName}, Email: ${email}, No. HP: ${whatsappNumber}`,
        currency: 'IDR',
        success_redirect_url: 'https://example.com/success',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
            category: 'Buku',
            items: items.map(item => ({ id: item.id, quantity: item.quantity }))
        },
        customer: {
            given_names: customerName,
            email,
            mobile_number: whatsappNumber
        }
    };

    const apiKey = process.env.XENDIT_API_KEY;
    const authorizationHeader = 'Basic ' + Buffer.from(apiKey + ':').toString('base64');

    try {
        const response = await fetch('https://api.xendit.co/v2/invoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorizationHeader
            },
            body: JSON.stringify(invoiceData)
        });

        const data = await response.json();
        if (data.invoice_url) {
            res.status(200).json({ invoice_url: data.invoice_url });
        } else {
            res.status(500).json({ message: 'Gagal membuat invoice.' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan. Silakan coba lagi.' });
    }
}
