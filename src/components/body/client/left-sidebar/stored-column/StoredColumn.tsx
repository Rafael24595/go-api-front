import { deleteAction, importRequests, requestCollect, updateAction } from '../../../../../services/api/ServiceStorage';
import { ItemRequest, newRequest, Request } from '../../../../../interfaces/request/Request';
import { millisecondsToDate } from '../../../../../services/Tools';
import { useStoreRequest } from '../../../../../store/StoreProviderRequest';
import { useStoreRequests } from '../../../../../store/StoreProviderRequests';
import { Combo } from '../../../../utils/combo/Combo';
import { useState } from 'react';
import { CollectionModal } from '../../../../collection/CollectionModal';
import { downloadFile } from '../../../../../services/Utils';
import { ImportRequestModal } from '../../../../collection/ImportRequestModal';
import { EAlertCategory } from '../../../../../interfaces/AlertData';
import { useAlert } from '../../../../utils/alert/Alert';
import { useStoreStatus } from '../../../../../store/StoreProviderStatus';
import { useStoreSession } from '../../../../../store/StoreProviderSession';
import { VerticalDragDrop, PositionWrapper } from '../../../../utils/drag/VerticalDragDrop';
import { RequestNode, RequestRequestCollect } from '../../../../../services/api/Requests';
import { Optional } from '../../../../../types/Optional';

import './StoredColumn.css';

const FILTER_TARGET_KEY = "StoredColumnDetailsFilterTarget";
const FILTER_VALUE_KEY = "StoredColumnnDetailsFilterValue";

const DEFAULT_CURSOR = "name";
const VALID_CURSORS = Object.keys(newRequest("anonymous"))
    .map(k => k as keyof Request)

interface Payload {
    filterTarget: keyof Request;
    filterValue: string;
    request: Request;
    dragRequest: Optional<Request>;
    move: boolean;
    modalImport: boolean;
    modalMove: boolean;
}

export function StoredColumn() {
    const { userData } = useStoreSession();
    const { find, findOrDefault, store } = useStoreStatus();

    const { request, cleanRequest, defineFreeRequest, fetchFreeRequest, insertRequest, isCached } = useStoreRequest();
    const { stored, fetchStored, fetchCollection, updateStoredOrder } = useStoreRequests();

    const { push } = useAlert();

    const [data, setData] = useState<Payload>({
        filterTarget: findOrDefault(FILTER_TARGET_KEY, {
            def: DEFAULT_CURSOR,
            range: VALID_CURSORS,
        }),
        filterValue: find(FILTER_VALUE_KEY, {
            def: ""
        }),
        request: newRequest(userData.username),
        dragRequest: undefined,
        move: false,
        modalImport: false,
        modalMove: false,
    });

    const defineHistoricRequest = async (request: Request) => {
        await fetchFreeRequest(request);
    }

    const insertNewRequest = async () => {
        const result = await insertRequest(newRequest(userData.username));
        await fetchStored();
        await fetchFreeRequest(result.request);
    }

    const insertStored = async (request: Request) => {
        const newRequest = {...request};
        newRequest._id = "";
        newRequest.status = 'draft';
        await insertRequest(newRequest);
        await fetchStored();
    };

    const renameStored = async (request: Request) => {
        const name = prompt("Insert a name: ", request.name);
        if(name == null && name != request.name) {
            return;
        }
        request.name = name;
        await updateAction(request);
        await fetchStored();
    };

    const deleteStored = async (cursorRequest: Request) => {
        try {
            await deleteAction(cursorRequest);
            await fetchStored();
            if(request._id == cursorRequest._id) {
                cleanRequest();
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    const cloneStored = (request: Request) => {
        const newRequest = {...request};
        newRequest._id = "";
        newRequest.status = 'draft';
        defineFreeRequest(newRequest);
    };

    const openCollectModal = (request: Request) => {
        setData((prevData) => ({
            ...prevData,
            request: request,
            move: false,
            modalMove: true
        }));
    };

    const openMoveModal = (request: Request) => {
        setData((prevData) => ({
            ...prevData,
            request: request,
            move: true,
            modalMove: true
        }));
    };

    const closeMoveModal = () => {
        setData((prevData) => ({
            ...prevData,
            modalMove: false
        }));
    };

    const submitModal = async (collectionId: string, collectionName: string, request: Request, requestName: string) => {
        const payload: RequestRequestCollect = {
            source_id: "",
            target_id: collectionId,
            target_name: collectionName,
            request: request,
            request_name: requestName,
            move: data.move ? "move" : "clone",
        };

        await requestCollect(payload);
        await fetchStored();
        await fetchCollection();
    }

    const onFilterTargetChange = (value: string) => {
        const target = VALID_CURSORS.find(c => c == value)
            ? value as keyof Request
            : DEFAULT_CURSOR;
        store(FILTER_TARGET_KEY, target);
        setData((prevData) => ({
            ...prevData,
            filterTarget: target,
        }));
    }

    const onFilterValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        store(FILTER_VALUE_KEY, event.target.value);
        setData((prevData) => ({
            ...prevData,
            filterValue: event.target.value,
        }));
    }

    const onFilterValueClean = () => {
        store(FILTER_VALUE_KEY, "");
        setData((prevData) => ({
            ...prevData,
            filterValue: "",
        }));
    }

    const applyFilter = (value: Request): boolean => {
        let field = value[data.filterTarget]
        if(data.filterValue == "" || field == undefined) {
            return true;
        }

        field = field.toString();
        if(data.filterTarget == "timestamp") {
            field = millisecondsToDate(value[data.filterTarget]);
        }
        return field.toLowerCase().includes(data.filterValue.toLowerCase())
    }

    const openImportModal = () => {
        setData((prevData) => ({
            ...prevData,
            modalImport: true
        }));
    };

    const submitImportModal = async (requests: ItemRequest[]) => {
        const collection = await importRequests(requests).catch(e =>
            push({
                title: `[${e.statusCode}] ${e.statusText}`,
                category: EAlertCategory.ERRO,
                content: e.message,
            }));
        if(!collection) {
            return;
        }
        
        closeImportModal();
        await fetchStored();
    }

    const closeImportModal = () => {
        setData((prevData) => ({
            ...prevData,
            modalImport: false
        }));
    };

    const exportAll = () => {
        const name = `requests_${Date.now()}.json`;
        downloadFile(name, stored);
    }

    const exportRequest = (request: Request) => {
        let name = request.name.toLowerCase().replace(/\s+/g, "_");
        name = `request_${name}_${Date.now()}.json`;
        downloadFile(name, request);
    }

    const makeKey = (request: Request): string => {
        return `${request.timestamp}-${request.method}-${request.uri}`;
    }

    const isRequestSelected = (cursor: Request) => {
        return cursor._id == request._id;
    }

    const isRequestDrag = (cursor: Request) => {
        if(!data.dragRequest) {
            return false
        }
        return cursor._id == data.dragRequest._id;
    }

    const onRequestDrag = async (item: PositionWrapper<Request>) => {
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

    const updateOrder = async (items: PositionWrapper<Request>[]) => {
        const ordered: RequestNode[] = items.map(e => ({
            order: e.index,
            item: e.item._id
        }));
        await updateStoredOrder(ordered);
        await fetchStored();
    };

    return (
            <>
                <div className="column-option options border-bottom">
                    <div id="left-options">
                        <Combo options={[]}/>
                    </div>
                    <button type="button" className="button-anchor" onClick={() => insertNewRequest()}>New</button>
                    <div id="right-options show">
                        <Combo options={[
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
                <VerticalDragDrop
                    id="actions-container"
                    items={stored}
                    applyFilter={applyFilter}
                    itemId={makeKey}
                    onItemDrag={onRequestDrag}
                    onItemDrop={onRequestDrop}
                    onItemsChange={updateOrder}
                    renderItem={(cursor) => (
                        <div key={ makeKey(cursor) } className={`request-preview ${ isRequestSelected(cursor) && "request-selected" } ${ isRequestDrag(cursor) && "request-float" }`}>
                            <a className="request-link" title={ cursor.uri }
                                onClick={() => defineHistoricRequest(cursor)}>
                                <div className="request-sign">
                                    {isCached(cursor) && (
                                        <span className="button-modified-status small visible"></span>
                                    )}
                                    <span className={`request-sign-method ${cursor.method}`}>{ cursor.method }</span>
                                    <span className="request-sign-url">{ cursor.name }</span>
                                </div>
                                <div className="request-sign-date">
                                    <span className="request-sign-timestamp" title={millisecondsToDate(cursor.timestamp)}>{ millisecondsToDate(cursor.timestamp) }</span>
                                </div>
                            </a>
                            <Combo options={[
                                {
                                    icon: "🗑️",
                                    label: "Delete",
                                    title: "Delete request",
                                    action: () => deleteStored(cursor)
                                },
                                {
                                    icon: "✏️",
                                    label: "Rename",
                                    title: "Rename request",
                                    action: () => renameStored(cursor)
                                },
                                {
                                    icon: "🐑",
                                    label: "Clone",
                                    title: "Clone request",
                                    action: () => cloneStored(cursor)
                                },
                                {
                                    icon: "🐏",
                                    label: "Duplicate",
                                    title: "Duplicate request",
                                    action: () => insertStored(cursor)
                                },
                                {
                                    icon: "📚",
                                    label: "Collect",
                                    title: "Copy to collection",
                                    action: () => openCollectModal(cursor)
                                },
                                {
                                    icon: "📦",
                                    label: "Move",
                                    title: "Move to collection",
                                    action: () => openMoveModal(cursor)
                                },
                                {
                                    icon: "💾",
                                    label: "Export",
                                    title: "Export request",
                                    action: () => exportRequest(cursor)
                                },
                            ]}/>
                        </div>
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
                                {
                                    label: "Method",
                                    name: "method",
                                    title: "Filter by method",
                                    action: () => onFilterTargetChange("method")
                                },
                                {
                                    label: "Uri",
                                    name: "uri",
                                    title: "Filter by Uri",
                                    action: () => onFilterTargetChange("uri")
                                },
                        ]}/>
                    </div>
                </div>
                <ImportRequestModal
                    isOpen={data.modalImport}
                    onSubmit={submitImportModal}
                    onClose={closeImportModal}/>
                <CollectionModal
                    isOpen={data.modalMove} 
                    request={data.request} 
                    onSubmit={submitModal}
                    onClose={closeMoveModal}/>
            </>
        );
}
