import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { emptySystemMetadata, Record, SystemMetadata } from "../../interfaces/Metadata";
import { fetchSystemMetadata, fetchSystemRecords } from "../../services/api/ServiceManager";
import { Modal } from "../../components/utils/modal/Modal";
import { millisecondsToDate } from "../../services/Tools";
import { useStoreSession } from "../StoreProviderSession";
import { useStoreTheme } from "../theme/StoreProviderTheme";

import './StoreProviderSystem.css';

interface StoreProviderSystemType {
  openModal: () => void;
  closeModal: () => void;
}

const StoreTheme = createContext<StoreProviderSystemType | undefined>(undefined);

interface Payload {
  isOpen: boolean;
  metadata: SystemMetadata;
  records: Record[]
}

export const StoreProviderSystem: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userData } = useStoreSession();
  const { loadThemeWindow } = useStoreTheme();

  const [data, setData] = useState<Payload>({
    isOpen: false,
    metadata: emptySystemMetadata(),
    records: []
  });

  useEffect(() => {
    fetchMetadata();
    fetchRecords();

    const intervalMetadata = setInterval(() => {
      fetchMetadata();
    }, 10000);

    const intervalRecors = setInterval(() => {
      fetchRecords();
    }, 10000);

    return () => {
      clearInterval(intervalMetadata);
      clearInterval(intervalRecors);
    };
  }, []);

  const fetchMetadata = async () => {
    const metadata = await fetchSystemMetadata();
    setData(prevData => ({
      ...prevData,
      metadata: metadata
    }));
  };

  const fetchRecords = async () => {
    const records = await fetchSystemRecords();
    setData(prevData => ({
      ...prevData,
      records: records
    }));
  };

  const openModal = async () => {
    setData((prevData) => ({
      ...prevData,
      isOpen: true
    }));
  }

  const closeModal = async () => {
    setData((prevData) => ({
      ...prevData,
      isOpen: false
    }));
  }

  const showLogs = () => {    
    let html = data.records
      .map(r => `<p class="log-row">${formatRecord(r)}</p>`)
      .join('');

    html = `<div id="record-row-container">${html}</div>`;

    loadThemeWindow(850, 500, html);
  }

  const formatRecord = (record: Record) => {
    return `${ millisecondsToDate(record.timestamp) } - [${ record.category }]: ${record.message}`;
  }

  return (
    <StoreTheme.Provider value={{ openModal, closeModal }}>
      {children}
      <Modal
        buttons={[
          {
            title: "Close",
            callback: {
              func: closeModal
            }
          }
        ]}
        title={
          <span>System metadata</span>
        }
        width="800px"
        isOpen={data.isOpen}
        onClose={closeModal}>
        <>
          <div id="system-metadata-container">
            <h3 className="system-title">System:</h3>
            <div className="system-metadata-subcontainer">
              <div className="system-metadata-fragment">
                  <p><span className="system-data-title">Core name: </span> <a className="unstyled-anchor" 
                    href={`https://${data.metadata.core_name}`} 
                    target="_blank"
                    title="Go to Rafael24595's core project page">{ data.metadata.core_name }</a></p>
                  <p>
                    <span className="system-data-title">Core version: </span>
                    {data.metadata.core_replace && (
                      <span className="replace-icon" title="This dependency has been replaced"></span>
                    )}
                    <span>{ data.metadata.core_version }</span>
                  </p>
              </div>
              <div className="system-metadata-fragment">
                  <p><span className="system-data-title">Render name: </span> <a className="unstyled-anchor" 
                    href={`https://${data.metadata.render_name}`} 
                    target="_blank" 
                    title="Go to Rafael24595's render project page">{ data.metadata.render_name }</a></p>
                  <p><span className="system-data-title">Render version: </span> <span>{ data.metadata.render_version }</span></p>
              </div>
            </div>
            <h3 className="system-title">Session: </h3>
            <div className="system-metadata-subcontainer">
              <div className="system-metadata-fragment">
                  <p><span className="system-data-title">Session ID: </span> <span>{ data.metadata.session_id }</span></p>
                  <p><span className="system-data-title">Started at: </span> <span>{ millisecondsToDate(data.metadata.session_time) }</span></p>
              </div>
            </div>
            <div id="system-metadata-footer">
              {userData.is_admin && (
                <>
                  <button className="button-anchor" onClick={showLogs} title="View system logs">Logs</button>
                </>
              )}
            </div>
          </div>
        </>
      </Modal>
    </StoreTheme.Provider>
  );
};

export const useStoreSystem = (): StoreProviderSystemType => {
  const context = useContext(StoreTheme);
  if (!context) {
    throw new Error("useStoreSystem must be used within a StoreProviderSystem");
  }
  return context;
};
