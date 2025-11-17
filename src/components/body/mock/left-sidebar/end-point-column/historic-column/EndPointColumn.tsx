import { useState } from 'react';
import { LiteEndPoint } from '../../../../../../interfaces/mock/EndPoint';
import { millisecondsToDate } from '../../../../../../services/Tools';
import { useStoreEndPoint } from '../../../../../../store/mock/StoreProviderEndPoint';
import { useStoreMock } from '../../../../../../store/mock/StoreProviderMock';
import { Combo } from '../../../../../utils/combo/Combo';
import { FilterResult, PositionWrapper, VerticalDragDrop } from '../../../../../utils/drag/VerticalDragDrop';
import { emptyFilter, FilterBar, PayloadFilter } from '../../../../../utils/filter-bar/FilterBar';
import { endPointGroupOptions, endPointOptions, searchOptions } from './Constants';
import { Optional } from '../../../../../../types/Optional';
import { RequestNode } from '../../../../../../services/api/Requests';
import { sortEndPoints } from '../../../../../../services/api/ServiceStorage';

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
    const { endPoints, fetchEndPoints } = useStoreMock();
    const { endPoint, newEndPoint, fetchEndPoint, isCached } = useStoreEndPoint();

    const [dragData, setDragData] = useState<Optional<LiteEndPoint>>(undefined);

    const [filterData, setFilterData] = useState<PayloadFilter>(emptyFilter(FILTER_DEFAULT));

    const defineCursor = async (item: LiteEndPoint) => {
        await fetchEndPoint(item);
    }

    const makeKey = (item: LiteEndPoint): string => {
        return `${item.name}-${item.timestamp}-${item.method}-${item.path}`;
    }

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

    return (
        <>
            <div className="column-option options border-bottom">
                <div id="left-options">
                    <Combo options={[]} />
                </div>
                <button type="button" className="button-anchor" onClick={newEndPoint}>New</button>
                <div id="right-options show">
                    <Combo options={endPointGroupOptions({
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
                            onClick={() => defineCursor(cursor)}>
                            <div className="node-request-sign">
                                {isCached(cursor) && (
                                    <span className="button-modified-status small visible"></span>
                                )}
                                <span className={`node-request-sign-method ${cursor.method}`}>{cursor.method}</span>
                                <span className="rnode-request-sign-name" title={cursor.path}>{cursor.name}</span>
                            </div>
                            <div className="node-request-date">
                                <span className="node-request-date-timestamp" title={millisecondsToDate(cursor.timestamp)}>{millisecondsToDate(cursor.timestamp)}</span>
                            </div>
                        </button>
                        <Combo options={endPointOptions(cursor, {
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
        </>
    );
}