import { useState } from 'react';
import { ItemCollection, LiteItemCollection, LiteItemNodeRequest, newCollection, toCollection } from '../../../../../interfaces/collection/Collection';
import { ItemRequest, LiteRequest, newRequest } from '../../../../../interfaces/request/Request';
import { cloneCollection, deleteCollection, deleteFromCollection, findAction, findCollection, formatCurl, imporOpenApi, importCollections, importToCollection, insertCollection, requestCollect, takeFromCollection, updateAction } from '../../../../../services/api/ServiceStorage';
import { millisecondsToDate } from '../../../../../services/Tools';
import { useStoreRequest } from '../../../../../store/StoreProviderRequest';
import { useStoreRequests } from '../../../../../store/StoreProviderRequests';
import { CollectionModal } from '../../../../collection/CollectionModal';
import { Combo } from '../../../../utils/combo/Combo';
import { Details } from '../../../../utils/details/Details';
import { ImportOpenApiModal } from '../../../../collection/ImportOpenApiModal';
import { useAlert } from '../../../../utils/alert/Alert';
import { EAlertCategory } from '../../../../../interfaces/AlertData';
import { calculateWindowSize, downloadFile } from '../../../../../services/Utils';
import { ImportCollectionModal } from '../../../../collection/ImportCollectionModal';
import { ImportRequestModal } from '../../../../collection/ImportRequestModal';
import { useStoreStatus } from '../../../../../store/StoreProviderStatus';
import { useStoreSession } from '../../../../../store/StoreProviderSession';
import { useStoreContext } from '../../../../../store/StoreProviderContext';
import { RequestNode, RequestRequestCollect } from '../../../../../services/api/Requests';
import { FilterResult, PositionWrapper, VerticalDragDrop } from '../../../../utils/drag/VerticalDragDrop';
import { Optional } from '../../../../../types/Optional';
import { VoidCallback } from '../../../../../interfaces/Callback';
import { useStoreTheme } from '../../../../../store/theme/StoreProviderTheme';
import { CodeArea } from '../../../../utils/code-area/CodeArea';
import { collectionOptions, collectionGroupOptions, requestOptions, searchOptions } from './Constants';
import { ModalButton } from '../../../../../interfaces/ModalButton';

import './CollectionColumn.css';

const FILTER_TARGET_KEY = "CollectionColumnDetailsFilterTarget";
const FILTER_VALUE_KEY = "CollectionColumnDetailsFilterValue";
const CURSOR_KEY = "CollectionColumnDetailsCursor";

const DEFAULT_CURSOR = "name";

interface PayloadFilter {
    target: string;
    value: string;
}

interface PayloadDrag {
    request: Optional<LiteItemNodeRequest>;
    collection: Optional<LiteItemCollection>;
}

interface PayloadModal {
    move: boolean;
    request: LiteRequest;
    collection?: LiteItemCollection;
    openImportCollection: boolean;
    openImportOpenApi: boolean;
    openImportRequest: boolean;
    openCollect: boolean;
}

export function CollectionColumn() {
    const { userData } = useStoreSession();
    const { find, store } = useStoreStatus();

    const { loadThemeWindow } = useStoreTheme();

    const context = useStoreContext();
    const { parent, request, cleanRequest, discardRequest, defineFreeRequest, fetchGroupRequest, isParentCached, isCached } = useStoreRequest();
    const { collection, fetchStored, fetchCollection, fetchCollectionItem, updateCollectionsOrder, updateCollectionRequestsOrder } = useStoreRequests();

    const { push, ask } = useAlert();

    const [filterData, setFilterData] = useState<PayloadFilter>({
        target: find(FILTER_TARGET_KEY, {
            def: DEFAULT_CURSOR
        }),
        value: find(FILTER_VALUE_KEY, {
            def: ""
        })
    });

    const [dragData, setDragData] = useState<PayloadDrag>({
        request: undefined,
        collection: undefined,
    });

    const [modalData, setModalData] = useState<PayloadModal>({
        move: false,
        request: newRequest(userData.username),
        collection: undefined,
        openImportCollection: false,
        openImportOpenApi: false,
        openImportRequest: false,
        openCollect: false,
    });

    const insert = async () => {
        const name = prompt("New collection name:");
        if (name == null) {
            return;
        }

        const collection = newCollection(userData.username);
        collection.name = name;

        await insertCollection(collection);
        await fetchCollection();
    }

    const remove = async (item: LiteItemCollection) => {
        const content = `The collection '${item.name}' will be deleted, are you sure?`;
        const buttons: ModalButton[] = [
            {
                title: "Yes",
                type: "submit",
                callback: {
                    func: async () => {
                        await deleteCollection(item);
                        if (parent == item._id) {
                            cleanRequest();
                        }
                        await fetchCollection();
                        discardCollection(item);
                    }
                }
            },
            {
                title: "No",
                callback: VoidCallback
            }
        ];
        ask({ content, buttons });
    };

    const discardCollection = async (item: LiteItemCollection) => {
        item.nodes.forEach(n => discardRequest(n.request));
    }

    const renameCollection = async (item: LiteItemCollection) => {
        const name = prompt("Insert a name: ", item.name);
        if (name == null && name != item.name) {
            return;
        }

        item.name = name;

        await insertCollection(toCollection(item));
        await fetchCollection();
    };

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

    const clone = async (item: LiteItemCollection) => {
        const collection = await findCollection(item);

        const name = prompt("Insert a name: ", `${collection.name}-copy`);
        if (name == null) {
            return;
        }
        await cloneCollection(collection, name);
        await fetchCollection();
    }

    const newCollectionRequest = async (item: LiteItemCollection) => {
        const name = prompt("Insert a name: ");
        if (name == null) {
            return;
        }

        const payload: RequestRequestCollect = {
            source_id: "",
            target_id: item._id,
            target_name: item.name,
            request: newRequest(userData.username, name),
            request_name: name,
            move: modalData.move ? "move" : "clone",
        };

        await requestCollect(payload);
        await fetchCollection();
    }

    const removeFrom = async (itemCollection: LiteItemCollection, itemRequest: LiteRequest) => {
        const content = `The request '${itemRequest.name}' from collection '${itemCollection.name}' will be deleted, are you sure?`;
        const buttons: ModalButton[] = [
            {
                title: "Yes",
                type: "submit",
                callback: {
                    func: async () => {
                        await deleteFromCollection(itemCollection, itemRequest);
                        await fetchCollection();
                        if (itemRequest._id == request._id) {
                            return cleanRequest();
                        }
                        discardRequest(itemRequest);
                    }
                }
            },
            {
                title: "No",
                callback: VoidCallback
            }
        ];

        ask({ content, buttons });
    }

    const takeFrom = async (itemCollection: LiteItemCollection, itemRequest: LiteRequest) => {
        await takeFromCollection(itemCollection, itemRequest);
        await fetchCollection();
        await fetchStored();
        if (itemRequest._id == request._id) {
            return cleanRequest();
        }
        discardRequest(itemRequest);
    }

    const defineCollectionRequest = async (itemCollection: LiteItemCollection, itemRequest: LiteRequest) => {
        fetchGroupRequest(itemCollection._id, itemCollection.context._id, itemRequest);
    }

    const cloneFromCollection = async (item: LiteRequest) => {
        const action = await findAction(item);
        const request = action.request;

        request._id = "";
        request.status = 'draft';
        defineFreeRequest(request);
    };

    const showDuplicateModal = (itemRequest: LiteRequest, itemCollection: LiteItemCollection) => {
        const newRequest = { ...itemRequest };
        newRequest.name = `${newRequest.name}-copy`
        setModalData((prevData) => ({
            ...prevData,
            move: false,
            collection: itemCollection,
            request: newRequest,
            openCollect: true
        }));
    };

    const showMoveModal = (itemRequest: LiteRequest, itemCollection: LiteItemCollection) => {
        setModalData((prevData) => ({
            ...prevData,
            move: true,
            collection: itemCollection,
            request: itemRequest,
            openCollect: true
        }));
    };

    const closeCollectionModal = () => {
        setModalData((prevData) => ({
            ...prevData,
            openCollect: false
        }));
    };

    const submitCollectionModal = async (collectionId: string, collectionName: string, item: LiteRequest, requestName: string) => {
        const action = await findAction(item);
        const request = action.request;

        const payload: RequestRequestCollect = {
            source_id: modalData.collection ? modalData.collection?._id : "",
            target_id: collectionId,
            target_name: collectionName,
            request: request,
            request_name: requestName,
            move: modalData.move ? "move" : "clone",
        };

        await requestCollect(payload);
        await fetchCollection();
    }

    const openImportModal = () => {
        setModalData((prevData) => ({
            ...prevData,
            openImportCollection: true
        }));
    };

    const submitImportCollectionModal = async (collections: ItemCollection[]) => {
        const collection = await importCollections(collections).catch(e =>
            push({
                title: `[${e.statusCode}] ${e.statusText}`,
                category: EAlertCategory.ERRO,
                content: e.message,
            }));
        if (!collection) {
            return;
        }

        closeImportCollectionModal();
        await fetchCollection();
    }

    const closeImportCollectionModal = () => {
        setModalData((prevData) => ({
            ...prevData,
            openImportCollection: false
        }));
    };

    const openOpenaApiModal = () => {
        setModalData((prevData) => ({
            ...prevData,
            openImportOpenApi: true
        }));
    };

    const submitImportOpenaApiModal = async (file: File) => {
        const form = new FormData();
        form.append('file', file);

        const collection = await imporOpenApi(form).catch(e =>
            push({
                title: `[${e.statusCode}] ${e.statusText}`,
                category: EAlertCategory.ERRO,
                content: e.message,
            }));
        if (!collection) {
            return;
        }

        closeImportOpenaApiModal();
        await fetchCollection();
    }

    const closeImportOpenaApiModal = () => {
        setModalData((prevData) => ({
            ...prevData,
            openImportOpenApi: false
        }));
    };

    const openImportRequestModal = (items: LiteItemCollection) => {
        setModalData((prevData) => ({
            ...prevData,
            collection: items,
            openImportRequest: true
        }));
    };

    const submitImportRequestModal = async (items: ItemRequest[]) => {
        if (!modalData.collection) {
            closeImportCollectionModal();
            return;
        }

        const collection = await importToCollection(modalData.collection._id, items).catch(e =>
            push({
                title: `[${e.statusCode}] ${e.statusText}`,
                category: EAlertCategory.ERRO,
                content: e.message,
            }));
        if (!collection) {
            return;
        }

        closeImportRequestModal();
        await fetchCollection();
    }

    const closeImportRequestModal = () => {
        setModalData((prevData) => ({
            ...prevData,
            collection: undefined,
            openImportRequest: false
        }));
    };

    const onFilterTargetChange = (value: string) => {
        store(FILTER_TARGET_KEY, value);
        setFilterData((prevData) => ({
            ...prevData,
            target: value,
        }));
    }

    function onFilterValueChange(event: React.ChangeEvent<HTMLInputElement>): void {
        store(FILTER_VALUE_KEY, event.target.value);
        setFilterData((prevData) => ({
            ...prevData,
            value: event.target.value,
        }));
    }

    function onFilterValueClean(): void {
        store(FILTER_VALUE_KEY, "");
        setFilterData((prevData) => ({
            ...prevData,
            value: "",
        }));
    }

    function applyFilter(item: LiteItemCollection): FilterResult<LiteItemCollection> {
        if (filterData.value == "") {
            return { matches: true };
        }

        if (filterData.target == "timestamp" || filterData.target == "name") {
            let field = item[filterData.target].toString();

            if (filterData.target == "timestamp") {
                field = millisecondsToDate(item[filterData.target]);
            }

            const result = field.toLowerCase().includes(filterData.value.toLowerCase())
            if (!result) {
                return { matches: result }
            }
        }

        const newItem = {
            ...item,
            nodes: item.nodes.filter(applyRequestFilter)
        };

        return {
            matches: true,
            item: newItem
        }
    }

    function applyRequestFilter(item: LiteItemNodeRequest): boolean {
        let field;
        switch (filterData.target) {
            case "req-name":
                field = item.request.name;
                break;
            case "req-timestamp":
                field = millisecondsToDate(item.request.timestamp);
                break;
            case "method":
            case "uri":
                field = item.request[filterData.target];
                break;
        }

        if (field == undefined) {
            return true;
        }

        return field.toLowerCase().includes(filterData.value.toLowerCase());
    }

    const makeKey = (itemCollection: LiteItemCollection, itemRequest: LiteRequest): string => {
        return `${itemCollection.name}-${itemRequest.timestamp}-${itemRequest._id}-${itemRequest.method}-${itemRequest.uri}`;
    }

    const exportAll = () => {
        const name = `collections_${Date.now()}.json`;
        downloadFile(name, collection);
    }

    const exportCollection = async (item: LiteItemCollection) => {
        const collection = await findCollection(item);
        let name = collection.name.toLowerCase().replace(/\s+/g, "_");
        name = `collection_${name}_${Date.now()}.json`;
        downloadFile(name, collection);
    }

    const exportRequests = async (item: LiteItemCollection) => {
        const collection = await findCollection(item);
        let name = collection.name.toLowerCase().replace(/\s+/g, "_");
        name = `requests_${name}_${Date.now()}.json`;
        const requests = collection.nodes.map(n => n.request);
        downloadFile(name, requests);
    }

    const isCollectionDrag = (item: LiteItemCollection) => {
        if (!dragData.collection) {
            return false
        }
        return item._id == dragData.collection._id;
    }

    const onCollectionDrag = async (item: PositionWrapper<LiteItemCollection>) => {
        setDragData((prevData) => ({
            ...prevData,
            collection: item.item,
        }));
    };

    const onCollectionDrop = async () => {
        setDragData((prevData) => ({
            ...prevData,
            collection: undefined,
        }));
    };

    const onCollectionOrderChange = async (items: PositionWrapper<LiteItemCollection>[]) => {
        const ordered: RequestNode[] = items.map(e => ({
            order: e.index,
            item: e.item._id
        }));
        await updateCollectionsOrder(ordered);
        await fetchCollection();
    };

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

    const onRequestOrderChange = async (items: PositionWrapper<LiteItemNodeRequest>[], collection?: LiteItemCollection) => {
        if (!collection) {
            return;
        }
        const ordered: RequestNode[] = items.map(e => ({
            order: e.index,
            item: e.item.request._id
        }));
        await updateCollectionRequestsOrder(collection, ordered);
        await fetchCollection();
    };

    const showCurl = async (itemCollection: LiteItemCollection, itemRequest: LiteRequest) => {
        const curl = await formatCurl(itemRequest._id, itemCollection.context._id)
        const { width, height } = calculateWindowSize(curl, {
            minWidth: 550,
            minHeight: 200
        });
        loadThemeWindow(width, height, <CodeArea code={curl} />);
    }

    return (
        <>
            <div className="column-option options border-bottom">
                <div id="left-options">
                    <Combo options={[]} />
                </div>
                <button type="button" className="button-anchor" onClick={insert}>New</button>
                <div id="right-options show">
                    <Combo options={collectionGroupOptions({
                        openOpenaApiModal, exportAll, openImportModal,
                        fetchCollection,
                    })} />
                </div>
            </div>
            <VerticalDragDrop
                id="actions-container"
                items={collection}
                applyFilter={applyFilter}
                itemId={cursorKey}
                onItemDrag={onCollectionDrag}
                onItemDrop={onCollectionDrop}
                onItemsChange={onCollectionOrderChange}
                renderItem={(cursorCollection) => (
                    <Details
                        key={cursorCollection._id}
                        identity={cursorKey(cursorCollection)}
                        summary={
                            <>
                                {(isParentCached(cursorCollection._id) || context.isParentCached(cursorCollection._id)) && (
                                    <span className="button-modified-status small visible"></span>
                                )}
                                <span className={`${cursorCollection._id == parent && "collection-selected"}`} title={cursorCollection.name}>{cursorCollection.name}</span>
                            </>
                        }
                        options={(
                            <Combo options={collectionOptions(cursorCollection, {
                                remove, renameCollection, clone,
                                newCollectionRequest, exportCollection, exportRequests,
                                openImportRequestModal, discardCollection, isParentCached,
                                discardContext: context.discardContext,
                                isContextCached: context.isParentCached,
                            })} />)}
                        subsummary={(
                            <div className="request-sign-date">
                                <span className="request-sign-timestamp" title={millisecondsToDate(cursorCollection.timestamp)}>{millisecondsToDate(cursorCollection.timestamp)}</span>
                            </div>
                        )}
                        isEmpty={() => cursorCollection.nodes.length == 0}
                        onToggle={() => fetchCollectionItem(cursorCollection)}
                    >
                        {!isCollectionDrag(cursorCollection) && (
                            <VerticalDragDrop
                                items={cursorCollection.nodes}
                                parameters={cursorCollection}
                                itemId={(node) => makeKey(cursorCollection, node.request)}
                                onItemDrag={onRequestDrag}
                                onItemDrop={onRequestDrop}
                                onItemsChange={onRequestOrderChange}
                                renderItem={(node) => (
                                    <div key={makeKey(cursorCollection, node.request)} className={`request-preview ${isRequestSelected(node) && "request-selected"} ${isRequestDrag(node) && "request-float"}`}>
                                        <a className="request-link" title={node.request.uri}
                                            onClick={() => defineCollectionRequest(cursorCollection, node.request)}>
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
                                        </a>
                                        <Combo options={requestOptions(cursorCollection, node, {
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
                        )}
                    </Details>
                )}
                emptyTemplate={(
                    <p className="no-data"> - No requests found - </p>
                )}
            />
            <div id="search-box">
                <button id="clean-filter" title="Clean filter" onClick={onFilterValueClean}></button>
                <input className="search-input" type="text" value={filterData.value} onChange={onFilterValueChange} placeholder={filterData.target} />
                <div className="search-combo-container">
                    <Combo
                        custom={(
                            <span>🔎</span>
                        )}
                        asSelect={true}
                        selected={filterData.target}
                        options={searchOptions({ onFilterTargetChange })} />
                </div>
            </div>
            <CollectionModal
                isOpen={modalData.openCollect}
                request={modalData.request}
                parent={modalData.collection?._id}
                onSubmit={submitCollectionModal}
                onClose={closeCollectionModal} />
            <ImportCollectionModal
                isOpen={modalData.openImportCollection}
                onSubmit={submitImportCollectionModal}
                onClose={closeImportCollectionModal}
            />
            <ImportOpenApiModal
                isOpen={modalData.openImportOpenApi}
                onSubmit={submitImportOpenaApiModal}
                onClose={closeImportOpenaApiModal}
            />
            <ImportRequestModal
                isOpen={modalData.openImportRequest}
                onSubmit={submitImportRequestModal}
                onClose={closeImportRequestModal}
            />
        </>
    )
}

const cursorKey = (lite: LiteItemCollection) => {
    return `${CURSOR_KEY}-${lite._id}`;
}
