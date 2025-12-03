const express = require('express');


// Create RFP from natural language
router.post('/create', async (req, res) => {
const { text } = req.body;
if (!text) return res.status(400).json({ error: 'text required' });


try {
const structured = await ai.parseRfpFromText(text);
const id = uuidv4();
const rfp = { id, raw_text: text, structured, created_at: new Date().toISOString() };
RFP_STORE[id] = rfp;
return res.json(rfp);
} catch (err) {
console.error(err);
return res.status(500).json({ error: 'AI error' });
}
});


// List RFPs
router.get('/', (req, res) => {
return res.json(Object.values(RFP_STORE));
});


// Send RFP to vendors
router.post('/:id/send', async (req, res) => {
const { id } = req.params;
const { vendorIds } = req.body; // array of vendor ids
const rfp = RFP_STORE[id];
if (!rfp) return res.status(404).json({ error: 'RFP not found' });


try {
const vendors = (vendorIds || Object.keys(VENDOR_STORE)).map((vid) => VENDOR_STORE[vid]);
const results = [];
for (const v of vendors) {
const info = await emailService.sendRfpEmail(v.email, rfp);
results.push({ vendor: v, info });
}
return res.json({ sent: results });
} catch (err) {
console.error(err);
return res.status(500).json({ error: 'sending failed' });
}
});


// Get proposals for an RFP
router.get('/:id/proposals', (req, res) => {
const { id } = req.params;
const proposals = Object.values(PROPOSALS).filter((p) => p.rfp_id === id);
return res.json(proposals);
});


// Internal route used by email listener to save parsed proposal
router.post('/:id/_save_proposal', (req, res) => {
const { id } = req.params;
const p = req.body;
const pid = uuidv4();
p.id = pid;
p.received_at = new Date().toISOString();
PROPOSALS[pid] = p;
return res.json({ ok: true, proposal: p });
});


module.exports = router;
