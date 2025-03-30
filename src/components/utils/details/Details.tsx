import { useState } from "react";

import './Details.css';

interface DetailsProps {
  identity: string,
  summary: string;
  options?: React.ReactNode;
  subsummary?: React.ReactNode;
  children: React.ReactNode;
}

export const Details: React.FC<DetailsProps> = ({ identity, summary, options, subsummary, children }) => {
  const [isOpen, setIsOpen] = useState(findCursor(identity));

  const toggleOpen = () => {
    setIsOpen((prev) => {
      storeCursor(identity, !prev);
      return !prev;
    })
  };

  return (
    <div className="details-container">
      <div className="summary-container request-preview">
        <div className="summary-content">
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
        <div className="subsummary-content">
          {subsummary}
        </div>
      </div>
      <div className={`details-content ${isOpen ? "open" : ""}`}>
        {children}
      </div>
    </div>
  );
};

const findCursor = (key: string): boolean => {
  const storedValue = localStorage.getItem(key);
  return storedValue == "true";
}

const storeCursor = (key: string, status: boolean) => {
  localStorage.setItem(key, `${status}`);
}
