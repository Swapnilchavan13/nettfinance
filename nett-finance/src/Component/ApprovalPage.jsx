import React, { useState, useEffect } from 'react';
import {
  APPROVER_USER,
  verifyCredentials,
  getAllRequests,
  saveAllRequests,
} from './authConfig';

const LOGO_URL = 'https://www.nettzero.world/assets/nettzero-logo-BKGpa6vk.webp';

export default function ApprovalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('nz_approver_auth') === 'true'
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [verifiedRequests, setVerifiedRequests] = useState([]);

  // Date range filter states for download/view
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadVerifiedRequests();
    }
  }, [isAuthenticated]);

  const loadVerifiedRequests = () => {
    const all = getAllRequests();
    const filtered = all.filter(
      (req) => req.status === 'Verified' || req.status === 'Approved'
    );
    setVerifiedRequests(filtered);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const valid = await verifyCredentials(username.trim(), password, 'APPROVER');
    if (valid) {
      setIsAuthenticated(true);
      sessionStorage.setItem('nz_approver_auth', 'true');
      setPassword('');
    } else {
      setAuthError('Unauthorized credentials for Final Approval Portal.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('nz_approver_auth');
  };

  const handleApprovalAction = (id, action) => {
    const all = getAllRequests();
    const updated = all.map((req) => {
      if (req.id === id) {
        return {
          ...req,
          status: action === 'APPROVE' ? 'Approved' : 'Rejected',
          approvedBy:
            action === 'APPROVE'
              ? `Approved by ${APPROVER_USER.name}`
              : `Rejected by ${APPROVER_USER.name}`,
        };
      }
      return req;
    });
    saveAllRequests(updated);
    loadVerifiedRequests();
  };

  // Helper to filter entries by selected date range
  const getFilteredApprovedEntries = () => {
    const approvedOnly = verifiedRequests.filter((item) => item.status === 'Approved');
    if (!fromDate && !toDate) return approvedOnly;

    return approvedOnly.filter((item) => {
      const itemDate = item.date; // format "YYYY-MM-DD"
      if (fromDate && itemDate < fromDate) return false;
      if (toDate && itemDate > toDate) return false;
      return true;
    });
  };

  // CSV / Excel Export Handler
  const handleDownloadCSV = () => {
    const dataToExport = getFilteredApprovedEntries();

    if (dataToExport.length === 0) {
      alert('No approved entries found within the selected date range to export.');
      return;
    }

    // CSV Headers
    const headers = [
      'Req ID',
      'Requested By',
      'Date',
      'Party Name',
      'Nature of Payment',
      'Amount (INR)',
      'Account Holder Name',
      'Account Number',
      'IFSC Code',
      'Verification Info',
      'Approval Status',
      'Approved By',
    ];

    // Map rows
    const rows = dataToExport.map((item) => [
      item.id,
      `"${item.requestedBy}"`,
      item.date,
      `"${item.partyName}"`,
      `"${item.natureOfPayment}"`,
      item.amount,
      `"${item.bankDetails.accountHolderName}"`,
      `"${item.bankDetails.accountNumber}"`,
      `"${item.bankDetails.ifscCode}"`,
      `"${item.supportingVerifiedBy}"`,
      item.status,
      `"${item.approvedBy}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `NettZero_Approved_Payments_${fromDate || 'All'}_to_${toDate || 'All'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="nz-auth-wrapper">
        <div className="nz-auth-card">
          <img src={LOGO_URL} alt="NettZero Logo" />
          <h2>Final Approval Portal</h2>
          <p>Restricted access for Final Payment Approver</p>
          <form onSubmit={handleLogin} autoComplete="off">
            <div className="nz-form-group">
              <label>Approver Name</label>
              <input
                type="text"
                className="nz-input"
                placeholder="Enter Approver Name"
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
                placeholder="Enter Approver Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {authError && <div className="nz-error">{authError}</div>}
            <button type="submit" className="nz-btn-primary" style={{ marginTop: '1rem' }}>
              Login to Approval Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  const exportableCount = getFilteredApprovedEntries().length;

  return (
    <div>
      <div className="nz-page-header">
        <div className="nz-user-badge">
          <span>Final Approval Dashboard — Logged in as:</span>
          <span style={{ color: '#0f766e', fontSize: '1.05rem' }}>{APPROVER_USER.name}</span>
        </div>
        <button className="nz-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Date Range Export Section */}
      <div className="nz-card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="nz-card-title">Download Approved Entries (Excel / CSV)</h3>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItem: 'flex-end',
          }}
        >
          <div className="nz-form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
            <label>From Date</label>
            <input
              type="date"
              className="nz-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="nz-form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
            <label>To Date</label>
            <input
              type="date"
              className="nz-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="button"
              className="nz-btn-primary"
              style={{
                backgroundColor: exportableCount > 0 ? '#059669' : '#94a3b8',
                cursor: exportableCount > 0 ? 'pointer' : 'not-allowed',
                whiteSpace: 'nowrap',
              }}
              onClick={handleDownloadCSV}
            >
              📥 Download Excel/CSV ({exportableCount})
            </button>
          </div>
        </div>
      </div>

      {/* Verification & Approval Table */}
      <div className="nz-card">
        <h3 className="nz-card-title">Verified Entries Ready for Payment Approval</h3>
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
                <th>Verification Info</th>
                <th>Image</th>
                <th>Status</th>
                <th>Approval Action</th>
              </tr>
            </thead>
            <tbody>
              {verifiedRequests.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', color: '#64748b' }}>
                    No verified requests pending final approval.
                  </td>
                </tr>
              ) : (
                verifiedRequests.map((item) => (
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
                    <td>{item.supportingVerifiedBy}</td>
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
                          item.status === 'Approved' ? 'badge-approved' : 'badge-verified'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {item.status === 'Verified' ? (
                        <div style={{ display: 'flex' }}>
                          <button
                            className="nz-action-btn btn-approve"
                            onClick={() => handleApprovalAction(item.id, 'APPROVE')}
                          >
                            Approve Payment
                          </button>
                          <button
                            className="nz-action-btn btn-reject"
                            onClick={() => handleApprovalAction(item.id, 'REJECT')}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: '#047857', fontWeight: 600 }}>
                          {item.approvedBy}
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