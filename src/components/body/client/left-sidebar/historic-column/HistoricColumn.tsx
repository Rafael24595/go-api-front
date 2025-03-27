import { newRequest, Request } from '../../../../../interfaces/request/Request';
import { deleteAction } from '../../../../../services/api/ServiceStorage';
import { millisecondsToDate } from '../../../../../services/Tools';
import { useStoreRequest } from '../../../../../store/StoreProviderRequest';
import { useStoreRequests } from '../../../../../store/StoreProviderRequests';

import './HistoricColumn.css';

export function HistoricColumn() {
    const { request, defineRequest, fetchRequest } = useStoreRequest();
    const { historic, fetchHistoric } = useStoreRequests();

    const resetRequest = () => {
        defineRequest(newRequest("anonymous"));
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
                    {historic.length > 0 ? (
                        historic.map((cursor) => (
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