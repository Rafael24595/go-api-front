import './HistoricColumn.css'
import { Request } from '../../../../../interfaces/request/Request';
import { findHistoric } from '../../../../../services/api/ServiceStorage';
import { useEffect, useState } from 'react';
import { millisecondsToDate } from '../../../../../services/Tools';

export function HistoricColumn() {
    const [requests, setHistoric] = useState<Request[]>([]);

    const fetchHistoric = async () => {
        try {
            const data = await findHistoric("anonymous");
            setHistoric(data);
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    useEffect(() => {
        fetchHistoric();

        const interval = setInterval(() => {
            fetchHistoric();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const makeKey = (request: Request): string => {
        return `${request.timestamp}-${request.method}-${request.uri}`;
    }

    return (
        <>
            <div id="column-container">
                <button className="column-option option-button border-bottom">
                    <span>Clean</span>
                </button>
                <div id="actions-container">
                    {requests.length > 0 ? (
                        requests.map((request) => (
                            <div key={ makeKey(request) } className="request-preview">
                                <a className="request-link" title={ request.uri }>
                                    <div className="request-sign">
                                        <span className="request-sign-method">{ request.method }</span>
                                        <span className="request-sign-url">{ request.uri }</span>
                                    </div>
                                    <div>
                                        <span className="request-sign-timestamp">{ millisecondsToDate(request.timestamp) }</span>
                                    </div>
                                </a>
                                <button type="button" className="remove-button show"></button>
                            </div>
                        ))
                    ) : (
                        <p>No history available</p>
                    )}
                </div>
            </div>
        </>
    );
}