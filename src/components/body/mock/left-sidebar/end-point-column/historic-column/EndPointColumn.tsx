import { useState } from 'react';
import { EndPoint, LiteEndPoint } from '../../../../../../interfaces/mock/EndPoint';
import { millisecondsToDate } from '../../../../../../services/Tools';
import { useStoreEndPoint } from '../../../../../../store/mock/StoreProviderEndPoint';
import { useStoreMock } from '../../../../../../store/mock/StoreProviderMock';
import { Combo } from '../../../../../utils/combo/Combo';
import { FilterResult, PositionWrapper, VerticalDragDrop } from '../../../../../utils/drag/VerticalDragDrop';
import { emptyFilter, FilterBar, PayloadFilter } from '../../../../../utils/filter-bar/FilterBar';
import { endPointGroupOptions, endPointOptions, importModalDefinition, searchOptions } from './Constants';
import { Optional } from '../../../../../../types/Optional';
import { RequestNode } from '../../../../../../services/api/Requests';
import { endPointToCurl, exportAllEndPoints, exportManyEndPoints, findEndPoint, importEndPoints, insertEndPoint, removeEndPoint, sortEndPoints } from '../../../../../../services/api/ServiceStorage';
import { ModalButton } from '../../../../../../interfaces/ModalButton';
import { useAlert } from '../../../../../utils/alert/Alert';
import { EAlertCategory } from '../../../../../../interfaces/AlertData';
import { calculateWindowSize, downloadFile } from '../../../../../../services/Utils';
import { ImportModal, SubmitArgs } from '../../../../../form/import-modal/ImportModal';
import { CodeArea } from '../../../../../utils/code-area/CodeArea';
import { useStoreTheme } from '../../../../../../store/theme/StoreProviderTheme';

import '../../../../../style/NodeRequest.css'
import './EndPointColumn.css';

const FILTER_TARGETS = searchOptions().map(o => o.name);
const FILTER_DEFAULT = FILTER_TARGETS[0] || "name";

const FILTER_CACHE = {
    keyTarget: "FilterTargetEndPoint",
    keyValue: "FilterValueEndPoint"
}

interface EndPointColumnProps {
    setCursor: (cursor: string) => void;
}

export function EndPointColumn({ setCursor }: EndPointColumnProps) {
    const { loadThemeWindow } = useStoreTheme();
    const { ask, push } = useAlert();

    const { endPoints, fetchEndPoints } = useStoreMock();
    const { endPoint, newEndPoint, fetchEndPoint, discardEndPoint, injectEndPoint, renameEndPoint, isFocused, isCached } = useStoreEndPoint();

    const [dragData, setDragData] = useState<Optional<LiteEndPoint>>(undefined);
    const [filterData, setFilterData] = useState<PayloadFilter>(emptyFilter(FILTER_DEFAULT));
    const [modalStatus, setModalStatus] = useState<boolean>(false);

    const applyFilter = (item: LiteEndPoint): FilterResult<LiteEndPoint> => {
        let field = item[filterData.target as keyof LiteEndPoint]
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

    const isRequestDrag = (item: LiteEndPoint) => {
        if (!dragData) {
            return false
        }
        return item._id == dragData._id;
    }

    const onRequestDrag = async (item: PositionWrapper<LiteEndPoint>) => {
        setDragData(item.item);
    };

    const onRequestDrop = async () => {
        setDragData(undefined);
    };

    const updateOrder = async (items: PositionWrapper<LiteEndPoint>[]) => {
        const ordered: RequestNode[] = items.map(e => {
            return {
                order: e.index,
                item: e.item._id
            };
        });

        await sortEndPoints(ordered);
        await fetchEndPoints();
    };

    const onFilterChange = (target: string, value: string) => {
        setFilterData({
            target, value
        });
    }

    const remove = async (cursor: LiteEndPoint) => {
        await removeEndPoint(cursor).catch(e => {
            push({
                category: EAlertCategory.ERRO,
                content: `The end-point cannot be removed.`
            });
            console.error(e);
        });

        discardEndPoint(cursor);
        await fetchEndPoints();

        if (isFocused(cursor)) {
            newEndPoint();
        }
    }

    const actionRemove = (cursor: LiteEndPoint) => {
        const content = `The end-point '${cursor.name}' will be deleted, are you sure?`;
        const buttons: ModalButton[] = [
            {
                title: "Yes",
                type: "submit",
                callback: {
                    func: remove,
                    args: [cursor]
                }
            },
            {
                title: "No",
                type: 'button',
            }
        ];

        ask({ content, buttons });
    }

    const actionRename = async (cursor: LiteEndPoint) => {
        const result = await findEndPoint(cursor._id);
        const { endPoint, ok } = renameEndPoint(result);
        if (!ok) {
            return;
        }

        await insertEndPoint(endPoint).catch(e => {
            push({
                category: EAlertCategory.ERRO,
                content: `The end-point cannot be defined.`
            });
            console.error(e);
        });

        await fetchEndPoints();
    }

    const actionClone = async (cursor: LiteEndPoint) => {
        const endPoint = await findEndPoint(cursor._id);
        endPoint._id = "";
        endPoint.name = "";
        injectEndPoint(endPoint);
    }

    const actionDuplicate = async (cursor: LiteEndPoint) => {
        const endPoint = await findEndPoint(cursor._id);
        endPoint._id = "";
        endPoint.name += "-copy";

        await insertEndPoint(endPoint).catch(e => {
            push({
                category: EAlertCategory.ERRO,
                content: `The end-point cannot be defined.`
            });
            console.error(e);
        });

        await fetchEndPoints();
    }

    const actionExportAll = async () => {
        const endPoints = await exportAllEndPoints();
        const name = `mock_endpoints_${Date.now()}.json`;
        downloadFile(name, endPoints);
    }

    const actionExportOne = async (item: LiteEndPoint) => {
        const endPoints = await exportManyEndPoints(item._id);
        if (endPoints.length == 0) {
            push({
                category: EAlertCategory.ERRO,
                content: `End-point '${item.name}' not found`
            });
            return;
        }

        const endPoint = endPoints[0];

        let name = endPoint.name.toLowerCase().replace(/\s+/g, "_");
        name = `mock_endpoint_${name}_${Date.now()}.json`;
        downloadFile(name, endPoint);
    }

    const actionShowCurl = async (item: LiteEndPoint) => {
        const curl = await endPointToCurl(item._id, true);
        const { width, height } = calculateWindowSize(curl, {
            minWidth: 550,
            minHeight: 200
        });
        loadThemeWindow(width, height, <CodeArea code={curl} />);
    }

    const showModal = () => {
        setModalStatus(true);
    };

    const hideModal = () => {
        setModalStatus(true);
    };

    const onSubmitModal = async ({ items }: SubmitArgs<EndPoint>) => {
        await importEndPoints(items);
        await fetchEndPoints();
        hideModal();
    }

    const onCloseModal = () => {
        setModalStatus(false);
    };

    const parseBlob = <EndPoint,>(blob: string): { items: EndPoint[], warning?: string } => {
        let endPoints: EndPoint[] = [];
        try {
            const json = JSON.parse(blob);
            if (!Array.isArray(json)) {
                endPoints = [json];
            } else {
                endPoints = json;
            }
        } catch (e) {
            return { items: [], warning: `Invalid format: ${e}` };
        }

        return { items: endPoints, warning: undefined };
    }

    return (
        <>
            <div className="column-option options border-bottom">
                <div id="left-options">
                    <Combo options={[]} />
                </div>
                <button type="button" className="button-anchor" onClick={newEndPoint}>New</button>
                <div id="right-options show">
                    <Combo options={endPointGroupOptions({
                        export: actionExportAll,
                        import: showModal,
                        fetch: fetchEndPoints
                    })} />
                </div>
            </div>
            <VerticalDragDrop
                id="node-request-container"
                items={endPoints}
                applyFilter={applyFilter}
                itemId={makeKey}
                onItemDrag={onRequestDrag}
                onItemDrop={onRequestDrop}
                onItemsChange={updateOrder}
                renderItem={(cursor) => (
                    <div key={makeKey(cursor)} className={`node-request-preview ${cursor._id == endPoint?._id && "node-request-selected"} ${isRequestDrag(cursor) && "node-request-drag"}`}>
                        <button className="node-request-link" title={cursor.path}
                            onClick={() => fetchEndPoint(cursor)}>
                            <div className="node-request-sign state">
                                <div className="node-request-state-sign">
                                    {isCached(cursor) && (
                                        <span className="button-modified-status small visible"></span>
                                    )}
                                    <span className={`node-request-status colored-circle ${cursor.status ? "active" : "inactive"}`}
                                        title={cursor.status ? "Active" : "Inactive"}></span>
                                    <span className={`node-request-sign-method ${cursor.method}`} title={cursor.method}>{cursor.method}</span>
                                    <span className="node-request-sign-name" title={cursor.name}>{cursor.name}</span>
                                </div>
                                <div className="node-request-status-container">
                                    <span className="pipe-mid" />
                                    <span className="flat-emoji small"
                                        title={cursor.safe ? "Safe" : "Unsafe"}>{cursor.safe ? "🔒" : "🔓"}</span>
                                    <span className="pipe-right" />
                                </div>
                            </div>
                            <div className="node-request-date">
                                <span className="node-request-date-timestamp" title={millisecondsToDate(cursor.timestamp)}>{millisecondsToDate(cursor.timestamp)}</span>
                            </div>
                        </button>
                        <Combo options={endPointOptions(cursor, {
                            remove: actionRemove,
                            rename: actionRename,
                            clone: actionClone,
                            duplicate: actionDuplicate,
                            isCached: isCached,
                            discard: discardEndPoint,
                            export: actionExportOne,
                            curl: actionShowCurl
                        })} />
                    </div>
                )}
                emptyTemplate={(
                    <p className="no-data"> - No history found - </p>
                )}
            />
            <FilterBar
                filterDefault={FILTER_DEFAULT}
                filterTargets={FILTER_TARGETS}
                options={searchOptions()}
                cache={FILTER_CACHE}
                onFilterChange={onFilterChange}
            />
            <ImportModal<EndPoint>
                isOpen={modalStatus}
                onClose={onCloseModal}
                onSubmit={onSubmitModal}
                modal={importModalDefinition({
                    parseBlob
                })}
            />
        </>
    );
}

const makeKey = (item: LiteEndPoint): string => {
    return `${item.name}-${item.timestamp}-${item.method}-${item.path}`;
}
