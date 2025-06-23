import React, { useState, useEffect } from 'react';
import logo from './assets/logo.svg';
import KnowledgeBase from './components/KnowledgeBase';

export default function App() {
  /* phase handling */
  const [showSplash, setShowSplash] = useState(true);   // splash 3 s
  const [mode, setMode]           = useState(null);     // null | 'customer' | 'internal'
  const [form, setForm]           = useState({          // user data
    name: '', email: '', contact: '', id: '', password: ''
  });
  const [showKB, setShowKB]       = useState(false);    // show chat?
  const [greeting, setGreeting]   = useState('');       // greeting for chat

  /* splash timer */
  useEffect(() => {
    if (showSplash) {
      const t = setTimeout(() => setShowSplash(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showSplash]);

  /* helpers */
  const handleModeSelect   = (m)               => setMode(m);
  const handleInputChange  = (f, v)            => setForm(p => ({ ...p, [f]: v }));
  const validCustomerForm  = () => form.name && form.email && form.contact;
  const validInternalLogin = () => form.id === 'user123' && form.password === 'password';

  const handleEnter = () => {
    if (mode === 'customer' && validCustomerForm()) {
      setGreeting(`Hey ${form.name}, welcome to Aquity Knowledge Base. Let me know your query.`);
      setShowKB(true);
    }
    if (mode === 'internal' && validInternalLogin()) {
      setGreeting(`Hey ${form.id}, welcome to Aquity Knowledge Base. Let me know your query.`);
      setShowKB(true);
    }
  };

  /* === RENDER PHASES === */

  /* 1. Splash */
  if (showSplash) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#1c1c2e] to-[#0f0f1f] text-white">
        <div className="text-center">
          <img src={logo} alt="logo" className="mx-auto w-48 mb-6 animate-pulse" />
          <p className="text-xl animate-bounce">Loading your assistant…</p>
        </div>
      </div>
    );
  }

  /* 2. Mode selector */
  if (!mode) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#1c1c2e] to-[#0f0f1f] text-white space-y-6">
        <img src={logo} alt="logo" className="w-40" />
        <h2 className="text-lg">Choose user type</h2>
        <div className="flex gap-6">
          <button onClick={() => handleModeSelect('customer')} className="px-6 py-3 bg-white text-black rounded-lg shadow-lg hover:bg-gray-200 transition">Customer</button>
          <button onClick={() => handleModeSelect('internal')} className="px-6 py-3 bg-white text-black rounded-lg shadow-lg hover:bg-gray-200 transition">Internal</button>
        </div>
      </div>
    );
  }

  /* 3. Forms / login (before chat) */
  if (!showKB) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#1c1c2e] to-[#0f0f1f] text-white space-y-4">
        <img src={logo} alt="logo" className="w-32" />

        {mode === 'customer' && (
          <>
            <input className="w-64 px-4 py-2 rounded text-black" placeholder="Name"
                   value={form.name}    onChange={(e)=>handleInputChange('name',e.target.value)} />
            <input className="w-64 px-4 py-2 rounded text-black" placeholder="Email"
                   value={form.email}   onChange={(e)=>handleInputChange('email',e.target.value)} />
            <input className="w-64 px-4 py-2 rounded text-black" placeholder="Contact"
                   value={form.contact} onChange={(e)=>handleInputChange('contact',e.target.value)} />
          </>
        )}

        {mode === 'internal' && (
          <>
            <input className="w-64 px-4 py-2 rounded text-black" placeholder="Employee ID"
                   value={form.id}       onChange={(e)=>handleInputChange('id',e.target.value)} />
            <input type="password" className="w-64 px-4 py-2 rounded text-black" placeholder="Password"
                   value={form.password} onChange={(e)=>handleInputChange('password',e.target.value)} />
            <p className="text-xs text-gray-400">(demo: user123 / password)</p>
          </>
        )}

        <button onClick={handleEnter}
          className="mt-4 px-6 py-3 bg-white text-black rounded-lg shadow-lg hover:bg-gray-200 transition font-semibold">
          Enter Knowledge Base
        </button>
      </div>
    );
  }

  /* 4. Chat interface */
  return <KnowledgeBase greeting={greeting} mode={mode} />;
}