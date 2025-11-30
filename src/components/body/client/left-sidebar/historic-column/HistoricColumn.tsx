import { useState } from 'react';
import { LiteRequest, newRequest } from '../../../../../interfaces/client/request/Request';
import { findAction, exportCurl } from '../../../../../services/api/ServiceStorage';
import { deleteHistoric as fetchDeleteHistoric } from '../../../../../services/api/ServiceHistory';
import { millisecondsToDate } from '../../../../../services/Tools';
import { useStoreRequest } from '../../../../../store/client/StoreProviderRequest';
import { useStoreCollections } from '../../../../../store/client/StoreProviderCollections';
import { CollectRequestModal } from '../../../../client/collection/CollectRequestModal';
import { Combo } from '../../../../utils/combo/Combo';
import { VIEW_STORED } from '../LeftSidebar';
import { useStoreSession } from '../../../../../store/system/StoreProviderSession';
import { RequestRequestCollect } from '../../../../../services/api/Requests';
import { useAlert } from '../../../../utils/alert/Alert';
import { VoidCallback } from '../../../../../interfaces/Callback';
import { historicOptions } from './Constants';
import { useStoreTheme } from '../../../../../store/theme/StoreProviderTheme';
import { CodeArea } from '../../../../utils/code-area/CodeArea';
import { ModalButton } from '../../../../../interfaces/ModalButton';
import { calculateWindowSize } from '../../../../../services/Utils';
import { requestCollect } from '../../../../../services/api/ServiceCollection';

import './HistoricColumn.css';

interface HistoricColumnProps {
    setCursor: (cursor: string) => void;
}

interface PayloadModal {
    status: boolean;
    request: LiteRequest;
}

export function HistoricColumn({ setCursor }: HistoricColumnProps) {
    const { ask } = useAlert();

    const { userData } = useStoreSession();
    const { loadThemeWindow } = useStoreTheme();

    const { request, cleanRequest, defineFreeRequest, fetchFreeRequest, insertRequest } = useStoreRequest();
    const { historic, fetchHistoric, fetchStored, fetchCollection } = useStoreCollections();

    const [modalData, setModalData] = useState<PayloadModal>({
        request: newRequest(userData.username),
        status: false,
    });

    const defineRequest = async (item: LiteRequest) => {
        await fetchFreeRequest(item);
    }

    const openModal = (item: LiteRequest) => {
        setModalData({
            status: true,
            request: item,
        });
    };

    const closeModal = () => {
        setModalData((prevData) => ({
            ...prevData,
            status: false
        }));
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

    const actionInsert = async (item: LiteRequest) => {
        const action = await findAction(item);
        const request = action.request;

        await insertRequest(request);
        await fetchStored();
        setCursor(VIEW_STORED);
    };

    const actionDelete = async (item: LiteRequest) => {
        const content = `The request '${item.name}' will be deleted, are you sure?`;
        const buttons: ModalButton[] = [
            {
                title: "Yes",
                type: "button",
                callback: {
                    func: async () => { deleteRequest(item); }
                }
            },
            {
                title: "No",
                callback: VoidCallback
            }
        ];
        ask({ content, buttons });
    };

    const actionClone = async (item: LiteRequest) => {
        const action = await findAction(item);
        const request = action.request;

        request._id = "";
        defineFreeRequest(request);
    };

    const actionShowCurl = async (item: LiteRequest, raw?: boolean) => {
        const curl = await exportCurl(item._id, undefined, raw);
        const { width, height } = calculateWindowSize(curl, {
            minWidth: 550,
            minHeight: 200
        });
        loadThemeWindow(width, height, <CodeArea code={curl} />);
    }

    const deleteRequest = async (item: LiteRequest) => {
        try {
            await fetchDeleteHistoric(item);
            await fetchHistoric();
        } catch (error) {
            console.error("Error deleting request:", error);
        }
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
                            <button className="request-link" title={cursor.uri}
                                onClick={() => defineRequest(cursor)}>
                                <div className="request-sign">
                                    <span className={`request-sign-method ${cursor.method}`}>{cursor.method}</span>
                                    <span className="request-sign-url">{cursor.uri}</span>
                                </div>
                                <div className="request-sign-date">
                                    <span className="request-sign-timestamp" title={millisecondsToDate(cursor.timestamp)}>{millisecondsToDate(cursor.timestamp)}</span>
                                </div>
                            </button>
                            <Combo options={historicOptions(cursor, {
                                insert: actionInsert,
                                remove: actionDelete,
                                clone: actionClone,
                                collect: openModal,
                                curl: actionShowCurl
                            })} />
                        </div>
                    ))
                ) : (
                    <p className="no-data"> - No history found - </p>
                )}
            </div>
            <CollectRequestModal
                isOpen={modalData.status}
                request={modalData.request}
                onSubmit={submitModal}
                onClose={closeModal} />
        </>
    );
}

const makeKey = (item: LiteRequest): string => {
    return `${item.timestamp}-${item.method}-${item.uri}`;
}
