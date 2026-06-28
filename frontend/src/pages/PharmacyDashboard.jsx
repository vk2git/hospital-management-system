import React, { useState, useEffect } from 'react';
import Sidebar from '@/shared/components/Sidebar';
import { getInventory, addInventoryItem, updateInventoryItem, verifyPrescription } from '@/shared/api/api';
import toast from 'react-hot-toast';

export default function PharmacyDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    medicine_name: '', generic_name: '', category: '', quantity: '', unit_price: '', reorder_level: '', expiry_date: ''
  });

  // Verify Prescription State
  const [tokenStr, setTokenStr] = useState('');
  const [verifiedPresc, setVerifiedPresc] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data } = await getInventory();
      setInventory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addInventoryItem(form);
      setForm({ medicine_name: '', generic_name: '', category: '', quantity: '', unit_price: '', reorder_level: '', expiry_date: '' });
      setShowForm(false);
      fetchInventory();
    } catch (err) {
      toast.error('Failed to add item');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!tokenStr) return;
    setVerifyLoading(true);
    setVerifiedPresc(null);
    try {
      const { data } = await verifyPrescription(tokenStr);
      setVerifiedPresc(data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid or expired token.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const menuItems = [
    { id: 'inventory', label: 'Inventory', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
    { id: 'prescriptions', label: 'Verify Prescription', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> }
  ];

  return (
    <div className="flex bg-[var(--md-sys-color-surface-variant)] min-h-screen">
      <Sidebar menuItems={menuItems} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {activeTab === 'inventory' && (
            <>
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">Pharmacy Inventory</h2>
                  <p className="text-[var(--md-sys-color-on-surface-variant)] text-sm mt-1">Manage medicine stock and track low levels.</p>
                </div>
                <button 
                  onClick={() => setShowForm(!showForm)}
                  className="px-5 py-2.5 bg-[var(--md-sys-color-primary)] text-white font-bold rounded-xl text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                  Add Medicine
                </button>
              </div>

              {showForm && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--md-sys-color-primary)] animate-fade-in relative overflow-hidden">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Add Inventory Item</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Medicine Name *</label>
                        <input required type="text" value={form.medicine_name} onChange={e => setForm({...form, medicine_name: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Generic Name</label>
                        <input type="text" value={form.generic_name} onChange={e => setForm({...form, generic_name: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                        <input type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Quantity *</label>
                        <input required type="number" min="0" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Unit Price ($) *</label>
                        <input required type="number" step="0.01" min="0" value={form.unit_price} onChange={e => setForm({...form, unit_price: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Reorder Level *</label>
                        <input required type="number" min="1" value={form.reorder_level} onChange={e => setForm({...form, reorder_level: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                      </div>
                    </div>
                    <div className="pt-2 flex gap-3">
                      <button type="submit" className="px-6 py-2.5 bg-[var(--md-sys-color-primary)] text-white font-bold rounded-xl text-sm transition-all hover:shadow-md">
                        Add Item
                      </button>
                      <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm transition-all hover:bg-gray-200">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {loading ? (
                <div className="p-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--md-sys-color-primary)] mx-auto"></div></div>
              ) : inventory.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                  <p className="text-gray-500">Inventory is empty.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="p-4 font-medium">Medicine</th>
                        <th className="p-4 font-medium">Category</th>
                        <th className="p-4 font-medium">Stock Level</th>
                        <th className="p-4 font-medium">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {inventory.map(item => {
                        const isLow = item.quantity <= item.reorder_level;
                        return (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="p-4">
                              <div className="font-bold text-gray-900">{item.medicine_name}</div>
                              <div className="text-xs text-gray-500">{item.generic_name}</div>
                            </td>
                            <td className="p-4 text-sm text-gray-600">{item.category || '-'}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>{item.quantity}</span>
                                {isLow && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-md">LOW</span>}
                              </div>
                            </td>
                            <td className="p-4 text-sm font-bold">${item.unit_price}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">Verify Prescription Token</h2>
                <p className="text-[var(--md-sys-color-on-surface-variant)] text-sm mt-1">Enter the 10-minute secure token provided by the patient.</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-xl">
                <form onSubmit={handleVerify} className="flex gap-3">
                  <input 
                    type="text" 
                    value={tokenStr} 
                    onChange={e => setTokenStr(e.target.value)} 
                    placeholder="Enter 6-character token" 
                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-mono text-lg tracking-widest uppercase"
                    maxLength={6}
                    required
                  />
                  <button disabled={verifyLoading} className="px-6 py-3 bg-[var(--md-sys-color-primary)] text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                    {verifyLoading ? 'Verifying...' : 'Verify'}
                  </button>
                </form>
              </div>

              {verifiedPresc && (
                <div className="bg-white rounded-2xl p-8 border border-green-200 shadow-lg relative overflow-hidden animate-fade-in max-w-3xl">
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 text-sm font-bold rounded-bl-xl">VERIFIED AUTHENTIC</div>
                  
                  <div className="mb-6 border-b border-gray-100 pb-6">
                    <h3 className="font-bold text-gray-900 text-xl mb-2">Prescription Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500">Patient:</span> <span className="font-bold">{verifiedPresc.patient_name}</span></div>
                      <div><span className="text-gray-500">Doctor:</span> <span className="font-bold">Dr. {verifiedPresc.doctor_name}</span></div>
                      <div><span className="text-gray-500">Issued On:</span> <span className="font-bold">{new Date(verifiedPresc.created_at).toLocaleString()}</span></div>
                      <div><span className="text-gray-500">AI Assisted:</span> <span className="font-bold">{verifiedPresc.is_ai_generated ? 'Yes' : 'No'}</span></div>
                    </div>
                  </div>

                  <h4 className="font-bold text-gray-900 mb-4">Medications</h4>
                  <div className="space-y-3">
                    {verifiedPresc.medications.map((med, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-[var(--md-sys-color-primary)] text-lg mb-1">{med.name}</p>
                          <div className="flex gap-4 text-sm text-gray-600 font-medium">
                            <span>{med.dosage}</span>
                            <span>•</span>
                            <span>{med.frequency}</span>
                            <span>•</span>
                            <span>{med.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {verifiedPresc.instructions && (
                    <div className="mt-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <span className="font-bold text-blue-900 block mb-1">Doctor's Instructions:</span>
                      <p className="text-sm text-blue-800">{verifiedPresc.instructions}</p>
                    </div>
                  )}
                  
                  <div className="mt-8 flex justify-end">
                    <button onClick={() => { setVerifiedPresc(null); setTokenStr(''); }} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                      Clear & Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
