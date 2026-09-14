import dotenv from 'dotenv';
dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;

async function testBrevo() {
    console.log('==========================================');
    console.log('Testing Brevo API Key Authenticity & Senders');
    console.log('==========================================');

    if (!BREVO_API_KEY) {
        console.log('⚠️ Set BREVO_API_KEY in .env to test.');
        return;
    }

    try {
        // 1. Check Account Info
        const accountRes = await fetch('https://api.brevo.com/v3/account', {
            method: 'GET',
            headers: {
                'api-key': BREVO_API_KEY,
                'accept': 'application/json',
            },
        });

        console.log(`Account Endpoint Status: ${accountRes.status} ${accountRes.statusText}`);
        const accountData = await accountRes.json();
        console.log('Account Data:', JSON.stringify(accountData, null, 2));

        // 2. Check Senders Info
        const sendersRes = await fetch('https://api.brevo.com/v3/senders', {
            method: 'GET',
            headers: {
                'api-key': BREVO_API_KEY,
                'accept': 'application/json',
            },
        });

        console.log(`Senders Endpoint Status: ${sendersRes.status} ${sendersRes.statusText}`);
        const sendersData = await sendersRes.json();
        console.log('Verified Senders:', JSON.stringify(sendersData, null, 2));
    } catch (err: any) {
        console.error('Error connecting to Brevo:', err);
    }
}

testBrevo();

export {};
