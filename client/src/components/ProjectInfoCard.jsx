import React from "react";

function ProjectInfoCard() {
  return (
    <div className="bg-white/5 p-8 min-h-[220px] rounded-2xl shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-4 text-purple-400">💼 About This Project</h3>
      <p className="text-gray-300 text-sm">
        CS2Squad is a solo-built portfolio project showcasing full-stack development, database integration, and real-time team matching.
        The app demonstrates skills in modern React design, backend API creation, and PostgreSQL database management.
      </p>
    </div>
  );
}

export default ProjectInfoCard;
