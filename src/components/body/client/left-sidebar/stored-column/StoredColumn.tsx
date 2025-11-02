import { deleteAction, findAction, formatCurl, importCurl, importRequests, requestCollect, updateAction } from '../../../../../services/api/ServiceStorage';
import { ItemRequest, LiteRequest, newRequest } from '../../../../../interfaces/request/Request';
import { millisecondsToDate } from '../../../../../services/Tools';
import { useStoreRequest } from '../../../../../store/StoreProviderRequest';
import { useStoreRequests } from '../../../../../store/StoreProviderRequests';
import { Combo } from '../../../../utils/combo/Combo';
import { useState } from 'react';
import { CollectionModal } from '../../../../collection/CollectionModal';
import { calculateWindowSize, downloadFile } from '../../../../../services/Utils';
import { ImportRequestModal } from '../../../../collection/ImportRequestModal';
import { EAlertCategory } from '../../../../../interfaces/AlertData';
import { useAlert } from '../../../../utils/alert/Alert';
import { useStoreStatus } from '../../../../../store/StoreProviderStatus';
import { useStoreSession } from '../../../../../store/StoreProviderSession';
import { VerticalDragDrop, PositionWrapper, FilterResult } from '../../../../utils/drag/VerticalDragDrop';
import { RequestNode, RequestRequestCollect } from '../../../../../services/api/Requests';
import { Optional } from '../../../../../types/Optional';
import { VoidCallback } from '../../../../../interfaces/Callback';
import { searchOptions, storedGroupOptions, storedOptions } from './Constants';
import { CodeArea } from '../../../../utils/code-area/CodeArea';
import { useStoreTheme } from '../../../../../store/theme/StoreProviderTheme';
import { ModalButton } from '../../../../../interfaces/ModalButton';
import { ImportCurlModal } from '../../../../collection/ImportCurlModal';

import './StoredColumn.css';

const FILTER_TARGET_KEY = "StoredColumnDetailsFilterTarget";
const FILTER_VALUE_KEY = "StoredColumnnDetailsFilterValue";

const DEFAULT_CURSOR = "name";
const VALID_CURSORS = Object.keys(newRequest("anonymous"))
    .map(k => k as keyof LiteRequest)

interface PayloadModal {
    request: LiteRequest;
    move: boolean;
    openImport: boolean;
    openMove: boolean;
    openCurl: boolean;
}

interface PayloadDrag {
    request: Optional<LiteRequest>;
}

interface PayloadFilter {
    target: keyof LiteRequest;
    value: string;
}

export function StoredColumn() {
    const { userData } = useStoreSession();
    const { find, findOrDefault, store } = useStoreStatus();

    const { loadThemeWindow } = useStoreTheme();

    const { request, cleanRequest, discardRequest, defineFreeRequest, fetchFreeRequest, insertRequest, isCached } = useStoreRequest();
    const { stored, fetchStored, fetchCollection, updateStoredOrder } = useStoreRequests();

    const { push, ask } = useAlert();

    const [modalData, setModalData] = useState<PayloadModal>({
        request: newRequest(userData.username),
        move: false,
        openImport: false,
        openMove: false,
        openCurl: false,
    });

    const [dragData, setDragData] = useState<PayloadDrag>({
        request: undefined,
    });

    const [filterData, setFilterData] = useState<PayloadFilter>({
        target: findOrDefault(FILTER_TARGET_KEY, {
            def: DEFAULT_CURSOR,
            range: VALID_CURSORS,
        }),
        value: find(FILTER_VALUE_KEY, {
            def: ""
        })
    });

    const defineHistoricRequest = async (item: LiteRequest) => {
        await fetchFreeRequest(item);
    }

    const insertNewRequest = async () => {
        const request = newRequest(userData.username);
        const result = await insertRequest(request);
        await fetchStored();
        await fetchFreeRequest(result.request);
    }

    const duplicateStored = async (item: LiteRequest) => {
        const action = await findAction(item);
        const request = action.request;

        request._id = "";
        request.name = `${request.name}-copy`;
        request.status = 'draft';

        await insertRequest(request);
        await fetchStored();
    };

    const renameStored = async (item: LiteRequest) => {
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

    const deleteStored = async (item: LiteRequest) => {
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

    const cloneStored = async (item: LiteRequest) => {
        const action = await findAction(item);
        const request = action.request;

        request._id = "";
        request.status = 'draft';

        defineFreeRequest(request);
    };

    const openCollectModal = (item: LiteRequest) => {
        const newItem = { ...item };
        newItem.name = `${item.name}-copy`;
        setModalData((prevData) => ({
            ...prevData,
            request: newItem,
            move: false,
            openMove: true
        }));
    };

    const onFilterTargetChange = (value: string) => {
        const target = VALID_CURSORS.find(c => c == value)
            ? value as keyof LiteRequest
            : DEFAULT_CURSOR;
        store(FILTER_TARGET_KEY, target);
        setFilterData((prevData) => ({
            ...prevData,
            target: target,
        }));
    }

    const onFilterValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        store(FILTER_VALUE_KEY, event.target.value);
        setFilterData((prevData) => ({
            ...prevData,
            value: event.target.value,
        }));
    }

    const onFilterValueClean = () => {
        store(FILTER_VALUE_KEY, "");
        setFilterData((prevData) => ({
            ...prevData,
            value: "",
        }));
    }

    const applyFilter = (item: LiteRequest): FilterResult<LiteRequest> => {
        let field = item[filterData.target]
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

    const exportAll = () => {
        const name = `requests_${Date.now()}.json`;
        downloadFile(name, stored);
    }

    const exportRequest = async (item: LiteRequest) => {
        const action = await findAction(item);
        const request = action.request;

        let name = request.name.toLowerCase().replace(/\s+/g, "_");
        name = `request_${name}_${Date.now()}.json`;
        downloadFile(name, request);
    }

    const makeKey = (item: LiteRequest): string => {
        return `${item.timestamp}-${item.method}-${item.uri}`;
    }

    const isRequestSelected = (item: LiteRequest) => {
        return item._id == request._id;
    }

    const isRequestDrag = (item: LiteRequest) => {
        if (!dragData.request) {
            return false
        }
        return item._id == modalData.request._id;
    }

    const onRequestDrag = async (item: PositionWrapper<LiteRequest>) => {
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

    const updateOrder = async (items: PositionWrapper<LiteRequest>[]) => {
        const ordered: RequestNode[] = items.map(e => ({
            order: e.index,
            item: e.item._id
        }));
        await updateStoredOrder(ordered);
        await fetchStored();
    };

    const showCurl = async (item: LiteRequest, raw?: boolean) => {
        const curl = await formatCurl(item._id, undefined, raw);
        const { width, height } = calculateWindowSize(curl, {
            minWidth: 550,
            minHeight: 200
        });
        loadThemeWindow(width, height, <CodeArea code={curl} />);
    }

    const openImportModal = () => {
        setModalData((prevData) => ({
            ...prevData,
            openImport: true
        }));
    };

    const submitImportModal = async (requests: ItemRequest[]) => {
        const collection = await importRequests(requests).catch(e =>
            push({
                title: `[${e.statusCode}] ${e.statusText}`,
                category: EAlertCategory.ERRO,
                content: e.message,
            }));
        if (!collection) {
            return;
        }

        closeImportModal();
        await fetchStored();
    }

    const closeImportModal = () => {
        setModalData((prevData) => ({
            ...prevData,
            openImport: false
        }));
    };

    const openMoveModal = (item: LiteRequest) => {
        setModalData((prevData) => ({
            ...prevData,
            request: item,
            move: true,
            openMove: true
        }));
    };

    const submitMoveModal = async (collectionId: string, collectionName: string, item: LiteRequest, requestName: string) => {
        const action = await findAction(item);
        const request = action.request;

        const payload: RequestRequestCollect = {
            source_id: "",
            target_id: collectionId,
            target_name: collectionName,
            request: request,
            request_name: requestName,
            move: modalData.move ? "move" : "clone",
        };

        await requestCollect(payload);
        await fetchStored();
        await fetchCollection();

        if (modalData.move) {
            discardRequest(request);
        }
    }

    const closeMoveModal = () => {
        setModalData((prevData) => ({
            ...prevData,
            openMove: false
        }));
    };

    const openCurlModal = () => {
        setModalData((prevData) => ({
            ...prevData,
            openCurl: true
        }));
    };

    const submitCurlModal = async (curls: string[]) => {
        const collection = await importCurl(curls)
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
        await fetchStored();
    }

    const closeCurlModal = () => {
        setModalData((prevData) => ({
            ...prevData,
            openCurl: false
        }));
    };

    return (
        <>
            <div className="column-option options border-bottom">
                <div id="left-options">
                    <Combo options={[]} />
                </div>
                <button type="button" className="button-anchor" onClick={() => insertNewRequest()}>New</button>
                <div id="right-options show">
                    <Combo options={storedGroupOptions({
                        exportAll, openImportModal, openCurlModal,
                        fetchStored
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
                            onClick={() => defineHistoricRequest(cursor)}>
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
                            deleteStored, renameStored, cloneStored,
                            duplicateStored, openCollectModal, openMoveModal,
                            exportRequest, isCached, discardRequest,
                            showCurl,
                        })} />
                    </div>
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
            <ImportRequestModal
                isOpen={modalData.openImport}
                onSubmit={submitImportModal}
                onClose={closeImportModal} />
            <CollectionModal
                isOpen={modalData.openMove}
                request={modalData.request}
                onSubmit={submitMoveModal}
                onClose={closeMoveModal} />
            <ImportCurlModal
                isOpen={modalData.openCurl}
                onSubmit={submitCurlModal}
                onClose={closeCurlModal}
            />
        </>
    );
}
