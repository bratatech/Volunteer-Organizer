import React, { useState } from 'react';

export default function CertificateVault({ certifications }) {
  if (!certifications) return <p className="text-gray-500">No certifications found.</p>;

  const [copiedId, setCopiedId] = useState(null);
  const [activeCert, setActiveCert] = useState(null); // Currently viewed certificate citation

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  if (!certifications || certifications.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🎓</span>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Verified Credentials Vault</h2>
            <p className="text-xs text-gray-400 font-medium">Your earned certificates, resume codes, and credentials</p>
          </div>
        </div>
        <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
          <span className="text-3xl block mb-2">🎖️</span>
          <p className="text-xs font-bold text-gray-500 mb-1">No Certifications Earned Yet</p>
          <p className="text-[11px] text-gray-400 max-w-[240px] mx-auto leading-relaxed">
            No certifications earned yet. Keep volunteering!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🎓</span>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Verified Credentials Vault</h2>
          <p className="text-xs text-gray-400 font-medium">Your earned certificates, resume codes, and credentials</p>
        </div>
      </div>

      <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
        {certifications.map((cert) => {
          const isCopied = copiedId === cert.id;
          const isLead = cert.role === 'Team Lead';

          return (
            <div 
              key={cert.id} 
              className="border border-gray-100 hover:border-indigo-100 rounded-xl p-4 bg-gradient-to-br from-white to-gray-50/50 shadow-sm transition hover:shadow-md flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-800 text-sm truncate max-w-[180px]" title={cert.activityName}>
                    {cert.activityName}
                  </h3>
                  <span className={`text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                    isLead 
                      ? 'bg-amber-50 border-amber-250 text-amber-700' 
                      : 'bg-indigo-50 border-indigo-150 text-indigo-700'
                  }`}>
                    {cert.role || 'Volunteer'}
                  </span>
                </div>

                <p className="text-[10px] text-gray-400 font-medium">
                  Issued: {cert.dateIssued} • By: {cert.issuingOrganizer}
                </p>

                <div className="mt-3 flex items-center justify-between bg-white rounded-lg p-2 border border-gray-100 text-[10px] font-mono text-gray-500">
                  <span className="truncate max-w-[120px]">{cert.id}</span>
                  <button 
                    onClick={() => handleCopyId(cert.id)}
                    className={`text-[9px] font-semibold px-2 py-1 rounded transition shrink-0 ${
                      isCopied 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isCopied ? '✓ Copied!' : '📋 Copy ID'}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setActiveCert(cert)}
                  className="flex-1 text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition active:scale-[0.98]"
                >
                  👁️ View
                </button>
                <button
                  onClick={() => window.open(`http://localhost:5000/api/certificates/${cert.id}/download`, '_blank')}
                  className="flex-1 text-center py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-1"
                >
                  📄 Download
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Citation Overlay modal */}
      {activeCert && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-amber-50/20 border-4 border-amber-600 max-w-2xl w-full p-2 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            
            {/* Elegant Inner Academic border frame */}
            <div className="bg-white border-2 border-dashed border-amber-700 rounded-xl p-8 md:p-12 text-center flex flex-col items-center justify-between min-h-[480px]">
              
              {/* Close Button */}
              <button 
                onClick={() => setActiveCert(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full border border-gray-250 flex items-center justify-center font-bold transition"
              >
                ✕
              </button>

              {/* Certificate header */}
              <div className="w-full">
                <span className="text-5xl block mb-4">📜</span>
                <h1 className="text-amber-800 font-serif text-3xl tracking-widest uppercase font-extrabold mb-1">
                  Certificate of Excellence
                </h1>
                <p className="text-gray-400 font-mono text-[9px] uppercase tracking-widest mb-6">
                  Verified Campus Credential • FestOps
                </p>
              </div>

              {/* Certificate recipient body */}
              <div className="my-4 space-y-4">
                <p className="text-sm font-medium text-gray-500 italic">
                  This digital campus credential is officially awarded to
                </p>
                <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide border-b border-gray-200 pb-2 max-w-md mx-auto">
                  {JSON.parse(localStorage.getItem('user') || '{}').email?.split('@')[0] || 'Deserving Student'}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed max-w-lg mx-auto font-medium">
                  for outstanding commitment, active volunteer service, and exemplary performance as a
                  <span className="block my-2 text-indigo-600 font-serif text-lg font-bold">
                    ✨ {activeCert.role} ✨
                  </span>
                  during the successful implementation of the college activity
                  <span className="block my-1 text-gray-800 font-bold text-base">
                    "{activeCert.activityName}"
                  </span>
                </p>
              </div>

              {/* Certificate signatures and seal */}
              <div className="w-full border-t border-dashed border-gray-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
                <div>
                  <p className="text-[10px] text-gray-450 uppercase font-bold tracking-wider">Date Awarded</p>
                  <p className="text-sm font-bold text-gray-700 font-mono">{activeCert.dateIssued}</p>
                </div>
                
                {/* Gold Seal Decoration */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 border-4 border-double border-white shadow-md flex items-center justify-center text-white shrink-0">
                  <span className="text-2xl font-serif font-black select-none">★</span>
                </div>

                <div className="md:text-right">
                  <p className="text-[10px] text-gray-450 uppercase font-bold tracking-wider">Authorized Organizer</p>
                  <p className="text-sm font-bold text-amber-800 italic font-serif">{activeCert.issuingOrganizer}</p>
                </div>
              </div>

              {/* Verification watermark */}
              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="text-[9px] font-mono text-gray-400">
                  Verification Code: <strong className="text-gray-500 font-semibold">{activeCert.id}</strong>
                </div>
                <button
                  onClick={() => window.open(`http://localhost:5000/api/certificates/${activeCert.id}/download`, '_blank')}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 hover:shadow-lg active:scale-95"
                >
                  📄 Download Official PDF Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
