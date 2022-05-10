const { Client, LegacySessionAuth, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const fetch = require('node-fetch');
const urlRb = "https://rajabiller.fastpay.co.id/transaksi/irs.php";

//show qr on terminal
const qrcode = require('qrcode-terminal');

// Use the saved values
const client = new Client({
    puppeteer: {
      executablePath: '/usr/bin/brave-browser-stable'
    },
    authStrategy: new LocalAuth({
      clientId: "client-one"
    }),
    puppeteer: {
      headless: true,
    }
});

(async() => {
    client.on('qr', (qr) => {
        console.log('QR RECEIVED, PLEASE SCEN ON YOUR PHONE');
        qrcode.generate(qr, {small: true});
    });
    
    // Save session values to the file upon successful auth
    client.on('authenticated', (session) => {
        console.log('WHATSAPP WEB => Authenticated Successfull');
    });
    
    client.on('ready', () => {
        console.log('Client is ready!\nLets Rock!!');
    });
    
    client.on('message', async msg => {
        const allmsg = msg.body.split(' ');
        const chat = await msg.getChat();
        const contact = await msg.getContact();
        const contactNumber = `${contact.number}`;
        
        if (msg.body.startsWith('balance') && !chat.isGroup) {
            try {
                const params = new URLSearchParams({
                    method: allmsg[0].toUpperCase(),
                    uid: allmsg[1].toUpperCase(),
                    pin: allmsg[2].toUpperCase(),
                });
                const re = await sendRb(urlRb, params, contactNumber);
                msg.reply(re);
            } catch (e) {
                msg.reply('Fail processing message (balance)');
            }
        } else if(msg.body.startsWith('tagihan') && !chat.isGroup){
            try {
                //tagihan plnpasc 123123123123 UID PIN
                const params = new URLSearchParams({
                    method: 'INQ',
                    produk: allmsg[1].toUpperCase(),
                    idpel1: allmsg[2].toUpperCase(),
                    uid: allmsg[3].toUpperCase(),
                    pin: allmsg[4].toUpperCase(),
                    ref1: '' 
                });
                
                if(allmsg[1].toUpperCase() == 'WATAPIN' || allmsg[1].toUpperCase() == 'WAMJK' || allmsg[1].toUpperCase() == 'WABGK'){
                    params.append('idpel2',allmsg[1].toUpperCase());
                    params.set('idpel1','');
                    params.set('idpel3','');
                } else if(allmsg[1].toUpperCase().startsWith('PLNPRA')){
                    if(allmsg[2].toUpperCase().length == 12){
                        params.append('idpel2',allmsg[1].toUpperCase());
                        params.set('idpel1','');
                        params.set('idpel3','');
                    }
                    params.set('idpel2','');
                    params.set('idpel3','');
                } else {
                    params.set('idpel2','');
                    params.set('idpel3','');
                }

                const re = await sendRb(urlRb, params.toString(), contactNumber);
                msg.reply(re);
            } catch (e) {
                msg.reply('Fail processing message (tagihan)');
            }
        } else if(msg.body.startsWith('cekip') && !chat.isGroup) {
            try {
                const params = new URLSearchParams({
                    method: allmsg[0].toUpperCase(),
                });
                const re = await sendRb(urlRb, params.toString(), contactNumber);
                msg.reply(re);
            } catch (e) {
                msg.reply('Fail processing message (cekip)');
            }
            
        } else {
            if (!chat.isGroup) {
                msg.reply('This command can only be used in a group!');
            } 
        }
    });
})();


async function sendRb(urlRb, params, contactNumber){
    const urlsend = urlRb+"?"+params;
    console.log(`request ${contactNumber}` + urlsend);
    const send = await fetch(urlsend);
    const response = await send.text();
    console.log(`\nresponse ${contactNumber}` + response);
    console.log(`\n===========================================\n`);
    return response;
}

client.initialize();