import React from "react";

function StatCard() {
  return (
    <div className="bg-white/5 p-8 min-h-[220px] rounded-2xl shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-4 text-blue-400">📈 Technical Highlights</h3>
      <div className="text-gray-300 text-sm space-y-2">
        <p>✅ Built on the PERN (PostgreSQL, Express, React, Node) stack</p>
        <p>🌍 Secure OAuth2 login with Steam</p>
        <p>🚀 Scalable team management with real database storage</p>
      </div>
    </div>
  );
}

export default StatCard;
