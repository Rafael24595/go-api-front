import { deleteAction } from '../../../../../services/api/ServiceStorage';
import { newRequest, Request } from '../../../../../interfaces/request/Request';
import { millisecondsToDate } from '../../../../../services/Tools';
import { useStoreRequest } from '../../../../../store/StoreProviderRequest';
import { useStoreRequests } from '../../../../../store/StoreProviderRequests';

import './StoredColumn.css'

export function StoredColumn() {
    const { request, defineRequest, fetchRequest } = useStoreRequest();
    const { stored, fetchStored } = useStoreRequests();

    const deleteStored = async (request: Request) => {
        try {
            await deleteAction("anonymous", request);
            await fetchStored();
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
                        onClick={() => defineRequest(newRequest(prompt("New request name:") || ""))}>
                        <span>New</span>
                    </button>
                    <div id="actions-container">
                        {stored.length > 0 ? (
                            stored.map((cursor) => (
                                <div key={ makeKey(cursor) } className={`request-preview ${ cursor._id == request._id && "request-selected"}`}>
                                    <a className="request-link" title={ cursor.uri }
                                        onClick={() => fetchRequest(cursor)}>
                                        <div className="request-sign">
                                            <span className="request-sign-method">{ cursor.method }</span>
                                            <span className="request-sign-url">{ cursor.name }</span>
                                        </div>
                                        <div>
                                            <span className="request-sign-timestamp">{ millisecondsToDate(cursor.timestamp) }</span>
                                        </div>
                                    </a>
                                    <button 
                                        type="button" 
                                        className="remove-button show"
                                        onClick={() => deleteStored(cursor)}>
                                    </button>
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