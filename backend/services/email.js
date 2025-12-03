const nodemailer = require('nodemailer');
user: process.env.IMAP_USER,
password: process.env.IMAP_PASS,
host: process.env.IMAP_HOST,
port: Number(process.env.IMAP_PORT || 993),
tls: true,
authTimeout: 3000
}
};


const connection = await imaps.connect(config);
await connection.openBox('INBOX');


// Simple polling (every 30s) to fetch unseen messages
setInterval(async () => {
try {
const searchCriteria = ['UNSEEN'];
const fetchOptions = { bodies: [''] };
const messages = await connection.search(searchCriteria, fetchOptions);
for (const item of messages) {
const all = item.parts.find((p) => p.which === '');
const id = item.attributes.uid;
const raw = all.body;
const parsed = await simpleParser(raw);
const from = parsed.from && parsed.from.text;
const subject = parsed.subject;
const text = parsed.text || parsed.html || '';


// Use AI to parse proposal
try {
const proposal = await ai.parseProposalFromEmail(text);
proposal.vendor_email = from;
proposal.subject = subject;


// Save proposal back to backend API (local)
await fetch(`http://localhost:${process.env.PORT || 4000}/api/rfp/${proposal.rfp_id || 'unknown'}/_save_proposal`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(proposal)
});
} catch (err) {
console.error('Failed to parse proposal:', err.message);
}


// mark seen
await connection.addFlags(item.attributes.uid, '\\Seen');
}
} catch (err) {
console.error('IMAP poll error', err.message);
}
}, 30000);
}


module.exports = { sendRfpEmail, startImapListener };
