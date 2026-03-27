const { sendTemplateMessage } = require('./src/lib/whatsapp');

// Minimal mock to test API locally
process.env.WHATSAPP_ACCESS_TOKEN = "EAAQu9ZBaeeggBQwzxsTYAXUZBq5p4cn1ZBfoQwfjwzHAW94Rqf1d0bdl3Og3oEJLRyGDNaxyGnJhgL78xykWVAJxqmZBAlyZB2V1LDaGSuQZBLvcb3L3gIdIOnxZCzd6CAetxsucOWNd1KNgwXfgg1NCgZBfjlxcYhvi7hZAVK2VRjgiLkP5ISoOyyHjyIXtYi5MJ7RiaZB0VZAJ05AwKKJjjZA0gmEhQ0NEYMjz1Mm1";
process.env.WHATSAPP_PHONE_NUMBER_ID = "1012920828569194";

async function test() {
    try {
        console.log("Sending cpaas_test...");
        const result = await sendTemplateMessage({
            to: "917032223838", // dummy number just to trigger API validation
            templateName: "cpaas_test",
            languageCode: "en_US",
        });
        console.log("Success:", result);
    } catch (e) {
        console.log("Error caught!");
        console.dir(e, { depth: null });
    }
}

test();
