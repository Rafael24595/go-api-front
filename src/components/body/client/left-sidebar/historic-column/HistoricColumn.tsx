import { useState } from 'react';
import { newRequest, Request } from '../../../../../interfaces/request/Request';
import { deleteAction } from '../../../../../services/api/ServiceStorage';
import { millisecondsToDate } from '../../../../../services/Tools';
import { useStoreRequest } from '../../../../../store/StoreProviderRequest';
import { useStoreRequests } from '../../../../../store/StoreProviderRequests';
import { CollectionModal } from '../../../../collection/CollectionModal';
import { Combo } from '../../../../utils/combo/Combo';
import { VIEW_STORED } from '../LeftSidebar';
import { useStoreContext } from '../../../../../store/StoreProviderContext';

import './HistoricColumn.css';

interface HistoricColumnProps {
    setCursor: (cursor: string) => void;
}

interface Payload {
    request: Request;
    modal: boolean;
}

export function HistoricColumn({ setCursor }: HistoricColumnProps) {
    const { switchContext } = useStoreContext();
    const { request, defineRequest, fetchRequest, insertRequest } = useStoreRequest();
    const { historic, fetchHistoric, fetchStored } = useStoreRequests();

    const [data, setData] = useState<Payload>({
        request: newRequest("anonymous"),
        modal: false,
    });

    const resetRequest = () => {
        defineRequest(newRequest("anonymous"));
    };

    const defineHistoricRequest = async (request: Request) => {
        await fetchRequest(request);
        await switchContext();
    }

    const insertHistoric = async (request: Request) => {
        await insertRequest(request);
        await fetchStored();
        setCursor(VIEW_STORED);
    };

    const deleteHistoric = async (request: Request) => {
        try {
            await deleteAction("anonymous", request);
            await fetchHistoric();
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    const cloneHistoric = (request: Request) => {
        const newRequest = {...request};
        newRequest._id = undefined;
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
                                <div>
                                    <span className="request-sign-timestamp">{ millisecondsToDate(cursor.timestamp) }</span>
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
                onClose={closeModal}/>
        </>
    );
}