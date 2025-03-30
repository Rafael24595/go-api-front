import { ItemCollection, newCollection } from '../../../../../interfaces/collection/Collection';
import { Request } from '../../../../../interfaces/request/Request';
import { insertCollection } from '../../../../../services/api/ServiceStorage';
import { millisecondsToDate } from '../../../../../services/Tools';
import { useStoreRequests } from '../../../../../store/StoreProviderRequests';
import { Combo } from '../../../../utils/combo/Combo';
import { Details } from '../../../../utils/details/Details';

import './CollectionColumn.css';

export function CollectionColumn() {
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

    const defineCollectionRequest = (collection: ItemCollection, request: Request) => {

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
                    collection.map((collection) => (
                        <Details 
                            summary={collection.name}
                            options={(
                                <Combo options={[
                                    {
                                        icon: "💾",
                                        label: "Oh hey!",
                                        title: "Oh hey!",
                                        action: () => console.log("Oh hey!")
                                    }
                                ]}/>
                        )}>
                            {collection.nodes.map(({request}) => (
                                <div key={ makeKey(collection, request) } className={`request-preview ${ request._id == request._id && "request-selected"}`}>
                                    <a className="request-link" title={ request.uri }
                                        onClick={() => defineCollectionRequest(collection, request)}>
                                        <div className="request-sign">
                                            <span className="request-sign-method">{ request.method }</span>
                                            <span className="request-sign-url">{ request.name }</span>
                                        </div>
                                        <div>
                                            <span className="request-sign-timestamp">{ millisecondsToDate(request.timestamp) }</span>
                                        </div>
                                    </a>
                                    <Combo options={[
                                        {
                                            icon: "🗑️",
                                            label: "test",
                                            title: "test",
                                            action: () => console.log("test")
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