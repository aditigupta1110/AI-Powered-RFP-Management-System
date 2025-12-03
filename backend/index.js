require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const rfpRoutes = require('./routes/rfp');
const emailService = require('./services/email');


const app = express();
app.use(bodyParser.json());


app.use('/api/rfp', rfpRoutes);


const PORT = process.env.PORT || 4000;


app.listen(PORT, async () => {
console.log(`Backend listening on ${PORT}`);
// Start IMAP listener to receive vendor emails
try {
await emailService.startImapListener();
console.log('IMAP listener started');
} catch (err) {
console.error('IMAP listener failed to start:', err.message);
}
});
