import { useState } from 'react';
import { LiteItemCollection, LiteItemNodeRequest } from '../../../../../interfaces/client/collection/Collection';
import { LiteRequest } from '../../../../../interfaces/client/request/Request';
import { findAction, exportCurl, updateAction } from '../../../../../services/api/ServiceStorage';
import { millisecondsToDate } from '../../../../../services/Tools';
import { useStoreRequest } from '../../../../../store/client/StoreProviderRequest';
import { useStoreCollections } from '../../../../../store/client/StoreProviderCollections';
import { Combo } from '../../../../utils/combo/Combo';
import { useAlert } from '../../../../utils/alert/Alert';
import { calculateWindowSize } from '../../../../../services/Utils';
import { RequestNode } from '../../../../../services/api/Requests';
import { PositionWrapper, VerticalDragDrop } from '../../../../utils/drag/VerticalDragDrop';
import { Optional } from '../../../../../types/Optional';
import { VoidCallback } from '../../../../../interfaces/Callback';
import { useStoreTheme } from '../../../../../store/theme/StoreProviderTheme';
import { CodeArea } from '../../../../utils/code-area/CodeArea';
import { requestOptions } from './Constants';
import { ModalButton } from '../../../../../interfaces/ModalButton';
import { deleteFromCollection, takeFromCollection } from '../../../../../services/api/ServiceCollection';

import './CollectionColumn.css';

interface PayloadDrag {
    request: Optional<LiteItemNodeRequest>;
}

interface Payload {
    collection: LiteItemCollection;
    showDuplicateModal(itemCollection: LiteItemCollection, itemRequest: LiteRequest): void;
    showMoveModal: (collection: LiteItemCollection, request: LiteRequest) => void;
}

export function CollectionRequests({ collection, showDuplicateModal, showMoveModal }: Payload) {
    const { ask } = useAlert();

    const { loadThemeWindow } = useStoreTheme();

    const { request, cleanRequest, discardRequest, defineRequest, fetchGroupRequest, isCached } = useStoreRequest();
    const { fetchStored, fetchCollection, updateCollectionRequestsOrder } = useStoreCollections();

    const [dragData, setDragData] = useState<PayloadDrag>({
        request: undefined,
    });

    const defineCollectionRequest = async (itemRequest: LiteRequest) => {
        fetchGroupRequest(collection._id, collection.context, itemRequest);
    }

    const isRequestSelected = (item: LiteItemNodeRequest) => {
        return item.request._id == request._id;
    }

    const isRequestDrag = (item: LiteItemNodeRequest) => {
        if (!dragData.request) {
            return false
        }
        return item.request._id == dragData.request.request._id;
    }

    const onRequestDrag = async (item: PositionWrapper<LiteItemNodeRequest>) => {
        setDragData((prevData) => ({
            ...prevData,
            request: item.item,
        }));
    };

    const onRequestDrop = async () => {
        setDragData((prevData) => ({
            ...prevData,
            request: undefined,
        }));
    };

    const onRequestOrderChange = async (items: PositionWrapper<LiteItemNodeRequest>[]) => {
        const ordered: RequestNode[] = items.map(e => ({
            order: e.index,
            item: e.item.request._id
        }));
        await updateCollectionRequestsOrder(collection, ordered);
        await fetchCollection();
    };

    const removeFrom = async (itemRequest: LiteRequest) => {
        const content = `The request '${itemRequest.name}' from collection '${collection.name}' will be deleted, are you sure?`;
        const buttons: ModalButton[] = [
            {
                title: "Yes",
                type: "submit",
                callback: {
                    func: async () => { deleteRequest(itemRequest) }
                }
            },
            {
                title: "No",
                callback: VoidCallback
            }
        ];

        ask({ content, buttons });
    }

    const deleteRequest = async (item: LiteRequest) => {
        await deleteFromCollection(collection, item);
        await fetchCollection();
        if (item._id == request._id) {
            return cleanRequest();
        }
        discardRequest(item);
    }

    const renameFromCollection = async (item: LiteRequest) => {
        const action = await findAction(item);
        const request = action.request;

        const name = prompt("Insert a name: ", request.name);
        if (name == null && name != request.name) {
            return;
        }
        request.name = name;
        await updateAction(request);
        await fetchCollection();
    };

    const cloneFromCollection = async (item: LiteRequest) => {
        const action = await findAction(item);
        const request = action.request;

        request._id = "";
        request.status = 'draft';
        defineRequest(request);
    };

    const takeFrom = async (itemRequest: LiteRequest) => {
        await takeFromCollection(collection, itemRequest);
        await fetchCollection();
        await fetchStored();
        if (itemRequest._id == request._id) {
            return cleanRequest();
        }
        discardRequest(itemRequest);
    }

    const showCurl = async (itemRequest: LiteRequest, raw?: boolean) => {
        const curl = await exportCurl(itemRequest._id, collection.context, raw);
        const { width, height } = calculateWindowSize(curl, {
            minWidth: 550,
            minHeight: 200
        });
        loadThemeWindow(width, height, <CodeArea code={curl} />);
    }

    const makeKey = (itemRequest: LiteRequest): string => {
        return `${collection.name}-${itemRequest.timestamp}-${itemRequest._id}-${itemRequest.method}-${itemRequest.uri}`;
    }

    return (
        <>
            <VerticalDragDrop
                items={collection.nodes}
                parameters={collection}
                itemId={(node) => makeKey(node.request)}
                onItemDrag={onRequestDrag}
                onItemDrop={onRequestDrop}
                onItemsChange={onRequestOrderChange}
                renderItem={(node) => (
                    <div key={makeKey(node.request)} className={`request-preview ${isRequestSelected(node) && "request-selected"} ${isRequestDrag(node) && "request-float"}`}>
                        <button className="request-link" title={node.request.uri}
                            onClick={() => defineCollectionRequest(node.request)}>
                            <div className="request-sign">
                                {isCached(node.request) && (
                                    <span className="button-modified-status small visible"></span>
                                )}
                                <span className={`request-sign-method ${node.request.method}`}>{node.request.method}</span>
                                <span className="request-sign-url">{node.request.name}</span>
                            </div>
                            <div className="request-sign-date">
                                <span className="request-sign-timestamp" title={millisecondsToDate(node.request.timestamp)}>{millisecondsToDate(node.request.timestamp)}</span>
                            </div>
                        </button>
                        <Combo options={requestOptions(collection, node, {
                            removeFrom, renameFromCollection, cloneFromCollection,
                            showDuplicateModal, showMoveModal, takeFrom,
                            isCached, discardRequest, showCurl,
                        })} />
                    </div>
                )}
                emptyTemplate={(
                    <p className="no-data"> - No requests found - </p>
                )}
            />

        </>
    )
}
