import { useState } from 'react';
import { ItemCollection, newCollection } from '../../../../../interfaces/collection/Collection';
import { fromContext } from '../../../../../interfaces/context/Context';
import { newRequest, Request } from '../../../../../interfaces/request/Request';
import { cloneCollection, deleteCollection, deleteFromCollection, insertCollection, pushToCollection, takeFromCollection } from '../../../../../services/api/ServiceStorage';
import { millisecondsToDate } from '../../../../../services/Tools';
import { useStoreContext } from '../../../../../store/StoreProviderContext';
import { useStoreRequest } from '../../../../../store/StoreProviderRequest';
import { useStoreRequests } from '../../../../../store/StoreProviderRequests';
import { CollectionModal } from '../../../../collection/CollectionModal';
import { Combo } from '../../../../utils/combo/Combo';
import { Details } from '../../../../utils/details/Details';
import { RequestPushToCollection } from '../../../../../services/api/RequestPushToCollection';

import './CollectionColumn.css';

const CURSOR_KEY = "CollectionColumnDetailsCursor";

interface Payload {
    request: Request;
    collection?: ItemCollection;
    move: boolean;
    modal: boolean;
}

export function CollectionColumn() {
    const { switchContext } = useStoreContext();
    const { request, defineRequest } = useStoreRequest();
    const { collection, fetchStored, fetchCollection } = useStoreRequests();

    const [data, setData] = useState<Payload>({
        request: newRequest("anonymous"),
        collection: undefined,
        move: false,
        modal: false,
    });

    const insert = async () => {
        const name = prompt("New collection name:");
        if(name == null) {
            return;
        }
        
        const collection = newCollection("anonymous");
        collection.name = name;

        await insertCollection(collection);
        await fetchCollection();
    }

    const remove = async (collection: ItemCollection) => {
        await deleteCollection(collection);
        await fetchCollection();
    }

    const clone = async (collection: ItemCollection) => {
        const name = prompt("Insert a name: ");
        if(name == null) {
            return;
        }            
        await cloneCollection(collection, name);
        await fetchCollection();
    }

    const removeFrom = async (collection: ItemCollection, request: Request) => {
        await deleteFromCollection(collection, request);
        await fetchCollection();
    }

    const takeFrom = async (collection: ItemCollection, request: Request) => {
        await takeFromCollection(collection, request);
        await fetchCollection();
        await fetchStored();
    }

    const defineCollectionRequest = async (collection: ItemCollection, request: Request) => {
        const context = fromContext(collection.context);
        defineRequest(request);
        await switchContext(context);
    }

    const openCloneModal = (request: Request) => {
        setData({collection: undefined, request: request, move: false, modal: true});
    };

    const openMoveModal = (request: Request, collection: ItemCollection) => {
        setData({collection: collection, request: request, move: true, modal: true});
    };

    const closeModal = () => {
        setData({...data, modal: false});
    };

    const submitModal = async (collectionId: string, collectionName: string, request: Request, requestName: string) => {
        const payload: RequestPushToCollection = {
            source_id: data.collection ? data.collection?._id : "",
            target_id: collectionId,
            target_name: collectionName,
            request: request,
            request_name: requestName,
            move: data.move ? "move" : "clone",
        };
        await pushToCollection(payload);
    }

    const makeKey = (collection: ItemCollection, request: Request): string => {
        return `${collection.name}-${request.timestamp}-${request.method}-${request.uri}`;
    }

    return (
        <>
            <button 
                type="button"
                className="column-option option-button border-bottom"
                onClick={() => insert()}>
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
                                        icon: "🗑️",
                                        label: "Delete",
                                        title: "Delete collection",
                                        action: () => remove(cursorCollection)
                                    },
                                    {
                                        icon: "🐑",
                                        label: "Clone",
                                        title: "Clone request",
                                        action: () => clone(cursorCollection)
                                    },
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
                                            label: "Delete",
                                            title: "Delete from collection",
                                            action: () => removeFrom(cursorCollection, node.request)
                                        },
                                        {
                                            icon: "🐑",
                                            label: "Clone",
                                            title: "Clone to collection",
                                            action: () => openCloneModal(node.request)
                                        },
                                        {
                                            icon: "📦",
                                            label: "Move",
                                            title: "Move to collection",
                                            action: () => openMoveModal(node.request, cursorCollection)
                                        },
                                        {
                                            icon: "🧷",
                                            label: "Take",
                                            title: "Take from collection",
                                            action: () => takeFrom(cursorCollection, node.request)
                                        }
                                    ]}/>
                                </div>
                            ))}
                            <CollectionModal 
                                isOpen={data.modal} 
                                request={data.request} 
                                onSubmit={submitModal}
                                onClose={closeModal}/>
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
