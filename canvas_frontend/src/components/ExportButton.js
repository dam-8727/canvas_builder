import React from "react";
import "../styles/ExportButton.css";

const ExportButton = ({ onExport }) => {
  return (
    <button className="export-btn" onClick={onExport}>
      Export as PDF
    </button>
  );
};

export default ExportButton; 