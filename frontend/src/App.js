import React from 'react';
import CreateRFP from './components/CreateRFP';

function App() {
  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>AI-Powered RFP Management System</h1>
      <p>Create RFPs from natural language using AI</p>
      
      <CreateRFP />
    </div>
  );
}

export default App;
