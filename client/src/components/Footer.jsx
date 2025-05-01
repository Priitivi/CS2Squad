import React from "react";

function Footer() {
  return (
    <footer className="mt-16 text-center text-sm text-gray-500 py-6">
      © {new Date().getFullYear()} Priitivi | 
      <a
        href="https://github.com/priitivi"
        className="ml-1 text-blue-400 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </a> |
      <a
        href="https://www.priitivi.com"
        className="ml-1 text-blue-400 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        Portfolio
      </a>
    </footer>
  );
}

export default Footer;
