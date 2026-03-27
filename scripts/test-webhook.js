/**
 * Useful script to test your local webhook endpoint without needing an actual WhatsApp account yet.
 * Run this with: node scripts/test-webhook.js
 */

const LOCAL_URL = 'http://localhost:3000/api/webhooks/whatsapp';

// Mock payload representing an incoming text message from a user
const mockIncomingMessage = {
    object: 'whatsapp_business_account',
    entry: [
        {
            id: 'WHATSAPP_ACCOUNT_ID',
            changes: [
                {
                    value: {
                        messaging_product: 'whatsapp',
                        metadata: {
                            display_phone_number: '15555555555',
                            phone_number_id: '1234567890',
                        },
                        contacts: [
                            {
                                profile: {
                                    name: 'Test Customer',
                                },
                                wa_id: '16505551234',
                            },
                        ],
                        messages: [
                            {
                                from: '16505551234',
                                id: 'wamid.HBgLMTY1MDU1NTEyMzQ...=',
                                timestamp: Math.floor(Date.now() / 1000).toString(),
                                text: {
                                    body: 'Hello! I would like to inquire about your services.',
                                },
                                type: 'text',
                            },
                        ],
                    },
                    field: 'messages',
                },
            ],
        },
    ],
};

async function testWebhook() {
    console.log('Sending mock webhook payload to:', LOCAL_URL);

    try {
        const response = await fetch(LOCAL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mockIncomingMessage),
        });

        const status = response.status;

        if (status === 200) {
            console.log('✅ Webhook test successful! The endpoint returned 200 OK.');
            console.log('Check your Next.js terminal tab to see the parsed message logs.');
        } else {
            console.error(`❌ Webhook endpoint returned status: ${status}`);
        }
    } catch (err) {
        console.error('❌ Failed to connect to local server. Is Next.js running on port 3000?', err.message);
    }
}

testWebhook();
