import { LiteEndPoint } from '../../../../../../interfaces/mock/EndPoint';
import { millisecondsToDate } from '../../../../../../services/Tools';
import { useStoreEndPoint } from '../../../../../../store/mock/StoreProviderEndPoint';
import { useStoreMock } from '../../../../../../store/mock/StoreProviderMock';
import { Combo } from '../../../../../utils/combo/Combo';
import { endPointGroupOptions, endPointOptions } from './Constants';

import './EndPointColumn.css';

interface EndPointColumnProps {
    setCursor: (cursor: string) => void;
}

export function EndPointColumn({ setCursor }: EndPointColumnProps) {

    const { endPoints } = useStoreMock();
    const { endPoint, fetchEndPoint } = useStoreEndPoint();

    const insertNewEndPoint = async () => {

    }

    const defineCursor = async (item: LiteEndPoint) => {
        await fetchEndPoint(item);
    }


    const makeKey = (item: LiteEndPoint): string => {
        return `${item.name}-${item.timestamp}-${item.method}-${item.path}`;
    }

    return (
        <>
            <div className="column-option options border-bottom">
                <div id="left-options">
                    <Combo options={[]} />
                </div>
                <button type="button" className="button-anchor" onClick={() => insertNewEndPoint()}>New</button>
                <div id="right-options show">
                    <Combo options={endPointGroupOptions({
                    })} />
                </div>
            </div>
            <div id="actions-container">
                {endPoints.length > 0 ? (
                    endPoints.map((cursor) => (
                        <div key={makeKey(cursor)} className={`request-preview ${cursor._id == endPoint?._id && "request-selected"}`}>
                            <button className="request-link" title={cursor.path}
                                onClick={() => defineCursor(cursor)}>
                                <div className="request-sign">
                                    <span className={`request-sign-method ${cursor.method}`}>{cursor.method}</span>
                                    <span className="request-sign-url">{cursor.path}</span>
                                </div>
                                <div className="request-sign-date">
                                    <span className="request-sign-timestamp" title={millisecondsToDate(cursor.timestamp)}>{millisecondsToDate(cursor.timestamp)}</span>
                                </div>
                            </button>
                            <Combo options={endPointOptions(cursor, {
                            })} />
                        </div>
                    ))
                ) : (
                    <p className="no-data"> - No history found - </p>
                )}
            </div>
        </>
    );
}