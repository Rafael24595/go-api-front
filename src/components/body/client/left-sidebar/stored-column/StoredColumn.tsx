import { useEffect, useImperativeHandle, useState } from 'react';
import { findAllAction } from '../../../../../services/api/ServiceStorage';
import { newRequest, Request } from '../../../../../interfaces/request/Request';
import { millisecondsToDate } from '../../../../../services/Tools';

import './StoredColumn.css'

interface StoredColumnProps {
    ref: React.RefObject<StoredColumnMethods | null>;
    selected: string;
    defineRequest: (request: Request) => void;
    selectRequest: (request: Request) => void;
}

export type StoredColumnMethods = {
    fetchStored: () => void;
};

export function StoredColumn({ ref, selected, defineRequest, selectRequest }: StoredColumnProps) {
    const [requests, setStored] = useState<Request[]>([]);

     useImperativeHandle(ref, () => ({
        fetchStored
    }));
    
    const fetchStored = async () => {
        try {
            const data = (await findAllAction("anonymous"))
                .sort((a, b) => b.timestamp - a.timestamp);
                setStored(data);
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    useEffect(() => {
        fetchStored();

        const interval = setInterval(() => {
            fetchStored();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const makeKey = (request: Request): string => {
        return `${request.timestamp}-${request.method}-${request.uri}`;
    }

    return (
            <>
                <div id="column-container">
                    <button 
                        type="button"
                        className="column-option option-button border-bottom"
                        onClick={() => defineRequest(newRequest(prompt("New request name:") || ""))}>
                        <span>New</span>
                    </button>
                    <div id="actions-container">
                        {requests.length > 0 ? (
                            requests.map((request) => (
                                <div key={ makeKey(request) } className={`request-preview ${ request._id == selected && "request-selected"}`}>
                                    <a className="request-link" title={ request.uri }
                                        onClick={() => selectRequest(request)}>
                                        <div className="request-sign">
                                            <span className="request-sign-method">{ request.method }</span>
                                            <span className="request-sign-url">{ request.name }</span>
                                        </div>
                                        <div>
                                            <span className="request-sign-timestamp">{ millisecondsToDate(request.timestamp) }</span>
                                        </div>
                                    </a>
                                    <button 
                                        type="button"
                                        >*</button>
                                </div>
                            ))
                        ) : (
                            <p className="no-data"> - No requests found - </p>
                        )}
                    </div>
                </div>
            </>
        );
}