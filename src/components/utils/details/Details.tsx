import { useState } from "react";

import './Details.css';

interface DetailsProps {
  summary: string;
  options?: React.ReactNode;
  children: React.ReactNode;
}

export const Details: React.FC<DetailsProps> = ({ summary, options, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev)
  };

  return (
    <div className="details-container">
      <div className="summary-container request-preview">
        <button
          onClick={toggleOpen}
          className="details-button"
          aria-expanded={isOpen}
          aria-controls="details-content">
          <span>{isOpen ? "▲" : "▼"}</span>
          {summary} 
        </button>
        {options && options}
      </div>
      <div className={`details-content ${isOpen ? "open" : ""}`}>
        {children}
      </div>
    </div>
  );
};
