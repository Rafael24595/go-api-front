import { useState } from 'react';
import { ItemCollection, newCollection, newItemCollection, toCollection } from '../../../../../interfaces/collection/Collection';
import { fromContext } from '../../../../../interfaces/context/Context';
import { ItemRequest, newRequest, Request } from '../../../../../interfaces/request/Request';
import { cloneCollection, deleteCollection, deleteFromCollection, imporOpenApi, importCollections, importToCollection, insertCollection, pushToCollection, takeFromCollection, updateAction } from '../../../../../services/api/ServiceStorage';
import { millisecondsToDate } from '../../../../../services/Tools';
import { useStoreContext } from '../../../../../store/StoreProviderContext';
import { useStoreRequest } from '../../../../../store/StoreProviderRequest';
import { useStoreRequests } from '../../../../../store/StoreProviderRequests';
import { CollectionModal } from '../../../../collection/CollectionModal';
import { Combo } from '../../../../utils/combo/Combo';
import { Details } from '../../../../utils/details/Details';
import { RequestPushToCollection } from '../../../../../services/api/RequestPushToCollection';
import { ImportOpenApiModal } from '../../../../collection/ImportOpenApiModal';
import { useAlert } from '../../../../utils/alert/Alert';
import { EAlertCategory } from '../../../../../interfaces/AlertData';
import { downloadFile } from '../../../../../services/Utils';
import { ImportCollectionModal } from '../../../../collection/ImportCollectionModal';
import { ImportRequestModal } from '../../../../collection/ImportRequestModal';

import './CollectionColumn.css';

const FILTER_TARGET_KEY = "CollectionColumnDetailsFilterTarget";
const FILTER_VALUE_KEY = "CollectionColumnDetailsFilterValue";
const CURSOR_KEY = "CollectionColumnDetailsCursor";

interface Payload {
    filterTarget: keyof ItemCollection;
    filterValue: string;
    move: boolean;
    cursorRequest: Request;
    cursorCollection?: ItemCollection;
    modalImportCollection: boolean;
    modalImportOpenApi: boolean;
    modalImportRequest: boolean;
    modalCollection: boolean;
}

export function CollectionColumn() {
    const { fetchContext } = useStoreContext();
    const { parent, request, defineRequest, defineRequestFromParent } = useStoreRequest();
    const { collection, fetchStored, fetchCollection } = useStoreRequests();

    const { push } = useAlert();

    const [data, setData] = useState<Payload>({
        filterTarget: findFilterTarget(),
        filterValue: findFilterValue(),
        move: false,
        cursorRequest: newRequest("anonymous"),
        cursorCollection: undefined,
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
        
        const collection = newCollection("anonymous");
        collection.name = name;

        await insertCollection(collection);
        await fetchCollection();
    }

    const remove = async (collection: ItemCollection) => {
        await deleteCollection(collection);
        await fetchCollection();
    }

    const renameCollection = async (collection: ItemCollection) => {
        const name = prompt("Insert a name: ");
        if(name == null) {
            return;
        }

        collection.name = name;

        await insertCollection(toCollection(collection));
        await fetchCollection();
    };

    const renameFromCollection = async (request: Request) => {
        const name = prompt("Insert a name: ");
        if(name == null) {
            return;
        }
        request.name = name;
        await updateAction(request);
        await fetchCollection();
    };

    const clone = async (collection: ItemCollection) => {
        const name = prompt("Insert a name: ");
        if(name == null) {
            return;
        }            
        await cloneCollection(collection, name);
        await fetchCollection();
    }

    const removeFrom = async (collection: ItemCollection, cursorRequest: Request) => {
        await deleteFromCollection(collection, cursorRequest);
        await fetchCollection();
        if(request._id == cursorRequest._id) {
            defineRequest(newRequest("anonymous"));
        }
    }

    const takeFrom = async (collection: ItemCollection, request: Request) => {
        await takeFromCollection(collection, request);
        await fetchCollection();
        await fetchStored();
    }

    const defineCollectionRequest = async (collection: ItemCollection, request: Request) => {
        const context = fromContext(collection.context);
        defineRequestFromParent(collection._id, request);
        await fetchContext(context._id);
    }

    const cloneFromCollection = (request: Request) => {
        const newRequest = {...request};
        newRequest._id = undefined;
        newRequest.status = 'draft';
        defineRequest(newRequest);
    };

    const openCloneModal = (request: Request) => {
        setData((prevData) => ({
            ...prevData,
            move: false, 
            cursorCollection: undefined, 
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
        const payload: RequestPushToCollection = {
            source_id: data.cursorCollection ? data.cursorCollection?._id : "",
            target_id: collectionId,
            target_name: collectionName,
            request: request,
            request_name: requestName,
            move: data.move ? "move" : "clone",
        };
        await pushToCollection(payload);
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

    function onFilterTargetChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        const target = fixFilterTarget(event.target.value);
        storeFilterTarget(target);
        setData((prevData) => ({
            ...prevData,
            filterTarget: target,
        }));
    }

    function onFilterValueChange(event: React.ChangeEvent<HTMLInputElement>): void {
        storeFilterValue(event.target.value);
        setData((prevData) => ({
            ...prevData,
            filterValue: event.target.value,
        }));
    }

    function onFilterValueClean(): void {
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
        return `${collection.name}-${request.timestamp}-${request.method}-${request.uri}`;
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
                        }
                    ]}/>
                </div>
            </div>
            <div id="actions-container">
                {collection.length > 0 ? (
                    collection.filter(applyFilter).map((cursorCollection) => (
                        <Details 
                            key={cursorCollection._id}
                            identity={cursorKey(cursorCollection)}
                            summary={cursorCollection.name}
                            summaryClassList={`${ cursorCollection._id == parent && "collection-selected"}`}
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
                                    }
                                ]}/>)}
                            subsummary={(
                                <div className="request-sign-date">
                                    <span className="request-sign-timestamp" title={millisecondsToDate(cursorCollection.timestamp)}>{ millisecondsToDate(cursorCollection.timestamp) }</span>
                                </div>
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
                                isOpen={data.modalCollection} 
                                request={data.cursorRequest} 
                                onSubmit={submitCollectionModal}
                                onClose={closeCollectionModal}/>
                        </Details>
                    ))
                ) : (
                    <p className="no-data"> - No Collections found - </p>
                )}
            </div>
            <div id="search-box">
                <button title="Clean filter" onClick={onFilterValueClean}></button>
                <input id="search-input" type="text" value={data.filterValue} onChange={onFilterValueChange}/>
                <select value={data.filterTarget} onChange={onFilterTargetChange}>
                    <option value="name">Name</option>
                    <option value="timestamp">Date</option>
                </select>
            </div>
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

const emptyItemCollection = newItemCollection("anonymous");

const fixFilterTarget = (value: string | null): keyof ItemCollection => {
    if (value && value in emptyItemCollection) {
        return value as keyof ItemCollection;
    }
    return "name";
}

const findFilterTarget = (): keyof ItemCollection => {
    const value = localStorage.getItem(FILTER_TARGET_KEY);
    return fixFilterTarget(value);
}

const storeFilterTarget = (filter: string) => {
    localStorage.setItem(FILTER_VALUE_KEY, filter);
}

const findFilterValue = () => {
    return localStorage.getItem(FILTER_TARGET_KEY) || "";
}

const storeFilterValue = (filter: string) => {
    localStorage.setItem(FILTER_VALUE_KEY, filter);
}

const cursorKey = (collection: ItemCollection) => {
    return `${CURSOR_KEY}-${collection._id}`;
}
