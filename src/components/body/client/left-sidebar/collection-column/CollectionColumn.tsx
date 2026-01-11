import { useState } from 'react';
import { ItemCollection, LiteItemCollection, LiteItemNodeRequest, newCollection, toCollection } from '../../../../../interfaces/client/collection/Collection';
import { ItemRequest, LiteRequest, newRequest } from '../../../../../interfaces/client/request/Request';
import { findAction, importCurl } from '../../../../../services/api/ServiceStorage';
import { millisecondsToDate } from '../../../../../services/Tools';
import { useStoreRequest } from '../../../../../store/client/request/StoreProviderRequest';
import { useStoreCollections } from '../../../../../store/client/collection/StoreProviderCollections';
import { Combo } from '../../../../utils/combo/Combo';
import { Details } from '../../../../utils/details/Details';
import { useAlert } from '../../../../utils/alert/Alert';
import { EAlertCategory } from '../../../../../interfaces/AlertData';
import { downloadFile } from '../../../../../services/Utils';
import { useStoreSession } from '../../../../../store/system/StoreProviderSession';
import { useStoreContext } from '../../../../../store/client/context/StoreProviderContext';
import { RequestNode, RequestRequestCollect } from '../../../../../services/api/Requests';
import { FilterResult, PositionWrapper, VerticalDragDrop } from '../../../../utils/drag/VerticalDragDrop';
import { Optional } from '../../../../../types/Optional';
import { VoidCallback } from '../../../../../interfaces/Callback';
import { collectionOptions, collectionGroupOptions, searchOptions, importModalCollectionDefinition, importModalOpenApiDefinition } from './Constants';
import { ModalButton } from '../../../../../interfaces/ModalButton';
import { CollectionRequests } from './CollectionRequests';
import { CollectRequestModal } from '../../../../client/collection/CollectRequestModal';
import { cloneCollection, deleteCollection, exportAllCollections, exportManyCollections, findCollection, imporOpenApi, importCollections, importToCollection, insertCollection, requestCollect } from '../../../../../services/api/ServiceCollection';
import { emptyFilter, FilterBar } from '../../../../utils/filter-bar/FilterBar';
import { ImportModal, SubmitArgs } from '../../../../form/import-modal/ImportModal';
import { importModalCurlDefinition, importModalRequestDefinition } from '../../Constants';

import './CollectionColumn.css';

const FILTER_TARGETS = searchOptions().map(o => o.name);
const FILTER_DEFAULT = FILTER_TARGETS[0] || "name";

const FILTER_CACHE = {
    keyTarget: "FilterTargetCollection",
    keyValue: "FilterValueCollection"
}

const CURSOR_KEY = "CollectionColumnDetailsCursor";

interface PayloadFilter {
    target: string;
    value: string;
}

interface PayloadDrag {
    request: Optional<LiteItemNodeRequest>;
    collection: Optional<LiteItemCollection>;
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
    const { userData } = useStoreSession();

    const context = useStoreContext();
    const { parent, cleanRequest, discardRequest, isParentCached } = useStoreRequest();
    const { collection, fetchCollection, fetchCollectionItem, updateCollectionsOrder } = useStoreCollections();

    const [filterData, setFilterData] = useState<PayloadFilter>(emptyFilter(FILTER_DEFAULT));

    const [dragData, setDragData] = useState<PayloadDrag>({
        request: undefined,
        collection: undefined,
    });

    const [modalImportCollection, setModalImportCollection] = useState<boolean>(false);
    const [modalImportOpenApi, setModalImportOpenApi] = useState<boolean>(false);

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

    const onFilterChange = (target: string, value: string) => {
        setFilterData({
            target, value
        });
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

    const showModalImportCollection = () => {
        setModalImportCollection(true);
    };

    const hideModalImportCollection = () => {
        setModalImportCollection(false);
    };

    const onSubmitModalImportCollection = async ({ items }: SubmitArgs<ItemCollection>) => {
        const collection = await importCollections(items)
            .catch(e =>
                push({
                    title: `[${e.statusCode}] ${e.statusText}`,
                    category: EAlertCategory.ERRO,
                    content: e.message,
                }));
        if (!collection) {
            return;
        }

        hideModalImportCollection();
        await fetchCollection();
    }

    const onCloseModalImportCollection = () => {
        hideModalImportCollection();
    };

    const showModalImportOpenApi = () => {
        setModalImportOpenApi(true);
    };

    const hideModalImportOpenApi = () => {
        setModalImportOpenApi(false);
    };

    const onSubmitModalImportOpenApi = async ({ file }: SubmitArgs<any>) => {
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

        hideModalImportOpenApi();
        await fetchCollection();
    }

    const onCloseModalImportOpenApi = () => {
        setModalImportOpenApi(false);
    };

    const showModalImportRequest = (items: LiteItemCollection) => {
        setModalRequestData({
            status: true,
            collection: items,
        });
    };

    const hideModalImportRequest = () => {
        setModalRequestData({
            status: false,
            collection: undefined,
        });
    };

    const onSubmitModalImportRequest = async ({ items }: SubmitArgs<ItemRequest>) => {
        if (!modalRequestData.collection) {
            onCloseModalImportCollection();
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

        hideModalImportRequest();
        await fetchCollection();
    }

    const onCloseModalImportRequest = () => {
        hideModalImportRequest();
    };

    const openCurlModal = (itemCollection: LiteItemCollection) => {
        setModalCurlData({
            status: true,
            collection: itemCollection
        });
    };

    const hideCurlModal = () => {
        setModalCurlData({
            status: false,
            collection: undefined
        });
    };

    const onSubmitModalImportCurl = async ({ items }: SubmitArgs<string>) => {
        const collection = await importCurl(items, modalCurlData.collection?._id)
            .catch(e =>
                push({
                    title: `[${e.statusCode}] ${e.statusText}`,
                    category: EAlertCategory.ERRO,
                    content: e.message,
                }));
        if (!collection) {
            return;
        }

        hideCurlModal();
        await fetchCollection();
    }

    const onClosetModalImportCurl = () => {
        hideCurlModal();
    };

    const showModalDuplicateRequest = (itemCollection: LiteItemCollection, itemRequest: LiteRequest) => {
        const newRequest = { ...itemRequest };
        newRequest.name = `${newRequest.name}-copy`;

        setModalCollectData({
            status: true,
            move: false,
            collection: itemCollection,
            request: newRequest,
        });
    };

    const showModalMoveRequest = (itemCollection: LiteItemCollection, itemRequest: LiteRequest) => {
        setModalCollectData({
            status: true,
            move: true,
            collection: itemCollection,
            request: itemRequest,
        });
    };

    const hideModalCollect = () => {
        setModalCollectData((prevData) => ({
            ...prevData,
            status: false
        }));
    };

    const onSubmitModalCollect = async (collectionId: string, collectionName: string, item: LiteRequest, requestName: string) => {
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

    const onCloseModalCollect = () => {
        hideModalCollect();
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
                        openOpenaApiModal: showModalImportOpenApi, exportAll, openImportModal: showModalImportCollection,
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
                                openImportRequestModal: showModalImportRequest, discard, isParentCached,
                                discardContext: context.discardContext,
                                isContextCached: context.isParentCached,
                                showCurlModal: openCurlModal
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
                                showDuplicateModal={showModalDuplicateRequest}
                                showMoveModal={showModalMoveRequest} />
                        )}
                    </Details>
                )}
                emptyTemplate={(
                    <p className="no-data"> - No requests found - </p>
                )}
            />
            <FilterBar
                filterDefault={FILTER_DEFAULT}
                filterTargets={FILTER_TARGETS}
                options={searchOptions()}
                cache={FILTER_CACHE}
                onFilterChange={onFilterChange} />
            <ImportModal<ItemCollection>
                isOpen={modalImportCollection}
                onClose={onCloseModalImportCollection}
                onSubmit={onSubmitModalImportCollection}
                modal={importModalCollectionDefinition()} />
            <ImportModal<void>
                isOpen={modalImportOpenApi}
                onClose={onCloseModalImportOpenApi}
                onSubmit={onSubmitModalImportOpenApi}
                modal={importModalOpenApiDefinition()} />
            <ImportModal<ItemRequest>
                isOpen={modalRequestData.status}
                onClose={onCloseModalImportRequest}
                onSubmit={onSubmitModalImportRequest}
                modal={importModalRequestDefinition()} />
            <ImportModal<string>
                isOpen={modalCurlData.status}
                onClose={onClosetModalImportCurl}
                onSubmit={onSubmitModalImportCurl}
                modal={importModalCurlDefinition()} />
            <CollectRequestModal
                isOpen={modalCollectData.status}
                request={modalCollectData.request}
                parent={modalCollectData.collection?._id}
                onSubmit={onSubmitModalCollect}
                onClose={onCloseModalCollect} />
        </>
    )
}

const cursorKey = (lite: LiteItemCollection) => {
    return `${CURSOR_KEY}-${lite._id}`;
}
