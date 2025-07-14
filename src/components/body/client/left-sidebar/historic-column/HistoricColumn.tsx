import { useState } from 'react';
import { LiteRequest, newRequest } from '../../../../../interfaces/request/Request';
import { deleteHistoric as fetchDeleteHistoric, findAction, requestCollect } from '../../../../../services/api/ServiceStorage';
import { millisecondsToDate } from '../../../../../services/Tools';
import { useStoreRequest } from '../../../../../store/StoreProviderRequest';
import { useStoreRequests } from '../../../../../store/StoreProviderRequests';
import { CollectionModal } from '../../../../collection/CollectionModal';
import { Combo } from '../../../../utils/combo/Combo';
import { VIEW_STORED } from '../LeftSidebar';
import { useStoreSession } from '../../../../../store/StoreProviderSession';
import { RequestRequestCollect } from '../../../../../services/api/Requests';

import './HistoricColumn.css';

interface HistoricColumnProps {
    setCursor: (cursor: string) => void;
}

interface PayloadModal {
    request: LiteRequest;
    modal: boolean;
}

export function HistoricColumn({ setCursor }: HistoricColumnProps) {
    const { userData } = useStoreSession();

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
        try {
            await fetchDeleteHistoric(item);
            await fetchHistoric();
        } catch (error) {
            console.error("Error fetching history:", error);
        }
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
        setModalData({request: item, modal: true});
    };

    const closeModal = () => {
        setModalData({...modalData, modal: false});
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

    return (
        <>
            <div className="column-option options border-bottom">
                <div id="left-options">
                    <Combo options={[]}/>
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
                    ]}/>
                </div>
            </div>
            <div id="actions-container">
                {historic.length > 0 ? (
                    historic.map((cursor) => (
                        <div key={ makeKey(cursor) } className={`request-preview ${ cursor._id == request._id && "request-selected"}`}>
                            <a className="request-link" title={ cursor.uri }
                                onClick={() => defineHistoricRequest(cursor)}>
                                <div className="request-sign">
                                    <span className={`request-sign-method ${cursor.method}`}>{ cursor.method }</span>
                                    <span className="request-sign-url">{ cursor.uri }</span>
                                </div>
                                <div className="request-sign-date">
                                    <span className="request-sign-timestamp" title={millisecondsToDate(cursor.timestamp)}>{ millisecondsToDate(cursor.timestamp) }</span>
                                </div>
                            </a>
                            <Combo options={[
                                {
                                    icon: "💾",
                                    label: "Save",
                                    title: "Save request",
                                    action: () => insertHistoric(cursor)
                                },
                                {
                                    icon: "🗑️",
                                    label: "Delete",
                                    title: "Delete request",
                                    action: () => deleteHistoric(cursor)
                                },
                                {
                                    icon: "🐑",
                                    label: "Clone",
                                    title: "Clone request",
                                    action: () => cloneHistoric(cursor)
                                },
                                {
                                    icon: "📚",
                                    label: "Collect",
                                    title: "Copy to collection",
                                    action: () => openModal(cursor)
                                }
                            ]}/>
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
                onClose={closeModal}/>
        </>
    );
}