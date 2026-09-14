import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.MAILCHIMP_API_KEY;
const FROM = 'name@domain.com';
const TO = 'name@domain.com';

async function testMailchimpTransactional() {
    console.log('==========================================');
    console.log('Testing Mailchimp Transactional (Mandrill)');
    console.log('==========================================');

    if (!API_KEY) {
        console.log('⚠️ Set MAILCHIMP_API_KEY in .env to test.');
        return;
    }

    try {
        // 1. Test Ping
        console.log('\n1. Testing Ping Endpoint (users/ping.json)...');
        const pingRes = await fetch('https://mandrillapp.com/api/1.0/users/ping.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: API_KEY }),
        });
        console.log(`Status: ${pingRes.status} ${pingRes.statusText}`);
        const pingBody = await pingRes.text();
        console.log(`Ping Response: ${pingBody}`);

        // 2. Test User Info
        console.log('\n2. Testing User Info (users/info.json)...');
        const infoRes = await fetch('https://mandrillapp.com/api/1.0/users/info.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: API_KEY }),
        });
        console.log(`Status: ${infoRes.status} ${infoRes.statusText}`);
        const infoData = await infoRes.json();
        console.log(`Username: ${infoData?.username}`);
        console.log(`Hourly Quota: ${infoData?.hourly_quota}`);
        console.log(`Reputation: ${infoData?.reputation}`);

        // 3. Test Domains
        console.log('\n3. Checking Verified Sending Domains (senders/domains.json)...');
        const domainsRes = await fetch('https://mandrillapp.com/api/1.0/senders/domains.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: API_KEY }),
        });
        console.log(`Status: ${domainsRes.status} ${domainsRes.statusText}`);
        const domainsData = await domainsRes.json();
        console.log('Domains:', JSON.stringify(domainsData, null, 2));

        // 4. Live Test Email Dispatch
        console.log('\n4. Sending Live Test Email via Mandrill (messages/send.json)...');
        const sendRes = await fetch('https://mandrillapp.com/api/1.0/messages/send.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                key: API_KEY,
                message: {
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 24px; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px;">
                            <h2 style="color: #0f172a; margin-top: 0;">🎉 Mailchimp (Mandrill) Integration Success!</h2>
                            <p>Hello Sumama,</p>
                            <p>This email was sent directly from <strong>BrokerOS CRM</strong> using your verified domain <strong>instance.sale</strong> via Mailchimp Transactional (Mandrill) API.</p>
                            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                                <p style="margin: 0; font-size: 13px; color: #475569;">
                                    <strong>Sender:</strong> Shift Consultant &lt;sumama@instance.sale&gt;<br/>
                                    <strong>Domain:</strong> instance.sale (SPF, DKIM, DMARC 100% Valid)<br/>
                                    <strong>Provider:</strong> Mailchimp Mandrill<br/>
                                    <strong>Status:</strong> Live Dispatched
                                </p>
                            </div>
                            <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">
                                BrokerOS Enterprise Real Estate CRM · Automated Marketing Engine
                            </p>
                        </div>
                    `,
                    subject: '🚀 BrokerOS Marketing Test via Mailchimp Mandrill',
                    from_email: FROM,
                    from_name: 'Shift Consultant',
                    to: [
                        {
                            email: TO,
                            name: 'Sumama Khan',
                            type: 'to',
                        },
                    ],
                },
            }),
        });

        console.log(`Status: ${sendRes.status} ${sendRes.statusText}`);
        const sendData = await sendRes.json();
        console.log('Send Result:', JSON.stringify(sendData, null, 2));

    } catch (err: any) {
        console.error('Error connecting to Mailchimp Mandrill:', err.message);
    }
}

testMailchimpTransactional();

export {};
