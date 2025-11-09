import React from "react";

export const Sidebar: React.FC = () => (
  <div className="sm:w-1/3 w-full bg-[#F9FAFB] px-6 py-8 h-screen flex flex-col gap-4 border-l border-gray-200">
    <div>
      <h3 className="text-xl font-bold mb-3">📘 Technical RAG Findings</h3>
      <div className="mb-3">
        <b>H100 Power Requirements:</b><br />
        Requires dual 16-pin connectors.<br />
        <b>Cooling Spec:</b><br />
        Active cooling required (0-80°C).<br />
        <b>Cabling:</b><br />
        3m DAC cable suggested (2m out).
      </div>
    </div>
    <div>
      <h3 className="text-lg font-bold mb-2">🏢 Datacenter RAG</h3>
      <div className="mb-1"><b>Pod 7 Switches:</b> Switch-7b confirmed in Pod 7.</div>
      <div className="mb-1 text-red-600"><b>2m DAC:</b> Out of Stock (0 units).</div>
      <div className="mb-1 text-green-600"><b>3m DAC:</b> In Stock (12 units).</div>
    </div>
    <div>
      <h3 className="text-lg font-bold mb-2">🔗 Similar Tickets</h3>
      <div>TK-2847 — H100 Installation (Pod 6) ✔️ (2 weeks ago)</div>
      <div>TK-2701 — GPU Cabling (Pod 7) ✔️ (1 month ago)</div>
    </div>
  </div>
);
