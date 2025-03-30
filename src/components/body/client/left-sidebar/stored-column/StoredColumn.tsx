import { deleteAction } from '../../../../../services/api/ServiceStorage';
import { newRequest, Request } from '../../../../../interfaces/request/Request';
import { millisecondsToDate } from '../../../../../services/Tools';
import { useStoreRequest } from '../../../../../store/StoreProviderRequest';
import { useStoreRequests } from '../../../../../store/StoreProviderRequests';
import { Combo } from '../../../../utils/combo/Combo';
import { useStoreContext } from '../../../../../store/StoreProviderContext';

import './StoredColumn.css';

export function StoredColumn() {
    const { switchContext } = useStoreContext();
    const { request, defineRequest, fetchRequest, insertRequest } = useStoreRequest();
    const { stored, fetchStored } = useStoreRequests();

    const defineHistoricRequest = async (request: Request) => {
        await fetchRequest(request);
        await switchContext();
    }

    const insertNewRequest = async () => {
        const name = prompt("New request name:");
        if(name == null) {
            return;
        }
        
        const request = newRequest("anonymous");
        request.name = name;

        defineRequest(request);
        await fetchStored();
    }

    const insertStored = async (request: Request) => {
        const newRequest = {...request};
        newRequest._id = undefined;
        newRequest.status = 'draft';
        await insertRequest(newRequest);
        await fetchStored();
    };

    const deleteStored = async (request: Request) => {
        try {
            await deleteAction("anonymous", request);
            await fetchStored();
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    const cloneStored = (request: Request) => {
        const newRequest = {...request};
        newRequest._id = undefined;
        newRequest.status = 'draft';
        defineRequest(newRequest);
    };

    const makeKey = (request: Request): string => {
        return `${request.timestamp}-${request.method}-${request.uri}`;
    }

    return (
            <>
                <button 
                    type="button"
                    className="column-option option-button border-bottom"
                    onClick={() => insertNewRequest()}>
                    <span>New</span>
                </button>
                <div id="actions-container">
                    {stored.length > 0 ? (
                        stored.map((cursor) => (
                            <div key={ makeKey(cursor) } className={`request-preview ${ cursor._id == request._id && "request-selected"}`}>
                                <a className="request-link" title={ cursor.uri }
                                    onClick={() => defineHistoricRequest(cursor)}>
                                    <div className="request-sign">
                                        <span className="request-sign-method">{ cursor.method }</span>
                                        <span className="request-sign-url">{ cursor.name }</span>
                                    </div>
                                    <div>
                                        <span className="request-sign-timestamp">{ millisecondsToDate(cursor.timestamp) }</span>
                                    </div>
                                </a>
                                <Combo options={[
                                    {
                                        icon: "🗑️",
                                        label: "Delete",
                                        title: "Delete request",
                                        action: () => deleteStored(cursor)
                                    },
                                    {
                                        icon: "🐏",
                                        label: "Duplicate",
                                        title: "Duplicate request",
                                        action: () => insertStored(cursor)
                                    },
                                    {
                                        icon: "🐑",
                                        label: "Clone",
                                        title: "Clone request",
                                        action: () => cloneStored(cursor)
                                    }
                                ]}/>
                            </div>
                        ))
                    ) : (
                        <p className="no-data"> - No requests found - </p>
                    )}
                </div>
            </>
        );
}