import React, { useState, useEffect } from 'react';
import {
  VERIFIER_USER,
  verifyCredentials,
  getAllRequests,
  saveAllRequests,
} from './authConfig';

const LOGO_URL = 'https://www.nettzero.world/assets/nettzero-logo-BKGpa6vk.webp';

export default function VerifierPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('nz_verifier_auth') === 'true'
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      setRequests(getAllRequests());
    }
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const valid = await verifyCredentials(username.trim(), password, 'VERIFIER');
    if (valid) {
      setIsAuthenticated(true);
      sessionStorage.setItem('nz_verifier_auth', 'true');
      setPassword('');
    } else {
      setAuthError('Unauthorized credentials for Verifier Portal.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('nz_verifier_auth');
  };

  const handleVerificationAction = (id, action) => {
    const all = getAllRequests();
    const updated = all.map((req) => {
      if (req.id === id) {
        return {
          ...req,
          status: action === 'VERIFY' ? 'Verified' : 'Rejected',
          supportingVerifiedBy:
            action === 'VERIFY'
              ? `Verified by ${VERIFIER_USER.name}`
              : `Rejected by ${VERIFIER_USER.name}`,
        };
      }
      return req;
    });
    saveAllRequests(updated);
    setRequests(updated);
  };

  if (!isAuthenticated) {
    return (
      <div className="nz-auth-wrapper">
        <div className="nz-auth-card">
          <img src={LOGO_URL} alt="NettZero Logo" />
          <h2>Verifier Portal</h2>
          <p>Restricted access for Finance Verification Officer</p>
          <form onSubmit={handleLogin} autoComplete="off">
            <div className="nz-form-group">
              <label>Verifier Name</label>
              <input
                type="text"
                className="nz-input"
                placeholder="Enter Verifier Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="nz-form-group">
              <label>Password</label>
              <input
                type="password"
                className="nz-input"
                placeholder="Enter Verifier Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {authError && <div className="nz-error">{authError}</div>}
            <button type="submit" className="nz-btn-primary" style={{ marginTop: '1rem' }}>
              Login to Verify Entries
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="nz-page-header">
        <div className="nz-user-badge">
          <span>Verifier Dashboard — Logged in as:</span>
          <span style={{ color: '#0f766e', fontSize: '1.05rem' }}>{VERIFIER_USER.name}</span>
        </div>
        <button className="nz-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="nz-card">
        <h3 className="nz-card-title">All Payment Entries for Verification</h3>
        <div className="nz-table-responsive">
          <table className="nz-table">
            <thead>
              <tr>
                <th>Req ID</th>
                <th>Requested By</th>
                <th>Date</th>
                <th>Party Name</th>
                <th>Nature</th>
                <th>Amount (₹)</th>
                <th>Bank Details</th>
                <th>Image</th>
                <th>Status</th>
                <th>Verification Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', color: '#64748b' }}>
                    No payment requests available to verify.
                  </td>
                </tr>
              ) : (
                requests.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.id}</strong></td>
                    <td>{item.requestedBy}</td>
                    <td>{item.date}</td>
                    <td>{item.partyName}</td>
                    <td>{item.natureOfPayment}</td>
                    <td><strong>₹{item.amount}</strong></td>
                    <td>
                      <div>{item.bankDetails.accountHolderName}</div>
                      <small style={{ color: '#64748b' }}>
                        A/C: {item.bankDetails.accountNumber} | IFSC: {item.bankDetails.ifscCode}
                      </small>
                    </td>
                    <td>
                      {item.productImage ? (
                        <a href={item.productImage} target="_blank" rel="noreferrer">
                          <img src={item.productImage} alt="Proof" className="nz-thumb" />
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>None</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`nz-badge ${
                          item.status === 'Approved'
                            ? 'badge-approved'
                            : item.status === 'Verified'
                            ? 'badge-verified'
                            : item.status === 'Rejected'
                            ? 'badge-rejected'
                            : 'badge-pending'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {item.status === 'Pending Verification' ? (
                        <div style={{ display: 'flex' }}>
                          <button
                            className="nz-action-btn btn-verify"
                            onClick={() => handleVerificationAction(item.id, 'VERIFY')}
                          >
                            Verify
                          </button>
                          <button
                            className="nz-action-btn btn-reject"
                            onClick={() => handleVerificationAction(item.id, 'REJECT')}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                          {item.supportingVerifiedBy}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}