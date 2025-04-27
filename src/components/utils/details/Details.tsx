import { useState } from "react";
import { useStoreStatus } from "../../../store/StoreProviderStatus";

import './Details.css';

interface DetailsProps {
  identity: string,
  summary: React.ReactNode;
  options?: React.ReactNode;
  subsummary?: React.ReactNode;
  children: React.ReactNode;
  isEmpty?: () => boolean
}

export const Details: React.FC<DetailsProps> = ({ identity, summary, options, subsummary, children, isEmpty }) => {
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
            <span className={`switch-arrow ${ isEmpty && isEmpty() ? "disabled" : "" }`}>{isOpen ? "▲" : "▼"}</span>
            <span className={`summary-text`}>{summary}</span>
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
