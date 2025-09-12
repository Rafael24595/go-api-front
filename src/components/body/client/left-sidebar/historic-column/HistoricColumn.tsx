import { useState } from 'react';
import { LiteRequest, newRequest } from '../../../../../interfaces/request/Request';
import { deleteHistoric as fetchDeleteHistoric, findAction, formatCurl, requestCollect } from '../../../../../services/api/ServiceStorage';
import { millisecondsToDate } from '../../../../../services/Tools';
import { useStoreRequest } from '../../../../../store/StoreProviderRequest';
import { useStoreRequests } from '../../../../../store/StoreProviderRequests';
import { CollectionModal } from '../../../../collection/CollectionModal';
import { Combo } from '../../../../utils/combo/Combo';
import { VIEW_STORED } from '../LeftSidebar';
import { useStoreSession } from '../../../../../store/StoreProviderSession';
import { RequestRequestCollect } from '../../../../../services/api/Requests';
import { useAlert } from '../../../../utils/alert/Alert';
import { VoidCallback } from '../../../../../interfaces/Callback';
import { historicOptions } from './Constants';
import { useStoreTheme } from '../../../../../store/theme/StoreProviderTheme';
import { CodeArea } from '../../../../utils/code-area/CodeArea';
import { ModalButton } from '../../../../../interfaces/ModalButton';
import { calculateWindowSize } from '../../../../../services/Utils';

import './HistoricColumn.css';

interface HistoricColumnProps {
    setCursor: (cursor: string) => void;
}

interface PayloadModal {
    request: LiteRequest;
    modal: boolean;
}

export function HistoricColumn({ setCursor }: HistoricColumnProps) {
    const { ask } = useAlert();

    const { userData } = useStoreSession();
    const { loadThemeWindow } = useStoreTheme();

    const { request, cleanRequest, defineFreeRequest, fetchFreeRequest, insertRequest } = useStoreRequest();
    const { historic, fetchHistoric, fetchStored, fetchCollection } = useStoreRequests();

    const [modalData, setModalData] = useState<PayloadModal>({
        request: newRequest(userData.username),
        modal: false,
    });

    const defineHistoricRequest = async (item: LiteRequest) => {
        await fetchFreeRequest(item);
    }

    const insertHistoric = async (item: LiteRequest) => {
        const action = await findAction(item);
        const request = action.request;

        await insertRequest(request);
        await fetchStored();
        setCursor(VIEW_STORED);
    };

    const deleteHistoric = async (item: LiteRequest) => {
        const content = `The request '${item.name}' will be deleted, are you sure?`;
        const buttons: ModalButton[] = [
            {
                title: "Yes",
                type: "button",
                callback: {
                    func: async () => {
                        try {
                            await fetchDeleteHistoric(item);
                            await fetchHistoric();
                        } catch (error) {
                            console.error("Error deleting request:", error);
                        }
                    }
                }
            },
            {
                title: "No",
                callback: VoidCallback
            }
        ];
        ask({ content, buttons });
    };

    const cloneHistoric = async (item: LiteRequest) => {
        const action = await findAction(item);
        const request = action.request;

        request._id = "";
        defineFreeRequest(request);
    };

    const makeKey = (item: LiteRequest): string => {
        return `${item.timestamp}-${item.method}-${item.uri}`;
    }

    const openModal = (item: LiteRequest) => {
        setModalData({ request: item, modal: true });
    };

    const closeModal = () => {
        setModalData({ ...modalData, modal: false });
    };

    const submitModal = async (collectionId: string, collectionName: string, item: LiteRequest, requestName: string) => {
        const action = await findAction(item);
        const request = action.request;

        const payload: RequestRequestCollect = {
            source_id: "",
            target_id: collectionId,
            target_name: collectionName,
            request: request,
            request_name: requestName,
            move: 'clone',
        };

        await requestCollect(payload);
        await fetchCollection();
    }

    const showCurl = async (item: LiteRequest) => {
        const curl = await formatCurl(item._id)
        const { width, height } = calculateWindowSize(curl, {
            minWidth: 550,
            minHeight: 200
        });
        loadThemeWindow(width, height, <CodeArea code={curl} />);
    }

    return (
        <>
            <div className="column-option options border-bottom">
                <div id="left-options">
                    <Combo options={[]} />
                </div>
                <button type="button" className="button-anchor" onClick={cleanRequest}>Clean</button>
                <div id="right-options show">
                    <Combo options={[
                        {
                            icon: "🔄",
                            label: "Refresh",
                            title: "Refresh",
                            action: () => fetchHistoric()
                        }
                    ]} />
                </div>
            </div>
            <div id="actions-container">
                {historic.length > 0 ? (
                    historic.map((cursor) => (
                        <div key={makeKey(cursor)} className={`request-preview ${cursor._id == request._id && "request-selected"}`}>
                            <a className="request-link" title={cursor.uri}
                                onClick={() => defineHistoricRequest(cursor)}>
                                <div className="request-sign">
                                    <span className={`request-sign-method ${cursor.method}`}>{cursor.method}</span>
                                    <span className="request-sign-url">{cursor.uri}</span>
                                </div>
                                <div className="request-sign-date">
                                    <span className="request-sign-timestamp" title={millisecondsToDate(cursor.timestamp)}>{millisecondsToDate(cursor.timestamp)}</span>
                                </div>
                            </a>
                            <Combo options={historicOptions(cursor, {
                                insertHistoric, deleteHistoric, cloneHistoric,
                                openModal, showCurl
                            })} />
                        </div>
                    ))
                ) : (
                    <p className="no-data"> - No history found - </p>
                )}
            </div>
            <CollectionModal
                isOpen={modalData.modal}
                request={modalData.request}
                onSubmit={submitModal}
                onClose={closeModal} />
        </>
    );
}