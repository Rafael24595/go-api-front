import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { emptySystemMetadata, Record, SystemMetadata, ViewerSource } from "../../interfaces/Metadata";
import { fetchSystemMetadata, fetchSystemRecords } from "../../services/api/ServiceManager";
import { Modal } from "../../components/utils/modal/Modal";
import { millisecondsToDate } from "../../services/Tools";
import { useStoreSession } from "../StoreProviderSession";
import { useStoreTheme } from "../theme/StoreProviderTheme";
import useInactivityRefresh from "../../hook/InactivityRefresh";
import { generateHash } from "../../services/Utils";
import { hostURL } from "../../services/api/ApiManager";
import { useStoreStatus } from "../StoreProviderStatus";

import './StoreProviderSystem.css';

interface StoreProviderSystemType {
  openModal: () => void;
  closeModal: () => void;
}

const StoreTheme = createContext<StoreProviderSystemType | undefined>(undefined);

interface PayloadModal {
  isOpen: boolean;
}

interface PayloadMetadata {
  hash: string;
  metadata: SystemMetadata;
}

interface PayloadRecords {
  hash: string;
  records: Record[];
}

export const StoreProviderSystem: React.FC<{ children: ReactNode }> = ({ children }) => {
  useInactivityRefresh(import.meta.env.VITE_INACTIVITY_REFRESH, import.meta.env.VITE_INACTIVITY_WARNING);

    const { clean } = useStoreStatus();
  
  const { userData } = useStoreSession();
  const { loadThemeWindow } = useStoreTheme();

  const [modalData, setModalData] = useState<PayloadModal>({
    isOpen: false
  });

  const [metadata, setMetadata] = useState<PayloadMetadata>({
    hash: "",
    metadata: emptySystemMetadata()
  });

  const [recordsData, setRecordsData] = useState<PayloadRecords>({
    hash: "",
    records: []
  });

  useEffect(() => {
    fetchMetadata();
    fetchRecords();

    const interval = setInterval(() => {
      fetchMetadata();
      fetchRecords();
    }, 60 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const fetchMetadata = async () => {
    const metadata = await fetchSystemMetadata();
    const newHash = await generateHash(metadata);
    setMetadata((prevData) => {
      if(prevData.hash == newHash) {
        return prevData;
      }

      return {
        hash: newHash,
        metadata: metadata
      };
    });
  };

  const fetchRecords = async () => {
    const records = await fetchSystemRecords();
    const newHash = await generateHash(records);
    setRecordsData((prevData) => {
      if(prevData.hash == newHash) {
        return prevData;
      }

      return {
        hash: newHash,
        records: records
      };
    });
  };

  const openModal = async () => {
    fetchMetadata();
    fetchRecords();

    setModalData({isOpen: true});
  }

  const closeModal = async () => {
    setModalData({isOpen: false});
  }

  const showLogs = () => {    
    let html = recordsData.records
      .map(r => `<p class="log-row">${formatRecord(r)}</p>`)
      .join('');

    html = `<div id="record-row-container">${html}</div>`;

    loadThemeWindow(850, 500, html);
  }

  const formatRecord = (record: Record) => {
    return `${ millisecondsToDate(record.timestamp) } - [${ record.category }]: ${record.message}`;
  }

  const viewerUrl = (source: ViewerSource) => {
    return `${hostURL()}${source.route}`;
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
        titleCustom={
          <span>System metadata</span>
        }
        style={{
          width: "800px"
        }}
        isOpen={modalData.isOpen}
        onClose={closeModal}>
        <>
          <div id="system-metadata-container">
            <h3 className="system-title">System:</h3>
            <div className="system-metadata-subcontainer">
              <div className="system-metadata-fragment">
                  <p><span className="system-data-title">Core name: </span> <a className="unstyled-anchor" 
                    href={`https://${metadata.metadata.core_name}`} 
                    target="_blank"
                    title="Go to Rafael24595's core project page">{ metadata.metadata.core_name }</a></p>
                  <p>
                    <span className="system-data-title">Core version: </span>
                    {metadata.metadata.core_replace && (
                      <span className="replace-icon" title="This dependency has been replaced"></span>
                    )}
                    <span>{ metadata.metadata.core_version }</span>
                  </p>
              </div>
              <div className="system-metadata-fragment">
                  <p><span className="system-data-title">Render name: </span> <a className="unstyled-anchor" 
                    href={`https://${metadata.metadata.render_name}`} 
                    target="_blank" 
                    title="Go to Rafael24595's render project page">{ metadata.metadata.render_name }</a></p>
                  <p>
                    <span className="system-data-title">Render version: </span> 
                    {metadata.metadata.render_release != metadata.metadata.render_version && (
                      <span className="replace-icon" title={`This dependency is not up to date; the latest version available is ${metadata.metadata.render_release}`}></span>
                    )}
                    <span>{ metadata.metadata.render_version }</span></p>
              </div>
            </div>
            {metadata.metadata.front_name != "" && metadata.metadata.front_version != "" && (
              <div className="system-metadata-subcontainer">
                <div className="system-metadata-fragment">
                    <p><span className="system-data-title">Front name: </span> <a className="unstyled-anchor" 
                      href={`https://github.com/Rafael24595/${metadata.metadata.front_name}`} 
                      target="_blank" 
                      title="Go to Rafael24595's render project page">{ metadata.metadata.front_name }</a></p>
                    <p><span className="system-data-title">Front version: </span> <span>{ metadata.metadata.front_version }</span></p>
                </div>
              </div>
            )}
            <h3 className="system-title">Session: </h3>
            <div className="system-metadata-subcontainer">
              <div className="system-metadata-fragment">
                  <p><span className="system-data-title">Session ID: </span> <span>{ metadata.metadata.session_id }</span></p>
                  <p><span className="system-data-title">Started at: </span> <span>{ millisecondsToDate(metadata.metadata.session_time) }</span></p>
              </div>
            </div>
             {metadata.metadata.viewer_sources.length > 0 && (
              <>
                <h3 className="system-title">Viewer:</h3>
                <div className="system-metadata-subcontainer">
                  <div className="system-metadata-fragment">
                    {metadata.metadata.viewer_sources.map(s => (
                      <p key={s.route}>
                        <span className="system-data-title">{s.name}: </span>
                        <a className="unstyled-anchor" 
                          href={`${viewerUrl(s)}`} 
                          target="_blank" 
                          title={`${s.description}`}>{ viewerUrl(s) }</a>
                      </p>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div id="system-metadata-footer">
              <button className="button-anchor" onClick={clean} title="View system logs">Clear Storage</button>
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
