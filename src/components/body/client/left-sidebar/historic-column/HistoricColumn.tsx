import { newRequest, Request } from '../../../../../interfaces/request/Request';
import { deleteAction, findAllHistoric } from '../../../../../services/api/ServiceStorage';
import { useEffect, useImperativeHandle, useState } from 'react';
import { millisecondsToDate } from '../../../../../services/Tools';

import './HistoricColumn.css';

interface HistoricColumnProps {
    ref: React.RefObject<HistoricColumnMethods | null>;
    selected: string;
    defineRequest: (request: Request) => void;
    selectRequest: (request: Request) => void;
}

export type HistoricColumnMethods = {
    fetchHistoric: () => void;
};

export function HistoricColumn({ ref, selected, defineRequest, selectRequest }: HistoricColumnProps) {
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
                    onClick={() => defineRequest(newRequest("anonymous"))}>
                    <span>Clean</span>
                </button>
                <div id="actions-container">
                    {requests.length > 0 ? (
                        requests.map((request) => (
                            <div key={ makeKey(request) } className={`request-preview ${ request._id == selected && "request-selected"}`}>
                                <a className="request-link" title={ request.uri }
                                    onClick={() => selectRequest(request)}>
                                    <div className="request-sign">
                                        <span className="request-sign-method">{ request.method }</span>
                                        <span className="request-sign-url">{ request.uri }</span>
                                    </div>
                                    <div>
                                        <span className="request-sign-timestamp">{ millisecondsToDate(request.timestamp) }</span>
                                    </div>
                                </a>
                                <button 
                                    type="button" 
                                    className="remove-button show"
                                    onClick={() => deleteHistoric(request)}
                                    ></button>
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