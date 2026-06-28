import React, { useState, useEffect } from 'react';
import { getAccountRequests, approveAccountRequest, rejectAccountRequest } from '@/shared/api/api';
import toast from 'react-hot-toast';

export default function AccountRequests() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await getAccountRequests(statusFilter !== 'all' ? statusFilter : '');
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleApprove = async (e) => {
    e.preventDefault();
    try {
      await approveAccountRequest(selectedRequest.id, adminNotes, newPassword || undefined);
      setSelectedRequest(null);
      setAdminNotes('');
      setNewPassword('');
      toast.success("Request approved.");
      fetchRequests();
    } catch (err) {
      toast.error("Failed to approve request.");
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to reject this request?")) return;
    try {
      await rejectAccountRequest(selectedRequest.id, adminNotes);
      setSelectedRequest(null);
      setAdminNotes('');
      setNewPassword('');
      toast.success("Request rejected.");
      fetchRequests();
    } catch (err) {
      toast.error("Failed to reject request.");
    }
  };

  return (
    <div className="bg-[var(--md-sys-color-surface)] rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[600px] flex gap-6">
      
      {/* Requests List */}
      <div className="w-1/2 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Access Requests</h2>
          <select 
            value={statusFilter} 
            onChange={e=>setStatusFilter(e.target.value)}
            className="border-gray-200 rounded-xl px-4 py-2"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {requests.length === 0 && <p className="text-gray-500 text-center py-8">No {statusFilter} requests found.</p>}
            {requests.map(req => (
              <div 
                key={req.id} 
                onClick={() => setSelectedRequest(req)}
                className={`p-4 rounded-2xl cursor-pointer border transition-colors ${selectedRequest?.id === req.id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:bg-gray-50'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold">{req.user_name || req.user_email}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    req.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {req.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">Type: <span className="font-medium capitalize">{req.type.replace('_', ' ')}</span></div>
                <div className="text-xs text-gray-400 mt-2">{new Date(req.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Details Panel */}
      <div className="w-1/2 bg-gray-50 rounded-2xl p-6 border border-gray-100 relative">
        {selectedRequest ? (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold mb-4">Request Details</h3>
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 space-y-2 text-sm">
              <p><span className="text-gray-500">User ID:</span> {selectedRequest.user_id}</p>
              <p><span className="text-gray-500">Email:</span> {selectedRequest.user_email}</p>
              <p><span className="text-gray-500">Current Role:</span> {selectedRequest.user_role}</p>
              <p><span className="text-gray-500">Request Type:</span> <span className="font-bold text-red-600">{selectedRequest.type.replace('_', ' ').toUpperCase()}</span></p>
              {selectedRequest.resolved_at && (
                <p><span className="text-gray-500">Resolved At:</span> {new Date(selectedRequest.resolved_at).toLocaleString()}</p>
              )}
            </div>

            {selectedRequest.status === 'pending' ? (
              <form className="space-y-4">
                {selectedRequest.type === 'password_reset' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue New Password</label>
                    <input 
                      type="text" 
                      value={newPassword}
                      onChange={e=>setNewPassword(e.target.value)}
                      placeholder="Enter a temporary password..."
                      className="w-full p-3 rounded-xl border-gray-200"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes (Optional)</label>
                  <textarea 
                    value={adminNotes}
                    onChange={e=>setAdminNotes(e.target.value)}
                    placeholder="Reason for approval/rejection..."
                    className="w-full p-3 rounded-xl border-gray-200"
                  ></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={handleApprove} type="button" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors">
                    Approve
                  </button>
                  <button onClick={handleReject} type="button" className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-3 rounded-xl font-bold transition-colors">
                    Reject
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center p-6 bg-gray-100 rounded-xl text-gray-500">
                This request was already {selectedRequest.status}.
                <br/>
                Admin Notes: <span className="font-medium">{selectedRequest.admin_notes || 'None'}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a request from the left to view details.
          </div>
        )}
      </div>

    </div>
  );
}
