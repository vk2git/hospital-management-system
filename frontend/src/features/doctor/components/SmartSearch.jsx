import React, { useState } from 'react';
import { smartSearchPatients } from '@/shared/api/api';
import AIBanner from '@/shared/components/AIBanner';

export default function SmartSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [interpretedQuery, setInterpretedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await smartSearchPatients(query);
      setResults(data.results);
      setInterpretedQuery(data.interpreted_query);
    } catch (err) {
      setError(err.response?.data?.detail || "AI Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--md-sys-color-surface)] rounded-3xl p-8 shadow-sm border border-gray-100 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4 shadow-lg shadow-indigo-200">
          ✨
        </div>
        <h2 className="text-3xl font-bold text-[var(--md-sys-color-on-surface)]">AI Smart Search</h2>
        <p className="text-gray-500 mt-2">Use natural language to filter your patients and medical records.</p>
        <p className="text-sm text-gray-400 mt-1 italic">Example: "Patients I saw last month with diabetes"</p>
        <div className="mt-4 inline-block text-left"><AIBanner /></div>
      </div>

      <form onSubmit={handleSearch} className="relative mb-8">
        <input 
          type="text"
          value={query}
          onChange={e=>setQuery(e.target.value)}
          placeholder="Ask the AI to filter your patients..."
          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-indigo-400 focus:ring-0 text-lg transition-colors pr-32"
        />
        <button 
          type="submit"
          disabled={loading}
          className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Thinking...' : 'Search'}
        </button>
      </form>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6">{error}</div>}

      {interpretedQuery && (
        <div className="mb-6 p-4 bg-gray-900 rounded-xl text-gray-300 font-mono text-sm overflow-x-auto shadow-inner">
          <div className="text-gray-500 text-xs mb-2 uppercase tracking-wider font-sans">Interpreted SQL Query:</div>
          {interpretedQuery}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4 animate-slide-up">
          <h3 className="font-bold text-lg border-b pb-2">Results ({results.length})</h3>
          <div className="grid gap-4">
            {results.map((r, i) => (
              <div key={i} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow flex justify-between items-center transition-shadow">
                <div>
                  <div className="font-bold text-lg">{r.first_name} {r.last_name}</div>
                  <div className="text-sm text-gray-500">{r.email}</div>
                </div>
                {r.diagnosis && (
                  <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                    {r.diagnosis}
                  </div>
                )}
                {r.date && (
                  <div className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-lg">
                    {r.date}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && interpretedQuery && !loading && (
        <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-2xl">
          No patients matched your specific AI criteria.
        </div>
      )}

    </div>
  );
}
