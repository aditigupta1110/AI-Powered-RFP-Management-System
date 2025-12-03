const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


async function parseRfpFromText(text) {
// Prompt engineering: ask the model to output JSON with predictable fields
const prompt = `Extract the procurement requirements from the user's text and output JSON with keys: title, items (array of {name, qty, specs}), budget, delivery_timeline, payment_terms, warranty. If unknown use null.\n\nText:\n"""${text}"""\n\nOutput JSON:`;


const completion = await openai.responses.create({
model: 'gpt-4o-mini',
input: prompt,
max_output_tokens: 800
});


// The SDK returns a structured object; take the text
const raw = completion.output_text || (completion.output && completion.output[0] && completion.output[0].content && completion.output[0].content[0] && completion.output[0].content[0].text) || '';


try {
const parsed = JSON.parse(raw);
return parsed;
} catch (err) {
// If model returned non-strict JSON, attempt to extract JSON block
const jsonMatch = raw.match(/\{[\s\S]*\}/m);
if (jsonMatch) return JSON.parse(jsonMatch[0]);
throw new Error('Failed to parse AI output');
}
}


async function parseProposalFromEmail(emailText) {
const prompt = `A vendor replied with the following proposal. Extract a JSON object with: vendor_name, items (name, unit_price, qty, subtotal), total_price, delivery_days, payment_terms, warranty, raw_text. If a field is missing set null.\n\nEmail:\n"""${emailText}"""\n\nOutput JSON:`;


const completion = await openai.responses.create({
model: 'gpt-4o-mini',
input: prompt,
max_output_tokens: 800
});
const raw = completion.output_text || '';
const jsonMatch = raw.match(/\{[\s\S]*\}/m);
if (!jsonMatch) throw new Error('No JSON in AI response');
return JSON.parse(jsonMatch[0]);
}


async function scoreProposals(rfp, proposals) {
const prompt = `You are a procurement assistant. Given this RFP and vendor proposals, score each proposal from 0-10 and provide a short explanation. RFP: ${JSON.stringify(rfp)}\nProposals: ${JSON.stringify(proposals)}\n\nOutput JSON array of {vendor_name, score, explanation}.`;
const completion = await openai.responses.create({ model: 'gpt-4o-mini', input: prompt, max_output_tokens: 800 });
const raw = completion.output_text || '';
const jsonMatch = raw.match(/\[?[\s\S]*\]?/m);
try {
const parsed = JSON.parse(raw);
return parsed;
} catch (err) {
// try extract first JSON array
const arrMatch = raw.match(/\[[\s\S]*\]/m);
if (arrMatch) return JSON.parse(arrMatch[0]);
throw new Error('Failed to parse scoring output');
}
}


module.exports = { parseRfpFromText, parseProposalFromEmail, scoreProposals };
