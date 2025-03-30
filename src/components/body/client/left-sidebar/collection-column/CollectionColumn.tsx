import { ItemCollection, newCollection } from '../../../../../interfaces/collection/Collection';
import { fromContext } from '../../../../../interfaces/context/Context';
import { Request } from '../../../../../interfaces/request/Request';
import { insertCollection } from '../../../../../services/api/ServiceStorage';
import { millisecondsToDate } from '../../../../../services/Tools';
import { useStoreContext } from '../../../../../store/StoreProviderContext';
import { useStoreRequest } from '../../../../../store/StoreProviderRequest';
import { useStoreRequests } from '../../../../../store/StoreProviderRequests';
import { Combo } from '../../../../utils/combo/Combo';
import { Details } from '../../../../utils/details/Details';

import './CollectionColumn.css';

const CURSOR_KEY = "CollectionColumnDetailsCursor";

export function CollectionColumn() {
    const { switchContext } = useStoreContext();
    const { request, defineRequest } = useStoreRequest();
    const { collection, fetchCollection } = useStoreRequests();

    const insertNewCollection = async () => {
        const name = prompt("New collection name:");
        if(name == null) {
            return;
        }
        
        const collection = newCollection("anonymous");
        collection.name = name;

        await insertCollection("anonymous", collection);
        await fetchCollection();
    }

    const defineCollectionRequest = async (collection: ItemCollection, request: Request) => {
        const context = fromContext(collection.context);
        defineRequest(request);
        await switchContext(context);
    }

    const makeKey = (collection: ItemCollection, request: Request): string => {
        return `${collection.name}-${request.timestamp}-${request.method}-${request.uri}`;
    }

    return (
        <>
            <button 
                type="button"
                className="column-option option-button border-bottom"
                onClick={() => insertNewCollection()}>
                <span>New</span>
            </button>
            <div id="actions-container">
                {collection.length > 0 ? (
                    collection.map((cursorCollection) => (
                        <Details 
                            key={cursorCollection._id}
                            identity={cursorKey(cursorCollection)}
                            summary={cursorCollection.name}
                            options={(
                                <Combo options={[
                                    {
                                        icon: "💾",
                                        label: "_Test",
                                        title: "_Test",
                                        action: () => console.log("_test")
                                    }
                                ]}/>)}
                            subsummary={(
                                <span className="request-sign-timestamp">{ millisecondsToDate(cursorCollection.timestamp) }</span>
                            )}
                            >
                            {cursorCollection.nodes.map((node) => (
                                <div key={ makeKey(cursorCollection, node.request) } className={`request-preview ${ node.request._id == request._id && "request-selected"}`}>
                                    <a className="request-link" title={ node.request.uri }
                                        onClick={() => defineCollectionRequest(cursorCollection, node.request)}>
                                        <div className="request-sign">
                                            <span className="request-sign-method">{ node.request.method }</span>
                                            <span className="request-sign-url">{ node.request.name }</span>
                                        </div>
                                        <div>
                                            <span className="request-sign-timestamp">{ millisecondsToDate(node.request.timestamp) }</span>
                                        </div>
                                    </a>
                                    <Combo options={[
                                        {
                                            icon: "🗑️",
                                            label: "_Test",
                                            title: "_Test",
                                            action: () => console.log("_test")
                                        }
                                    ]}/>
                                </div>
                            ))}
                        </Details>
                    ))
                ) : (
                    <p className="no-data"> - No Collections found - </p>
                )}
            </div>
        </>
    )
}

const cursorKey = (collection: ItemCollection) => {
    return `${CURSOR_KEY}-${collection._id}`;
}
