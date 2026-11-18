import React, { useState, useEffect } from 'react';
import {
  REQUESTER_USERS,
  verifyCredentials,
  getAllRequests,
  saveAllRequests,
} from './authConfig';

const LOGO_URL = 'https://www.nettzero.world/assets/nettzero-logo-BKGpa6vk.webp';

export default function RequestFormPage() {
  // Session state (kept in memory/sessionStorage so inspecting DOM doesn't leak credentials)
  const [currentUser, setCurrentUser] = useState(() =>
    sessionStorage.getItem('nz_req_user') || ''
  );
  const [loginName, setLoginName] = useState(REQUESTER_USERS[0].name);
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [partyName, setPartyName] = useState('');
  const [natureOfPayment, setNatureOfPayment] = useState('');
  const [amount, setAmount] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [productImage, setProductImage] = useState('');

  // Records state
  const [userRecords, setUserRecords] = useState([]);

  useEffect(() => {
    if (currentUser) {
      loadUserRecords(currentUser);
    }
  }, [currentUser]);

  const loadUserRecords = (userName) => {
    const all = getAllRequests();
    const filtered = all.filter((item) => item.requestedBy === userName);
    setUserRecords(filtered);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const isValid = await verifyCredentials(loginName, loginPassword, 'REQUESTER');
    if (isValid) {
      setCurrentUser(loginName);
      sessionStorage.setItem('nz_req_user', loginName);
      setLoginPassword('');
    } else {
      setAuthError('Invalid password for selected user.');
    }
  };

  const handleLogout = () => {
    setCurrentUser('');
    sessionStorage.removeItem('nz_req_user');
    setUserRecords([]);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setProductImage('');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProductImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: 'NZ-' + Date.now().toString().slice(-6),
      requestedBy: currentUser,
      date,
      partyName,
      natureOfPayment,
      supportingVerifiedBy: 'Pending Verification (Priyanka)', // Populated from backend/verifier workflow
      amount: parseFloat(amount).toFixed(2),
      bankDetails: {
        accountHolderName,
        accountNumber,
        ifscCode: ifscCode.toUpperCase(),
      },
      productImage: productImage || null,
      status: 'Pending Verification',
      approvedBy: '-',
      createdAt: new Date().toLocaleString(),
    };

    const allRequests = getAllRequests();
    const updated = [newEntry, ...allRequests];
    saveAllRequests(updated);
    loadUserRecords(currentUser);

    // Reset form fields
    setPartyName('');
    setNatureOfPayment('');
    setAmount('');
    setAccountHolderName('');
    setAccountNumber('');
    setIfscCode('');
    setProductImage('');
    e.target.reset();
  };

  if (!currentUser) {
    return (
      <div className="nz-auth-wrapper">
        <div className="nz-auth-card">
          <img src={LOGO_URL} alt="NettZero Logo" />
          <h2>Finance Request Portal</h2>
          <p>Select your name and enter your password to raise a request</p>
          <form onSubmit={handleLogin} autoComplete="off">
            <div className="nz-form-group">
              <label>Select User</label>
              <select
                className="nz-select"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
              >
                {REQUESTER_USERS.map((u) => (
                  <option key={u.name} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="nz-form-group">
              <label>Password</label>
              <input
                type="password"
                className="nz-input"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            {authError && <div className="nz-error">{authError}</div>}
            <button type="submit" className="nz-btn-primary" style={{ marginTop: '1rem' }}>
              Access Request Form
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
          <span>Logged in as Requester:</span>
          <span style={{ color: '#0f766e', fontSize: '1.05rem' }}>{currentUser}</span>
        </div>
        <button className="nz-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Payment Request Form */}
      <div className="nz-card">
        <h3 className="nz-card-title">New Payment Request Form</h3>
        <form onSubmit={handleSubmit}>
          <div className="nz-form-grid">
            <div className="nz-form-group">
              <label>Date *</label>
              <input
                type="date"
                className="nz-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="nz-form-group">
              <label>Party Name *</label>
              <input
                type="text"
                className="nz-input"
                placeholder="Vendor / Party Name"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                required
              />
            </div>

            <div className="nz-form-group">
              <label>Nature of Payment *</label>
              <input
                type="text"
                className="nz-input"
                placeholder="e.g., Travel, Hardware, Consulting"
                value={natureOfPayment}
                onChange={(e) => setNatureOfPayment(e.target.value)}
                required
              />
            </div>

            <div className="nz-form-group">
              <label>Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                className="nz-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="nz-form-group">
              <label>Supporting / Verified By (Backend Auto-Assigned)</label>
              <input
                type="text"
                className="nz-input"
                value="Auto-routed to Priyanka (Verifier)"
                readOnly
              />
            </div>

            <div className="nz-form-group">
              <label>Product / Bill Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                className="nz-input"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          <div className="nz-bank-section">
            <h4>Beneficiary Bank Details</h4>
            <div className="nz-form-grid">
              <div className="nz-form-group" style={{ marginBottom: 0 }}>
                <label>Account Holder Name *</label>
                <input
                  type="text"
                  className="nz-input"
                  placeholder="Name as per bank records"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  required
                />
              </div>
              <div className="nz-form-group" style={{ marginBottom: 0 }}>
                <label>Account Number *</label>
                <input
                  type="text"
                  className="nz-input"
                  placeholder="Enter Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                />
              </div>
              <div className="nz-form-group" style={{ marginBottom: 0 }}>
                <label>IFSC Code *</label>
                <input
                  type="text"
                  className="nz-input"
                  placeholder="e.g., HDFC0001234"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="nz-btn-primary">
            Submit Payment Request
          </button>
        </form>
      </div>

      {/* User-Wise Entered Data Table */}
      <div className="nz-card">
        <h3 className="nz-card-title">
          My Submitted Requests ({currentUser}) — {userRecords.length}
        </h3>
        <div className="nz-table-responsive">
          <table className="nz-table">
            <thead>
              <tr>
                <th>Req ID</th>
                <th>Date</th>
                <th>Party Name</th>
                <th>Nature of Payment</th>
                <th>Amount (₹)</th>
                <th>Bank Details</th>
                <th>Supporting / Verified By</th>
                <th>Image</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {userRecords.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: '#64748b' }}>
                    No payment requests submitted by {currentUser} yet.
                  </td>
                </tr>
              ) : (
                userRecords.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.id}</strong></td>
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
                    <td>{item.supportingVerifiedBy}</td>
                    <td>
                      {item.productImage ? (
                        <a href={item.productImage} target="_blank" rel="noreferrer">
                          <img src={item.productImage} alt="Attachment" className="nz-thumb" />
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No Image</span>
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