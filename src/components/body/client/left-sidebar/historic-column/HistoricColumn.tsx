import { useState } from 'react';
import { newRequest, Request } from '../../../../../interfaces/request/Request';
import { deleteHistoric as fetchDeleteHistoric, requestCollect } from '../../../../../services/api/ServiceStorage';
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

interface Payload {
    request: Request;
    modal: boolean;
}

export function HistoricColumn({ setCursor }: HistoricColumnProps) {
    const { userData } = useStoreSession();

    const { request, cleanRequest, defineRequest, fetchRequest, insertRequest } = useStoreRequest();
    const { historic, fetchHistoric, fetchStored, fetchCollection } = useStoreRequests();

    const [data, setData] = useState<Payload>({
        request: newRequest(userData.username),
        modal: false,
    });

    const defineHistoricRequest = async (request: Request) => {
        await fetchRequest(request);
    }

    const insertHistoric = async (request: Request) => {
        await insertRequest(request);
        await fetchStored();
        setCursor(VIEW_STORED);
    };

    const deleteHistoric = async (request: Request) => {
        try {
            await fetchDeleteHistoric(request);
            await fetchHistoric();
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    const cloneHistoric = (request: Request) => {
        const newRequest = {...request};
        newRequest._id = "";
        defineRequest(newRequest);
    };
    
    const makeKey = (request: Request): string => {
        return `${request.timestamp}-${request.method}-${request.uri}`;
    }

    const openModal = (request: Request) => {
        setData({request: request, modal: true});
    };

    const closeModal = () => {
        setData({...data, modal: false});
    };

    const submitModal = async (collectionId: string, collectionName: string, request: Request, requestName: string) => {
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
            <button 
                type="button"
                className="column-option option-button border-bottom"
                onClick={cleanRequest}>
                <span>Clean</span>
            </button>
            <div id="actions-container">
                {historic.length > 0 ? (
                    historic.map((cursor) => (
                        <div key={ makeKey(cursor) } className={`request-preview ${ cursor._id == request._id && "request-selected"}`}>
                            <a className="request-link" title={ cursor.uri }
                                onClick={() => defineHistoricRequest(cursor)}>
                                <div className="request-sign">
                                    <span className="request-sign-method">{ cursor.method }</span>
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
                isOpen={data.modal} 
                request={data.request} 
                onSubmit={submitModal}
                onClose={closeModal}/>
        </>
    );
}