import { newRequest, Request } from '../../../../../interfaces/request/Request';
import { deleteAction, findAllHistoric } from '../../../../../services/api/ServiceStorage';
import { useEffect, useImperativeHandle, useState } from 'react';
import { millisecondsToDate } from '../../../../../services/Tools';

import './HistoricColumn.css';
import { useStoreRequest } from '../../../../../store/StoreProviderRequest';

interface HistoricColumnProps {
    ref: React.RefObject<HistoricColumnMethods | null>;
}

export type HistoricColumnMethods = {
    fetchHistoric: () => void;
};

export function HistoricColumn({ ref }: HistoricColumnProps) {
    const { request, defineRequest, fetchRequest } = useStoreRequest();
    const [requests, setHistoric] = useState<Request[]>([]);
    
    useImperativeHandle(ref, () => ({
        fetchHistoric
    }));

    useEffect(() => {
        fetchHistoric();

        const interval = setInterval(() => {
            fetchHistoric();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const resetRequest = () => {
        defineRequest(newRequest("anonymous"));
    };

    const fetchHistoric = async () => {
        try {
            const data = (await findAllHistoric("anonymous"))
                .sort((a, b) => b.timestamp - a.timestamp);
            setHistoric(data);
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    const deleteHistoric = async (request: Request) => {
        try {
            await deleteAction("anonymous", request);
            await fetchHistoric();
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };
    
    const makeKey = (request: Request): string => {
        return `${request.timestamp}-${request.method}-${request.uri}`;
    }

    return (
        <>
            <div id="column-container">
                <button 
                    type="button"
                    className="column-option option-button border-bottom"
                    onClick={resetRequest}>
                    <span>Clean</span>
                </button>
                <div id="actions-container">
                    {requests.length > 0 ? (
                        requests.map((cursor) => (
                            <div key={ makeKey(cursor) } className={`request-preview ${ cursor._id == request._id && "request-selected"}`}>
                                <a className="request-link" title={ cursor.uri }
                                    onClick={() => fetchRequest(cursor)}>
                                    <div className="request-sign">
                                        <span className="request-sign-method">{ cursor.method }</span>
                                        <span className="request-sign-url">{ cursor.uri }</span>
                                    </div>
                                    <div>
                                        <span className="request-sign-timestamp">{ millisecondsToDate(cursor.timestamp) }</span>
                                    </div>
                                </a>
                                <button 
                                    type="button" 
                                    className="remove-button show"
                                    onClick={() => deleteHistoric(cursor)}>
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="no-data"> - No history found - </p>
                    )}
                </div>
            </div>
        </>
    );
}