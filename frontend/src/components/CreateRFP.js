import React, { useState } from 'react';
import axios from 'axios';

export default function CreateRFP() {
  const [text, setText] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!text.trim()) {
      alert("Please enter RFP details.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('/api/rfp/create', { text });
      setResponse(res.data);
    } catch (err) {
      console.error(err);
      alert('Error creating RFP. Check backend logs.');
    }

    setLoading(false);
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Create RFP</h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        cols={80}
        placeholder="Describe what you want to procure in natural language..."
        style={{ padding: 10, fontSize: 14 }}
      ></textarea>

      <br />
      <button
        onClick={handleCreate}
        disabled={loading}
        style={{
          marginTop: 10,
          padding: "10px 20px",
          fontSize: 16,
          cursor: "pointer"
        }}
      >
        {loading ? "Processing..." : "Create RFP"}
      </button>

      {response && (
        <div
          style={{
            marginTop: 20,
            background: "#f4f4f4",
            padding: 15,
            borderRadius: 5,
            whiteSpace: "pre-wrap"
          }}
        >
          <h3>Structured RFP Output</h3>
          <pre>{JSON.stringify(response.structured, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
