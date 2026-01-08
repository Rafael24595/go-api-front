import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { emptySystemMetadata, SystemMetadata, ViewerSource } from "../../interfaces/system/Metadata";
import { fetchSystemMetadata } from "../../services/api/ServiceManager";
import { Modal } from "../../components/utils/modal/Modal";
import { millisecondsToDate } from "../../services/Tools";
import { useStoreSession } from "./StoreProviderSession";
import useInactivityRefresh from "../../hook/InactivityRefresh";
import { generateHash } from "../../services/Utils";
import { hostURL } from "../../services/api/ApiManager";
import { useStoreStatus } from "../StoreProviderStatus";
import { hasRole, Role } from "../../interfaces/system/UserData";
import { windowPreferences } from "../../utils/Window";

import './StoreProviderSystem.css';

interface StoreProviderSystemType {
  metadata: SystemMetadata;
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

export const StoreProviderSystem: React.FC<{ children: ReactNode }> = ({ children }) => {
  useInactivityRefresh(import.meta.env.VITE_INACTIVITY_REFRESH, import.meta.env.VITE_INACTIVITY_WARNING);

  const { clean } = useStoreStatus();

  const { userData, checkSession } = useStoreSession();

  const [modalData, setModalData] = useState<PayloadModal>({
    isOpen: false
  });

  const [metadata, setMetadata] = useState<PayloadMetadata>({
    hash: "",
    metadata: emptySystemMetadata()
  });

  useEffect(() => {
    fetchMetadata();

    const interval = setInterval(() => {
      fetchMetadata();
    }, 60 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const fetchMetadata = async () => {
    const metadata = await fetchSystemMetadata();
    const newHash = await generateHash(metadata);
    setMetadata((prevData) => {
      if (prevData.hash == newHash) {
        return prevData;
      }

      return {
        hash: newHash,
        metadata: metadata
      };
    });
  };

  const openModal = async () => {
    checkSession();
    setModalData({ isOpen: true });
  }

  const closeModal = async () => {
    setModalData({ isOpen: false });
  }

  const showLogs = () => {
    checkSession();
    window.open(`/log`, '_blank', windowPreferences(850, 500));
  }

  const showTerminal = () => {
    fetchMetadata();
    window.open(`/cmd`, '_blank', windowPreferences(850, 500));
  }

  const viewerUrl = (source: ViewerSource) => {
    return `${hostURL()}${source.route}`;
  }

  return (
    <StoreTheme.Provider value={{ metadata: metadata.metadata, openModal, closeModal }}>
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
          <span title={metadata.metadata.enable_secrets ? "Secrets enabled" : ""}>
            System metadata
          </span>
        }
        style={{
          width: "800px"
        }}
        isOpen={modalData.isOpen}
        onClose={closeModal}>
        <>
          <div id="system-metadata-container">
            <h3 className="system-title">
              <span>System:</span>
            </h3>
            <div className="system-metadata-subcontainer">
              <div className="system-metadata-fragment">
                <p><span className="system-data-title">Core name: </span> <a className="unstyled-anchor"
                  href={`https://${metadata.metadata.core_name}`}
                  target="_blank"
                  title="Go to Rafael24595's core project page">{metadata.metadata.core_name}</a></p>
                <p>
                  <span className="system-data-title">Core version: </span>
                  {metadata.metadata.core_replace && (
                    <span className="replace-icon" title="This dependency has been replaced"></span>
                  )}
                  <span>{metadata.metadata.core_version}</span>
                </p>
              </div>
              <div className="system-metadata-fragment">
                <p><span className="system-data-title">Render name: </span> <a className="unstyled-anchor"
                  href={`https://${metadata.metadata.render_name}`}
                  target="_blank"
                  title="Go to Rafael24595's render project page">{metadata.metadata.render_name}</a></p>
                <p>
                  <span className="system-data-title">Render version: </span>
                  {metadata.metadata.render_release != metadata.metadata.render_version && (
                    <span className="replace-icon" title={`This dependency is not up to date; the latest version available is ${metadata.metadata.render_release}`}></span>
                  )}
                  <span>{metadata.metadata.render_version}</span></p>
              </div>
            </div>
            {metadata.metadata.front_name != "" && metadata.metadata.front_version != "" && (
              <div className="system-metadata-subcontainer">
                <div className="system-metadata-fragment">
                  <p><span className="system-data-title">Front name: </span> <a className="unstyled-anchor"
                    href={`https://github.com/Rafael24595/${metadata.metadata.front_name}`}
                    target="_blank"
                    title="Go to Rafael24595's render project page">{metadata.metadata.front_name}</a></p>
                  <p><span className="system-data-title">Front version: </span> <span>{metadata.metadata.front_version}</span></p>
                </div>
              </div>
            )}
            <h3 className="system-title">Session: </h3>
            <div className="system-metadata-subcontainer">
              <div className="system-metadata-fragment">
                <p><span className="system-data-title">Session ID: </span> <span>{metadata.metadata.session_id}</span></p>
                <p><span className="system-data-title">Started at: </span> <span>{millisecondsToDate(metadata.metadata.session_time)}</span></p>
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
                          title={`${s.description}`}>{viewerUrl(s)}</a>
                      </p>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div id="system-metadata-footer">
              <button className="button-anchor" onClick={clean} title="Clear storage">Clear Storage</button>
              {hasRole(userData, Role.ROLE_ADMIN) && (
                <>
                  <button className="button-anchor" onClick={showLogs} title="View system logs">Logs</button>
                  <button className="button-anchor" onClick={showTerminal} title="Open CMD">Cmd</button>
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
