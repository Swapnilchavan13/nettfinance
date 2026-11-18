import React, { useState } from 'react';
import './Component/NettZeroFinance.css';
import RequestFormPage from './Component/RequestFormPage';
import VerifierPage from './Component/VerifierPage';
import ApprovalPage from './Component/ApprovalPage';

const LOGO_URL = 'https://www.nettzero.world/assets/nettzero-logo-BKGpa6vk.webp';

function App() {
  const [activePage, setActivePage] = useState('REQUEST');

  return (
    <div>
      {/* Top Navigation Bar */}
      <nav className="nz-navbar">
        <div className="nz-brand">
          <img src={LOGO_URL} alt="NettZero Logo" />
          <span className="nz-brand-title">Finance Request System</span>
        </div>

        <div className="nz-nav-tabs">
          <button
            className={`nz-tab-btn ${activePage === 'REQUEST' ? 'active' : ''}`}
            onClick={() => setActivePage('REQUEST')}
          >
            1. Raise Request
          </button>
          <button
            className={`nz-tab-btn ${activePage === 'VERIFIER' ? 'active' : ''}`}
            onClick={() => setActivePage('VERIFIER')}
          >
            2. Verifier Portal
          </button>
          <button
            className={`nz-tab-btn ${activePage === 'APPROVAL' ? 'active' : ''}`}
            onClick={() => setActivePage('APPROVAL')}
          >
            3. Approval Portal
          </button>
        </div>
      </nav>

      {/* Main Content Area (Unauthenticated components are not mounted in DOM) */}
      <main className="nz-container">
        {activePage === 'REQUEST' && <RequestFormPage />}
        {activePage === 'VERIFIER' && <VerifierPage />}
        {activePage === 'APPROVAL' && <ApprovalPage />}
      </main>
    </div>
  );
}

export default App;