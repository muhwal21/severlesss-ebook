export default function handler(req, res) {
    // Menambahkan header CORS untuk mengizinkan semua domain
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Tangani permintaan OPTIONS (preflight request)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Logika function jika metode POST
    if (req.method === 'POST') {
        const { customerName, whatsappNumber, email, items, totalAmount } = req.body;

    const invoiceData = {
        external_id: `invoice_${Date.now()}`,
        amount: totalAmount,
        payer_email: email,
        payer_name: customerName,
        description: `Pembelian Buku oleh ${customerName}:\n\n` +
                     items.map(item => `- ${item.judul} - ${item.quantity} pcs - Rp${(item.harga * item.quantity).toLocaleString()}`).join('\n') +
                     `\n\nTotal: Rp${totalAmount.toLocaleString()}`,
        currency: 'IDR',
        success_redirect_url: 'https://example.com/success',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
            category: 'Buku',
            totalBooks: items.reduce((sum, item) => sum + item.quantity, 0),
            items: items.map(item => ({ 
                id: item.id, 
                quantity: item.quantity, 
                title: item.judul,
                price: item.harga 
            }))
        },
        customer: {
            given_names: customerName,
            email,
            mobile_number: whatsappNumber
        }
    };
    

        const apiKey = process.env.XENDIT_API_KEY;
        const authorizationHeader = 'Basic ' + Buffer.from(apiKey + ':').toString('base64');

        // Panggil API Xendit untuk membuat invoice
        fetch('https://api.xendit.co/v2/invoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorizationHeader
            },
            body: JSON.stringify(invoiceData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.invoice_url) {
                res.status(200).json({ invoice_url: data.invoice_url });
            } else {
                res.status(500).json({ message: 'Gagal membuat invoice.' });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).json({ message: 'Terjadi kesalahan.' });
        });
    } else {
        // Jika metode bukan POST, kembalikan error
        res.status(405).json({ message: 'Method not allowed' });
    }
}
