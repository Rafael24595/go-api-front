import { useState } from "react";
import { useStoreStatus } from "../../../store/StoreProviderStatus";

import './Details.css';

interface DetailsProps {
  identity: string,
  summary: string;
  summaryClassList?: string;
  options?: React.ReactNode;
  subsummary?: React.ReactNode;
  children: React.ReactNode;
}

export const Details: React.FC<DetailsProps> = ({ identity, summary, summaryClassList, options, subsummary, children }) => {
  const { findOrDefault, store } = useStoreStatus();

  const [isOpen, setIsOpen] = useState(
    findOrDefault(identity, {
      def: false,
      parser: (v) => v == "true"
    })
  );

  const toggleOpen = () => {
    setIsOpen((prev) => {
      store(identity, !prev);
      return !prev;
    })
  };

  return (
    <>
      <div className="summary-container request-preview">
        <div className="summary-content">
          <button
            onClick={toggleOpen}
            className="details-button"
            aria-expanded={isOpen}
            aria-controls="details-content">
            <span className="switch-arrow">{isOpen ? "▲" : "▼"}</span>
            <span className={`summary-text ${summaryClassList}`} title={summary}>{summary}</span>
          </button>
          {subsummary}
        </div>
        {options && options}
      </div>
      <div className={`details-content ${isOpen ? "open" : ""}`}>
        {children}
      </div>
    </>
  );
};
