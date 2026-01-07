import { deleteAction, exportAllRequests, exportManyRequests, findAction, exportCurl, importCurl, importRequests, updateAction } from '../../../../../services/api/ServiceStorage';
import { ItemRequest, LiteRequest, newRequest } from '../../../../../interfaces/client/request/Request';
import { millisecondsToDate } from '../../../../../services/Tools';
import { useStoreRequest } from '../../../../../store/client/StoreProviderRequest';
import { useStoreCollections } from '../../../../../store/client/StoreProviderCollections';
import { Combo } from '../../../../utils/combo/Combo';
import { useState } from 'react';
import { CollectRequestModal } from '../../../../client/collection/CollectRequestModal';
import { calculateWindowSize, downloadFile } from '../../../../../services/Utils';
import { EAlertCategory } from '../../../../../interfaces/AlertData';
import { useAlert } from '../../../../utils/alert/Alert';
import { useStoreSession } from '../../../../../store/system/StoreProviderSession';
import { VerticalDragDrop, PositionWrapper, FilterResult } from '../../../../utils/drag/VerticalDragDrop';
import { RequestNode, RequestRequestCollect } from '../../../../../services/api/Requests';
import { Optional } from '../../../../../types/Optional';
import { VoidCallback } from '../../../../../interfaces/Callback';
import { searchOptions, storedGroupOptions, storedOptions } from './Constants';
import { CodeArea } from '../../../../utils/code-area/CodeArea';
import { useStoreTheme } from '../../../../../store/theme/StoreProviderTheme';
import { ModalButton } from '../../../../../interfaces/ModalButton';
import { requestCollect } from '../../../../../services/api/ServiceCollection';
import { emptyFilter, FilterBar, PayloadFilter } from '../../../../utils/filter-bar/FilterBar';
import { ImportModal, SubmitArgs } from '../../../../form/import-modal/ImportModal';
import { importModalCurlDefinition, importModalRequestDefinition } from '../../Constants';

import './StoredColumn.css';

const FILTER_TARGETS = searchOptions().map(o => o.name);
const FILTER_DEFAULT = FILTER_TARGETS[0] || "name";

const FILTER_CACHE = {
    keyTarget: "FilterTargetStored",
    keyValue: "FilterValueStored"
}

interface PayloadModalCollect {
    status: boolean;
    request: LiteRequest;
    move: boolean;
}

export function StoredColumn() {
    const { userData } = useStoreSession();
    const { push, ask } = useAlert();
    const { loadThemeWindow } = useStoreTheme();

    const { request, cleanRequest, discardRequest, defineRequest, fetchFreeRequest, insertRequest, isCached } = useStoreRequest();
    const { stored, fetchStored, fetchCollection, updateStoredOrder } = useStoreCollections();

    const [dragData, setDragData] = useState<Optional<LiteRequest>>(undefined);
    const [filterData, setFilterData] = useState<PayloadFilter>(emptyFilter(FILTER_DEFAULT));

    const [modalImportRequest, setModalImportRequest] = useState<boolean>(false);
    const [modalImportCurl, setModalImportCurl] = useState<boolean>(false);

    const [modalCollectData, setModalCollectData] = useState<PayloadModalCollect>({
        request: newRequest(userData.username),
        move: false,
        status: false,
    });

    const insertNewRequest = async () => {
        const request = newRequest(userData.username);
        const result = await insertRequest(request);
        await fetchStored();
        await fetchFreeRequest(result.request);
    }

    const onFilterChange = (target: string, value: string) => {
        setFilterData({
            target, value
        });
    }

    const applyFilter = (item: LiteRequest): FilterResult<LiteRequest> => {
        let field = item[filterData.target as keyof LiteRequest];
        if (filterData.value == "" || field == undefined) {
            return { matches: true };
        }

        field = field.toString();
        if (filterData.target == "timestamp") {
            field = millisecondsToDate(item[filterData.target]);
        }
        return {
            matches: field.toLowerCase().includes(filterData.value.toLowerCase())
        }
    }

    const isRequestSelected = (item: LiteRequest) => {
        return item._id == request._id;
    }

    const isRequestDrag = (item: LiteRequest) => {
        if (!dragData) {
            return false
        }
        return item._id == dragData._id;
    }

    const onRequestDrag = async (item: PositionWrapper<LiteRequest>) => {
        setDragData(item.item);
    };

    const onRequestDrop = async () => {
        setDragData(undefined);
    };

    const updateOrder = async (items: PositionWrapper<LiteRequest>[]) => {
        const ordered: RequestNode[] = items.map(e => ({
            order: e.index,
            item: e.item._id
        }));
        await updateStoredOrder(ordered);
        await fetchStored();
    };

    const showModalImportRequest = () => {
        setModalImportRequest(true);
    };

    const hideModalImportRequest = () => {
        setModalImportRequest(false);
    };

    const onSubmitModalImportRequest = async ({ items }: SubmitArgs<ItemRequest>) => {
        const collection = await importRequests(items).catch(e =>
            push({
                title: `[${e.statusCode}] ${e.statusText}`,
                category: EAlertCategory.ERRO,
                content: e.message,
            }));
        if (!collection) {
            return;
        }

        hideModalImportRequest();
        await fetchStored();
    }

    const onCloseModalImportRequest = () => {
        hideModalImportRequest();
    };

    const openCurlModal = () => {
        setModalImportCurl(true);
    };

    const hideCurlModal = () => {
        setModalImportCurl(false);
    };

    const onSubmitModalImportCurl = async ({ items }: SubmitArgs<string>) => {
        const collection = await importCurl(items)
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
        await fetchStored();
    }

    const onClosetModalImportCurl = () => {
        hideCurlModal();
    };

    const showModalCollect = (item: LiteRequest) => {
        const newItem = { ...item };
        newItem.name = `${item.name}-copy`;

        setModalCollectData({
            status: true,
            request: newItem,
            move: false,
        });
    };

    const showModalMove = (item: LiteRequest) => {
        setModalCollectData({
            status: true,
            request: item,
            move: true,
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
            source_id: "",
            target_id: collectionId,
            target_name: collectionName,
            request: request,
            request_name: requestName,
            move: modalCollectData.move ? "move" : "clone",
        };

        await requestCollect(payload);
        await fetchStored();
        await fetchCollection();

        if (modalCollectData.move) {
            discardRequest(request);
        }
    }

    const onCloseModalCollect = () => {
        hideModalCollect();
    };

    const actionExportAll = async () => {
        const requests = await exportAllRequests();
        const name = `requests_${Date.now()}.json`;
        downloadFile(name, requests);
    }

    const actionExportOne = async (item: LiteRequest) => {
        const requests = await exportManyRequests(item._id);
        if (requests.length == 0) {
            push({
                category: EAlertCategory.ERRO,
                content: `Request '${item.name}' not found`
            });
            return;
        }

        const request = requests[0];

        let name = request.name.toLowerCase().replace(/\s+/g, "_");
        name = `request_${name}_${Date.now()}.json`;
        downloadFile(name, request);
    }

    const actionDuplicate = async (item: LiteRequest) => {
        const action = await findAction(item);
        const request = action.request;

        request._id = "";
        request.name = `${request.name}-copy`;
        request.status = 'draft';

        await insertRequest(request);
        await fetchStored();
    };

    const actionRename = async (item: LiteRequest) => {
        const action = await findAction(item);
        const request = action.request;

        const name = prompt("Insert a name: ", request.name);
        if (name == null && name != request.name) {
            return;
        }

        request.name = name;
        await updateAction(request);
        await fetchStored();
    };

    const actionDelete = async (item: LiteRequest) => {
        const content = `The request '${item.name}' will be deleted, are you sure?`;
        const buttons: ModalButton[] = [
            {
                title: "Yes",
                type: "submit",
                callback: {
                    func: async () => { deleteRequest(item); }
                }
            },
            {
                title: "No",
                callback: VoidCallback
            }
        ];

        ask({ content, buttons });
    };

    const actionClone = async (item: LiteRequest) => {
        const action = await findAction(item);
        const request = action.request;

        request._id = "";
        request.status = 'draft';

        defineRequest(request);
    };

    const actionShowCurl = async (item: LiteRequest, raw?: boolean) => {
        const curl = await exportCurl(item._id, undefined, raw);
        const { width, height } = calculateWindowSize(curl, {
            minWidth: 550,
            minHeight: 200
        });
        loadThemeWindow(width, height, <CodeArea code={curl} />);
    }

    const deleteRequest = async (item: LiteRequest) => {
        try {
            await deleteAction(item);
            discardRequest(item);
            await fetchStored();
            if (request._id == item._id) {
                cleanRequest();
            }
        } catch (error) {
            console.error("Error deleting request:", error);
        }
    }

    return (
        <>
            <div className="column-option options border-bottom">
                <div id="left-options">
                    <Combo options={[]} />
                </div>
                <button type="button" className="button-anchor" onClick={() => insertNewRequest()}>New</button>
                <div id="right-options show">
                    <Combo options={storedGroupOptions({
                        export: actionExportAll,
                        fetch: fetchStored,
                        request: showModalImportRequest,
                        curl: openCurlModal,
                    })} />
                </div>
            </div>
            <VerticalDragDrop
                id="actions-container"
                items={stored}
                applyFilter={applyFilter}
                itemId={makeKey}
                onItemDrag={onRequestDrag}
                onItemDrop={onRequestDrop}
                onItemsChange={updateOrder}
                renderItem={(cursor) => (
                    <div key={makeKey(cursor)} className={`request-preview ${isRequestSelected(cursor) && "request-selected"} ${isRequestDrag(cursor) && "request-float"}`}>
                        <button className="request-link" title={cursor.uri}
                            onClick={() => fetchFreeRequest(cursor)}>
                            <div className="request-sign">
                                {isCached(cursor) && (
                                    <span className="button-modified-status small visible"></span>
                                )}
                                <span className={`request-sign-method ${cursor.method}`}>{cursor.method}</span>
                                <span className="request-sign-url">{cursor.name}</span>
                            </div>
                            <div className="request-sign-date">
                                <span className="request-sign-timestamp" title={millisecondsToDate(cursor.timestamp)}>{millisecondsToDate(cursor.timestamp)}</span>
                            </div>
                        </button>
                        <Combo options={storedOptions(cursor, {
                            export: actionExportOne,
                            remove: actionDelete,
                            rename: actionRename,
                            clone: actionClone,
                            duplicate: actionDuplicate,
                            showCollect: showModalCollect,
                            showMove: showModalMove,
                            discard: discardRequest,
                            showCurl: actionShowCurl,
                            isCached,
                        })} />
                    </div>
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
            <ImportModal<ItemRequest>
                isOpen={modalImportRequest}
                onClose={onCloseModalImportRequest}
                onSubmit={onSubmitModalImportRequest}
                modal={importModalRequestDefinition()} />
            <ImportModal<string>
                isOpen={modalImportCurl}
                onClose={onClosetModalImportCurl}
                onSubmit={onSubmitModalImportCurl}
                modal={importModalCurlDefinition()} />
            <CollectRequestModal
                isOpen={modalCollectData.status}
                request={modalCollectData.request}
                onSubmit={onSubmitModalCollect}
                onClose={onCloseModalCollect} />
        </>
    );
}

const makeKey = (item: LiteRequest): string => {
    return `${item.timestamp}-${item.method}-${item.uri}`;
}
