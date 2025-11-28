import { useState } from 'react';
import { ItemCollection, LiteItemCollection, LiteItemNodeRequest, newCollection, toCollection } from '../../../../../interfaces/client/collection/Collection';
import { ItemRequest, LiteRequest, newRequest } from '../../../../../interfaces/client/request/Request';
import { findAction, importCurl } from '../../../../../services/api/ServiceStorage';
import { millisecondsToDate } from '../../../../../services/Tools';
import { useStoreRequest } from '../../../../../store/client/StoreProviderRequest';
import { useStoreCollections } from '../../../../../store/client/StoreProviderCollections';
import { Combo } from '../../../../utils/combo/Combo';
import { Details } from '../../../../utils/details/Details';
import { ImportOpenApiModal } from '../../../../client/collection/ImportOpenApiModal';
import { useAlert } from '../../../../utils/alert/Alert';
import { EAlertCategory } from '../../../../../interfaces/AlertData';
import { downloadFile } from '../../../../../services/Utils';
import { ImportCollectionModal } from '../../../../client/collection/ImportCollectionModal';
import { ImportRequestModal } from '../../../../client/collection/ImportRequestModal';
import { useStoreStatus } from '../../../../../store/StoreProviderStatus';
import { useStoreSession } from '../../../../../store/system/StoreProviderSession';
import { useStoreContext } from '../../../../../store/client/StoreProviderContext';
import { RequestNode, RequestRequestCollect } from '../../../../../services/api/Requests';
import { FilterResult, PositionWrapper, VerticalDragDrop } from '../../../../utils/drag/VerticalDragDrop';
import { Optional } from '../../../../../types/Optional';
import { VoidCallback } from '../../../../../interfaces/Callback';
import { collectionOptions, collectionGroupOptions, searchOptions } from './Constants';
import { ModalButton } from '../../../../../interfaces/ModalButton';
import { CollectionRequests } from './CollectionRequests';
import { CollectModal } from '../../../../client/collection/CollectModal';
import { ImportCurlModal } from '../../../../client/collection/ImportCurlModal';
import { cloneCollection, deleteCollection, exportAllCollections, exportManyCollections, findCollection, imporOpenApi, importCollections, importToCollection, insertCollection, requestCollect } from '../../../../../services/api/ServiceCollection';

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

interface PayloadModalCollection {
    status: boolean;
}

interface PayloadModalOAPI {
    status: boolean;
}

interface PayloadModalRequest {
    status: boolean;
    collection?: LiteItemCollection;
}

interface PayloadModalCollect {
    move: boolean;
    request: LiteRequest;
    collection?: LiteItemCollection;
    status: boolean;
}

interface PayloadModalCurl {
    status: boolean;
    collection?: LiteItemCollection;
}

export function CollectionColumn() {
    const { push, ask } = useAlert();
    const { find, store } = useStoreStatus();

    const { userData } = useStoreSession();

    const context = useStoreContext();
    const { parent, cleanRequest, discardRequest, isParentCached } = useStoreRequest();
    const { collection, fetchCollection, fetchCollectionItem, updateCollectionsOrder } = useStoreCollections();

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

    const [modalCollectionData, setModalCollectionData] = useState<PayloadModalCollection>({
        status: false
    });

    const [modalOapiData, setModalOapiData] = useState<PayloadModalOAPI>({
        status: false
    });

    const [modalCollectData, setModalCollectData] = useState<PayloadModalCollect>({
        status: false,
        move: false,
        request: newRequest(userData.username),
        collection: undefined,
    });

    const [modalRequestData, setModalRequestData] = useState<PayloadModalRequest>({
        status: false,
        collection: undefined,
    });

    const [modalCurlData, setModalCurlData] = useState<PayloadModalCurl>({
        status: false,
        collection: undefined,
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
                        discard(item);
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

    const discard = async (item: LiteItemCollection) => {
        item.nodes.forEach(n => discardRequest(n.request));
    }

    const rename = async (item: LiteItemCollection) => {
        const name = prompt("Insert a name: ", item.name);
        if (name == null && name != item.name) {
            return;
        }

        item.name = name;

        await insertCollection(toCollection(item));
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
            move: modalCollectData.move ? "move" : "clone",
        };

        await requestCollect(payload);
        await fetchCollection();
    }

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

    const exportAll = async () => {
        const collections = await exportAllCollections();
        const name = `collections_${Date.now()}.json`;
        downloadFile(name, collections);
    }

    const exportCollection = async (item: LiteItemCollection) => {
        const collections = await exportManyCollections(item._id);
        if (collections.length == 0) {
            push({
                category: EAlertCategory.ERRO,
                content: `Collection '${item.name}' not found`
            });
            return;
        }

        const collection = collections[0];

        let name = collection.name.toLowerCase().replace(/\s+/g, "_");
        name = `collection_${name}_${Date.now()}.json`;
        downloadFile(name, collection);
    }

    const exportRequests = async (item: LiteItemCollection) => {
        const collections = await exportManyCollections(item._id);
        if (collections.length == 0) {
            push({
                category: EAlertCategory.ERRO,
                content: `Collection '${item.name}' not found`
            });
            return;
        }

        const collection = collections[0];

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

    const openImportModal = () => {
        setModalCollectionData({
            status: true
        });
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
        setModalCollectionData({
            status: false
        });
    };

    const openOpenaApiModal = () => {
        setModalOapiData({
            status: true
        });
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
        setModalOapiData({
            status: false
        });
    };

    const openImportRequestModal = (items: LiteItemCollection) => {
        setModalRequestData({
            status: true,
            collection: items,
        });
    };

    const submitImportRequestModal = async (items: ItemRequest[]) => {
        if (!modalRequestData.collection) {
            closeImportCollectionModal();
            return;
        }

        const collection = await importToCollection(modalRequestData.collection._id, items).catch(e =>
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
        setModalRequestData({
            status: false,
            collection: undefined,
        });
    };

    const showDuplicateModal = (itemCollection: LiteItemCollection, itemRequest: LiteRequest) => {
        const newRequest = { ...itemRequest };
        newRequest.name = `${newRequest.name}-copy`
        setModalCollectData({
            status: true,
            move: false,
            collection: itemCollection,
            request: newRequest,
        });
    };

    const showMoveModal = (itemCollection: LiteItemCollection, itemRequest: LiteRequest) => {
        setModalCollectData({
            status: true,
            move: true,
            collection: itemCollection,
            request: itemRequest,
        });
    };

    const submitCollectionModal = async (collectionId: string, collectionName: string, item: LiteRequest, requestName: string) => {
        const action = await findAction(item);
        const request = action.request;

        const payload: RequestRequestCollect = {
            source_id: modalCollectData.collection ? modalCollectData.collection?._id : "",
            target_id: collectionId,
            target_name: collectionName,
            request: request,
            request_name: requestName,
            move: modalCollectData.move ? "move" : "clone",
        };

        await requestCollect(payload);
        await fetchCollection();
    }

    const closeCollectionModal = () => {
        setModalCollectData((prevData) => ({
            ...prevData,
            status: false
        }));
    };

    const showCurlModal = (itemCollection: LiteItemCollection) => {
        setModalCurlData({
            status: true,
            collection: itemCollection
        });
    };

    const submitCurlModal = async (curls: string[]) => {
        const collection = await importCurl(curls, modalCurlData.collection?._id)
            .catch(e =>
                push({
                    title: `[${e.statusCode}] ${e.statusText}`,
                    category: EAlertCategory.ERRO,
                    content: e.message,
                }));
        if (!collection) {
            return;
        }

        closeCurlModal();
        await fetchCollection();
    }

    const closeCurlModal = () => {
        setModalCurlData({
            status: false,
            collection: undefined
        });
    };

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
                                remove, rename, clone,
                                newCollectionRequest, exportCollection, exportRequests,
                                openImportRequestModal, discard, isParentCached,
                                discardContext: context.discardContext,
                                isContextCached: context.isParentCached,
                                showCurlModal
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
                            <CollectionRequests
                                collection={cursorCollection}
                                showDuplicateModal={showDuplicateModal}
                                showMoveModal={showMoveModal} />
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
                        mode="select"
                        focus={filterData.target}
                        options={searchOptions({ onFilterTargetChange })} />
                </div>
            </div>
            <ImportCollectionModal
                isOpen={modalCollectionData.status}
                onSubmit={submitImportCollectionModal}
                onClose={closeImportCollectionModal} />
            <ImportOpenApiModal
                isOpen={modalOapiData.status}
                onSubmit={submitImportOpenaApiModal}
                onClose={closeImportOpenaApiModal} />
            <ImportRequestModal
                isOpen={modalRequestData.status}
                onSubmit={submitImportRequestModal}
                onClose={closeImportRequestModal} />
            <CollectModal
                isOpen={modalCollectData.status}
                request={modalCollectData.request}
                parent={modalCollectData.collection?._id}
                onSubmit={submitCollectionModal}
                onClose={closeCollectionModal} />
            <ImportCurlModal
                isOpen={modalCurlData.status}
                onSubmit={submitCurlModal}
                onClose={closeCurlModal} />
        </>
    )
}

const cursorKey = (lite: LiteItemCollection) => {
    return `${CURSOR_KEY}-${lite._id}`;
}
