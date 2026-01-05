import { useState } from "react";
import { useStoreStatus } from "../../../store/StoreProviderStatus";
import { booleanParser } from "../../../store/Helper";

import './Details.css';

interface DetailsProps {
  identity: string,
  summary: React.ReactNode;
  options?: React.ReactNode;
  subsummary?: React.ReactNode;
  children: React.ReactNode;
  isEmpty?: () => boolean;
  onToggle?: (status: boolean) => void;
}

export const Details: React.FC<DetailsProps> = ({ identity, summary, options, subsummary, children, isEmpty, onToggle }) => {
  const { find, store } = useStoreStatus();

  const [isOpen, setIsOpen] = useState(
    find(identity, booleanParser())
  );

  const toggleOpen = () => {
    if(onToggle) {
      onToggle(!isOpen);
    }

    store(identity, !isOpen);

    setIsOpen((prev) => {
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
