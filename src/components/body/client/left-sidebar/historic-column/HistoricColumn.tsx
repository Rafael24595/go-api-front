import { useState } from 'react';
import { newRequest, Request } from '../../../../../interfaces/request/Request';
import { deleteAction, pushToCollection } from '../../../../../services/api/ServiceStorage';
import { millisecondsToDate } from '../../../../../services/Tools';
import { useStoreRequest } from '../../../../../store/StoreProviderRequest';
import { useStoreRequests } from '../../../../../store/StoreProviderRequests';
import { CollectionModal } from '../../../../collection/CollectionModal';
import { Combo } from '../../../../utils/combo/Combo';
import { VIEW_STORED } from '../LeftSidebar';
import { useStoreContext } from '../../../../../store/StoreProviderContext';
import { RequestPushToCollection } from '../../../../../services/api/RequestPushToCollection';

import './HistoricColumn.css';

interface HistoricColumnProps {
    setCursor: (cursor: string) => void;
}

interface Payload {
    request: Request;
    modal: boolean;
}

export function HistoricColumn({ setCursor }: HistoricColumnProps) {
    const { fetchContext } = useStoreContext();
    const { request, defineRequest, fetchRequest, insertRequest } = useStoreRequest();
    const { historic, fetchHistoric, fetchStored, fetchCollection } = useStoreRequests();

    const [data, setData] = useState<Payload>({
        request: newRequest("anonymous"),
        modal: false,
    });

    const resetRequest = () => {
        defineRequest(newRequest("anonymous"));
    };

    const defineHistoricRequest = async (request: Request) => {
        await fetchRequest(request);
        await fetchContext();
    }

    const insertHistoric = async (request: Request) => {
        await insertRequest(request);
        await fetchStored();
        setCursor(VIEW_STORED);
    };

    const deleteHistoric = async (request: Request) => {
        try {
            await deleteAction(request);
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
        const payload: RequestPushToCollection = {
            source_id: "",
            target_id: collectionId,
            target_name: collectionName,
            request: request,
            request_name: requestName,
            move: 'clone',
        };
        await pushToCollection(payload);
        await fetchCollection();
    }

    return (
        <>
            <button 
                type="button"
                className="column-option option-button border-bottom"
                onClick={resetRequest}>
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