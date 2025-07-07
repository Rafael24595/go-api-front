import { useState } from 'react';
import { ItemCollection, ItemNodeRequest, newCollection, newItemCollection, toCollection } from '../../../../../interfaces/collection/Collection';
import { fromContext } from '../../../../../interfaces/context/Context';
import { ItemRequest, newRequest, Request } from '../../../../../interfaces/request/Request';
import { cloneCollection, deleteCollection, deleteFromCollection, imporOpenApi, importCollections, importToCollection, insertCollection, requestCollect, takeFromCollection, updateAction } from '../../../../../services/api/ServiceStorage';
import { millisecondsToDate } from '../../../../../services/Tools';
import { useStoreRequest } from '../../../../../store/StoreProviderRequest';
import { useStoreRequests } from '../../../../../store/StoreProviderRequests';
import { CollectionModal } from '../../../../collection/CollectionModal';
import { Combo } from '../../../../utils/combo/Combo';
import { Details } from '../../../../utils/details/Details';
import { ImportOpenApiModal } from '../../../../collection/ImportOpenApiModal';
import { useAlert } from '../../../../utils/alert/Alert';
import { EAlertCategory } from '../../../../../interfaces/AlertData';
import { downloadFile } from '../../../../../services/Utils';
import { ImportCollectionModal } from '../../../../collection/ImportCollectionModal';
import { ImportRequestModal } from '../../../../collection/ImportRequestModal';
import { useStoreStatus } from '../../../../../store/StoreProviderStatus';
import { useStoreSession } from '../../../../../store/StoreProviderSession';
import { useStoreContext } from '../../../../../store/StoreProviderContext';
import { RequestNode, RequestRequestCollect } from '../../../../../services/api/Requests';
import { PositionWrapper, VerticalDragDrop } from '../../../../utils/drag/VerticalDragDrop';
import { Optional } from '../../../../../types/Optional';

import './CollectionColumn.css';

const FILTER_TARGET_KEY = "CollectionColumnDetailsFilterTarget";
const FILTER_VALUE_KEY = "CollectionColumnDetailsFilterValue";
const CURSOR_KEY = "CollectionColumnDetailsCursor";

const DEFAULT_CURSOR = "name";
const VALID_CURSORS = Object.keys(newItemCollection("anonymous"))
    .map(k => k as keyof ItemCollection )

interface Payload {
    filterTarget: keyof ItemCollection;
    filterValue: string;
    move: boolean;
    cursorRequest: Request;
    dragRequest: Optional<ItemNodeRequest>;
    cursorCollection?: ItemCollection;
    dragCollection: Optional<ItemCollection>;
    modalImportCollection: boolean;
    modalImportOpenApi: boolean;
    modalImportRequest: boolean;
    modalCollection: boolean;
}

export function CollectionColumn() {
    const { userData } = useStoreSession();
    const { find, findOrDefault, store } = useStoreStatus();

    const context = useStoreContext();
    const { parent, request, cleanRequest, discardRequest, defineFreeRequest, fetchGroupRequest, isParentCached, isCached } = useStoreRequest();
    const { collection, fetchStored, fetchCollection, updateCollectionsOrder, updateCollectionRequestsOrder } = useStoreRequests();

    const { push } = useAlert();

    const [data, setData] = useState<Payload>({
        filterTarget: findOrDefault(FILTER_TARGET_KEY, {
            def: DEFAULT_CURSOR,
            range: VALID_CURSORS
        }),
        filterValue: find(FILTER_VALUE_KEY, {
            def: ""
        }),
        move: false,
        cursorRequest: newRequest(userData.username),
        dragRequest: undefined,
        cursorCollection: undefined,
        dragCollection: undefined,
        modalImportCollection: false,
        modalImportOpenApi: false,
        modalImportRequest: false,
        modalCollection: false,
    });

    const insert = async () => {
        const name = prompt("New collection name:");
        if(name == null) {
            return;
        }
        
        const collection = newCollection(userData.username);
        collection.name = name;

        await insertCollection(collection);
        await fetchCollection();
    }

    const remove = async (collection: ItemCollection) => {
        await deleteCollection(collection);
        if(parent == collection._id) {
            cleanRequest();
        }
        await fetchCollection();
        discardCollection(collection);
    }

    const discardCollection = async (collection: ItemCollection) => {
        collection.nodes.forEach(n => discardRequest(n.request));
    }

    const renameCollection = async (collection: ItemCollection) => {
        const name = prompt("Insert a name: ", collection.name);
        if(name == null && name != collection.name) {
            return;
        }

        collection.name = name;

        await insertCollection(toCollection(collection));
        await fetchCollection();
    };

    const renameFromCollection = async (request: Request) => {
        const name = prompt("Insert a name: ", request.name);
        if(name == null && name != request.name) {
            return;
        }
        request.name = name;
        await updateAction(request);
        await fetchCollection();
    };

    const clone = async (collection: ItemCollection) => {
        const name = prompt("Insert a name: ", `${collection.name}-copy`);
        if(name == null) {
            return;
        }            
        await cloneCollection(collection, name);
        await fetchCollection();
    }

    const newCollectionRequest = async (collection: ItemCollection) => {
        const name = prompt("Insert a name: ");
        if(name == null) {
            return;
        }   

        const payload: RequestRequestCollect = {
            source_id: "",
            target_id: collection._id,
            target_name: collection.name,
            request: newRequest(userData.username, name),
            request_name: name,
            move: data.move ? "move" : "clone",
        };

        await requestCollect(payload);
        await fetchCollection();
    }

    const removeFrom = async (collection: ItemCollection, cursorRequest: Request) => {
        await deleteFromCollection(collection, cursorRequest);
        await fetchCollection();
        if(cursorRequest._id == request._id) {
            return cleanRequest();
        }
        discardRequest(cursorRequest);
    }

    const takeFrom = async (collection: ItemCollection, cursorRequest: Request) => {
        await takeFromCollection(collection, cursorRequest);
        await fetchCollection();
        await fetchStored();
        if(cursorRequest._id == request._id) {
            return cleanRequest();
        }
        discardRequest(cursorRequest);
    }

    const defineCollectionRequest = async (collection: ItemCollection, request: Request) => {
        const context = fromContext(collection.context);
        fetchGroupRequest(collection._id, context._id, request);
    }

    const cloneFromCollection = (request: Request) => {
        const newRequest = {...request};
        newRequest._id = "";
        newRequest.status = 'draft';
        defineFreeRequest(newRequest);
    };

    const openCloneModal = (request: Request, collection: ItemCollection) => {
        setData((prevData) => ({
            ...prevData,
            move: false, 
            cursorCollection: collection, 
            cursorRequest: request, 
            modalCollection: true
        }));
    };

    const openMoveModal = (request: Request, collection: ItemCollection) => {
        setData((prevData) => ({
            ...prevData,
            move: true, 
            cursorCollection: collection, 
            cursorRequest: request, 
            modalCollection: true
        }));
    };

    const closeCollectionModal = () => {
        setData((prevData) => ({
            ...prevData,
            modalCollection: false
        }));
    };

    const submitCollectionModal = async (collectionId: string, collectionName: string, request: Request, requestName: string) => {
        const payload: RequestRequestCollect = {
            source_id: data.cursorCollection ? data.cursorCollection?._id : "",
            target_id: collectionId,
            target_name: collectionName,
            request: request,
            request_name: requestName,
            move: data.move ? "move" : "clone",
        };

        await requestCollect(payload);
        await fetchCollection();
    }

    const openImportModal = () => {
        setData((prevData) => ({
            ...prevData,
            modalImportCollection: true
        }));
    };

    const submitImportCollectionModal = async (collections: ItemCollection[]) => {
        const collection = await importCollections(collections).catch(e =>
            push({
                title: `[${e.statusCode}] ${e.statusText}`,
                category: EAlertCategory.ERRO,
                content: e.message,
            }));
        if(!collection) {
            return;
        }
        
        closeImportCollectionModal();
        await fetchCollection();
    }

    const closeImportCollectionModal = () => {
        setData((prevData) => ({
            ...prevData,
            modalImportCollection: false
        }));
    };

    const openOpenaApiModal = () => {
        setData((prevData) => ({
            ...prevData,
            modalImportOpenApi: true
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
        if(!collection) {
            return;
        }
        
        closeImportOpenaApiModal();
        await fetchCollection();
    }

    const closeImportOpenaApiModal = () => {
        setData((prevData) => ({
            ...prevData,
            modalImportOpenApi: false
        }));
    };

    const openImportRequestModal = (collection: ItemCollection) => {
        setData((prevData) => ({
            ...prevData,
            cursorCollection: collection,
            modalImportRequest: true
        }));
    };

    const submitImportRequestModal = async (requests: ItemRequest[]) => {
        if(!data.cursorCollection) {
            closeImportCollectionModal();
            return;
        }

        const collection = await importToCollection(data.cursorCollection._id, requests).catch(e =>
            push({
                title: `[${e.statusCode}] ${e.statusText}`,
                category: EAlertCategory.ERRO,
                content: e.message,
            }));
        if(!collection) {
            return;
        }
        
        closeImportRequestModal();
        await fetchCollection();
    }

    const closeImportRequestModal = () => {
        setData((prevData) => ({
            ...prevData,
            cursorCollection: undefined,
            modalImportRequest: false
        }));
    };

    const onFilterTargetChange = (value: string) => {
        const target = VALID_CURSORS.find(c => c == value)
            ? value as keyof ItemCollection
            : DEFAULT_CURSOR;
        store(FILTER_TARGET_KEY, target);
        setData((prevData) => ({
            ...prevData,
            filterTarget: target,
        }));
    }

    function onFilterValueChange(event: React.ChangeEvent<HTMLInputElement>): void {
        store(FILTER_VALUE_KEY, event.target.value);
        setData((prevData) => ({
            ...prevData,
            filterValue: event.target.value,
        }));
    }

    function onFilterValueClean(): void {
        store(FILTER_VALUE_KEY, "");
        setData((prevData) => ({
            ...prevData,
            filterValue: "",
        }));
    }

    function applyFilter(value: ItemCollection): boolean {
        if(data.filterValue == "") {
            return true;
        }
        
        let field = value[data.filterTarget].toString();
        if(data.filterTarget == "timestamp") {
            field = millisecondsToDate(value[data.filterTarget]);
        }
        return field.toLowerCase().includes(data.filterValue.toLowerCase())
    }

    const makeKey = (collection: ItemCollection, request: Request): string => {
        return `${collection.name}-${request.timestamp}-${request._id}-${request.method}-${request.uri}`;
    }

    const exportAll = () => {
        const name = `collections_${Date.now()}.json`;
        downloadFile(name, collection);
    }

    const exportCollection = (collection: ItemCollection) => {
        let name = collection.name.toLowerCase().replace(/\s+/g, "_");
        name = `collection_${name}_${Date.now()}.json`;
        downloadFile(name, collection);
    }

    const exportRequests = (collection: ItemCollection) => {
        let name = collection.name.toLowerCase().replace(/\s+/g, "_");
        name = `requests_${name}_${Date.now()}.json`;
        const requests = collection.nodes.map(n => n.request);
        downloadFile(name, requests);
    }

    const isCollectionDrag = (node: ItemCollection) => {
        if(!data.dragCollection) {
            return false
        }
        return node._id == data.dragCollection._id;
    }

    const onCollectionDrag = async (item: PositionWrapper<ItemCollection>) => {
        setData((prevData) => ({
            ...prevData,
            dragCollection: item.item,
        }));
    };

    const onCollectionDrop = async () => {
        setData((prevData) => ({
            ...prevData,
            dragCollection: undefined,
        }));
    };

    const onCollectionOrderChange = async (items: PositionWrapper<ItemCollection>[]) => {
        const ordered: RequestNode[] = items.map(e => ({
            order: e.index,
            item: e.item._id
        }));
        await updateCollectionsOrder(ordered);
        await fetchCollection();
    };

    const isRequestSelected = (node: ItemNodeRequest) => {
        return node.request._id == request._id;
    }

    const isRequestDrag = (node: ItemNodeRequest) => {
        if(!data.dragRequest) {
            return false
        }
        return node.request._id == data.dragRequest.request._id;
    }

    const onRequestDrag = async (item: PositionWrapper<ItemNodeRequest>) => {
        setData((prevData) => ({
            ...prevData,
            dragRequest: item.item,
        }));
    };

    const onRequestDrop = async () => {
        setData((prevData) => ({
            ...prevData,
            dragRequest: undefined,
        }));
    };

    const onRequestOrderChange = async (items: PositionWrapper<ItemNodeRequest>[], collection?: ItemCollection) => {
        if(!collection) {
            return;
        }
        const ordered: RequestNode[] = items.map(e => ({
            order: e.index,
            item: e.item.request._id
        }));
        await updateCollectionRequestsOrder(collection, ordered);
        await fetchCollection();
    };

    return (
        <>
            <div className="column-option options border-bottom">
                <div id="left-options">
                    <Combo options={[]}/>
                </div>
                <button type="button" className="button-anchor" onClick={() => insert()}>New</button>
                <div id="right-options show">
                    <Combo options={[
                        {
                            icon: "📃",
                            label: "OpenApi",
                            title: "Load an OpenApi definition",
                            action: openOpenaApiModal
                        },
                        {
                            icon: "💾",
                            label: "Export",
                            title: "Export all",
                            action: exportAll
                        },
                        {
                            icon: "💽",
                            label: "Import",
                            title: "Import collections",
                            action: () => openImportModal()
                        },
                        {
                            icon: "🔄",
                            label: "Refresh",
                            title: "Refresh",
                            action: () => fetchCollection()
                        }
                    ]}/>
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
                                <span className={`${ cursorCollection._id == parent && "collection-selected"}`} title={cursorCollection.name}>{cursorCollection.name}</span>
                            </>
                        }
                        options={(
                            <Combo options={[
                                {
                                    icon: "🗑️",
                                    label: "Delete",
                                    title: "Delete collection",
                                    action: () => remove(cursorCollection)
                                },
                                {
                                    icon: "✏️",
                                    label: "Rename",
                                    title: "Rename request",
                                    action: () => renameCollection(cursorCollection)
                                },
                                {
                                    icon: "🐏",
                                    label: "Duplicate",
                                    title: "Duplicate collection",
                                    action: () => clone(cursorCollection)
                                },
                                {
                                    icon: "💡",
                                    label: "Request",
                                    title: "New request",
                                    action: () => newCollectionRequest(cursorCollection)
                                },
                                {
                                    icon: "💾",
                                    label: "Export",
                                    title: "Export collection",
                                    action: () => exportCollection(cursorCollection)
                                },
                                {
                                    icon: "📀",
                                    label: "Export",
                                    title: "Export requests",
                                    action: () => exportRequests(cursorCollection)
                                },
                                {
                                    icon: "💽",
                                    label: "Import",
                                    title: "Import requests",
                                    action: () => openImportRequestModal(cursorCollection)
                                },
                                {
                                    icon: "🧹",
                                    label: "Request",
                                    title: "Discard requests changes",
                                    disable: !isParentCached(cursorCollection._id),
                                    action: () => discardCollection(cursorCollection)
                                },
                                 {
                                    icon: "🧹",
                                    label: "Context",
                                    title: "Discard context changes",
                                    disable: !context.isParentCached(cursorCollection._id),
                                    action: () => context.discardContext(cursorCollection.context)
                                },
                            ]}/>)}
                        subsummary={(
                            <div className="request-sign-date">
                                <span className="request-sign-timestamp" title={millisecondsToDate(cursorCollection.timestamp)}>{ millisecondsToDate(cursorCollection.timestamp) }</span>
                            </div>
                        )}
                        isEmpty={ () => cursorCollection.nodes.length == 0 }
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
                                    <div key={ makeKey(cursorCollection, node.request) } className={`request-preview ${ isRequestSelected(node) && "request-selected"} ${ isRequestDrag(node) && "request-float" }`}>
                                        <a className="request-link" title={ node.request.uri }
                                            onClick={() => defineCollectionRequest(cursorCollection, node.request)}>
                                            <div className="request-sign">
                                                {isCached(node.request) && (
                                                    <span className="button-modified-status small visible"></span>
                                                )}
                                                <span className={`request-sign-method ${node.request.method}`}>{ node.request.method }</span>
                                                <span className="request-sign-url">{ node.request.name }</span>
                                            </div>
                                            <div className="request-sign-date">
                                                <span className="request-sign-timestamp" title={millisecondsToDate(node.request.timestamp)}>{ millisecondsToDate(node.request.timestamp) }</span>
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
                                                icon: "✏️",
                                                label: "Rename",
                                                title: "Rename request",
                                                action: () => renameFromCollection(node.request)
                                            },
                                            {
                                                icon: "🐑",
                                                label: "Clone",
                                                title: "Clone request",
                                                action: () => cloneFromCollection(node.request)
                                            },
                                            {
                                                icon: "🐏",
                                                label: "Duplicate",
                                                title: "Duplicate to collection",
                                                action: () => openCloneModal(node.request, cursorCollection)
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
                                            },
                                            {
                                                icon: "🧹",
                                                label: "Discard",
                                                title: "Discard changes",
                                                disable: !isCached(node.request),
                                                action: () => discardRequest(node.request)
                                            },
                                        ]}/>
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
                <input id="search-input" type="text" value={data.filterValue} onChange={onFilterValueChange} placeholder={data.filterTarget}/>
                <div className="search-combo-container">
                    <Combo 
                        custom={(
                            <span>🔎</span>
                        )}
                        asSelect={true}
                        selected={data.filterTarget}
                        options={[
                            {
                                label: "Name",
                                name: "name",
                                title: "Filter by name",
                                action: () => onFilterTargetChange("name")
                            },
                            {
                                label: "Date",
                                name: "timestamp",
                                title: "Filter by date",
                                action: () => onFilterTargetChange("timestamp")
                            },
                    ]}/>
                </div>
            </div>
            <CollectionModal 
                isOpen={data.modalCollection} 
                request={data.cursorRequest} 
                parent={data.cursorCollection?._id}
                onSubmit={submitCollectionModal}
                onClose={closeCollectionModal}/>
            <ImportCollectionModal
                isOpen={data.modalImportCollection}
                onSubmit={submitImportCollectionModal}
                onClose={closeImportCollectionModal}
            />
            <ImportOpenApiModal
                isOpen={data.modalImportOpenApi}
                onSubmit={submitImportOpenaApiModal}
                onClose={closeImportOpenaApiModal}
            />
            <ImportRequestModal
                isOpen={data.modalImportRequest}
                onSubmit={submitImportRequestModal}
                onClose={closeImportRequestModal}
            />
        </>
    )
}

const cursorKey = (collection: ItemCollection) => {
    return `${CURSOR_KEY}-${collection._id}`;
}
