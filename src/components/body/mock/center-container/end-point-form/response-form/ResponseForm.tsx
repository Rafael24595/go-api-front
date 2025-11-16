
import { Fragment, useEffect, useState } from 'react';
import { KeyValue } from '../../../../../../interfaces/KeyValue';
import { useStoreStatus } from '../../../../../../store/StoreProviderStatus';
import { HeaderArguments } from './header-arguments/HeaderArguments';
import { DEFAULT_RESPONSE, ItemResponse } from '../../../../../../interfaces/mock/Response';
import { ConditionArguments } from './condition-arguments/ConditionArguments';
import { ImportConditionsModal } from '../../../../../mock/endpoint/response/ImportConditionsModal';
import { ConditionStep } from '../../../../../../services/mock/ConditionStep';
import { DataArguments } from './data-arguments/DataArguments';
import { useStoreEndPoint } from '../../../../../../store/mock/StoreProviderEndPoint';

import './ResponseForm.css';

const VIEW_CONDITION = "condition";
const VIEW_DATA = "data";
const VIEW_HEADER = "header";
const VIEW_BODY = "body";

const cursors: KeyValue[] = [
    {
        key: VIEW_CONDITION,
        value: "Condition",
    },
    {
        key: VIEW_DATA,
        value: "Data",
    },
    {
        key: VIEW_HEADER,
        value: "Headers",
    },
    {
        key: VIEW_BODY,
        value: "Body",
    },
];

const DEFAULT_CURSOR = VIEW_DATA;

const CURSOR_KEY = "EndPointResponseForm";


const filterCursors = (cursor: KeyValue, response: ItemResponse) => {
    if (response.name != DEFAULT_RESPONSE) {
        return true;
    }

    if (cursor.key == VIEW_CONDITION) {
        return false;
    }

    return true;
}

interface Payload {
    cursor: string
    options: KeyValue[]

}

export function ResponseForm() {
    const { find, store } = useStoreStatus();

    const { response } = useStoreEndPoint();

    const makePayload = (response: ItemResponse): Payload => {
        const options = cursors.filter(c => filterCursors(c, response));

        const cursor = find(CURSOR_KEY, {
            def: DEFAULT_CURSOR,
            range: options.map(c => c.key),
            strict: true
        });

        return { cursor, options };
    }

    const [cursorData, setCursorData] = useState<Payload>(() => makePayload(response));

    const [modalConditionStatus, setModalConditionStatus] = useState<boolean>(false);

    useEffect(() => {
        setCursorData(makePayload(response))
    }, [response]);

    const cursorChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
        cursorChange(e.target.value);
    };

    const cursorChange = (cursor: string) => {
        store(CURSOR_KEY, cursor);
        setCursorData((prevData) => ({
            ...prevData,
            cursor: cursor
        }));
    };

    const openImportConditionModal = () => {
        setModalConditionStatus(true);
    };

    const submitImportConditionModal = (steps: ConditionStep[]) => {
        closeImportConditionModal();
    }

    const closeImportConditionModal = () => {
        setModalConditionStatus(false);
    };

    return (
        <>
            <div id="mock-form-section">
                <div id="parameter-selector-components" className="border-bottom">
                    <div className="radio-button-group">
                        {cursorData.options.filter(t => response.name != DEFAULT_RESPONSE || t.key != VIEW_CONDITION).map(c => {
                            return (<Fragment key={c.key}>
                                <input type="radio" id={`tag-client-${c.key.toLowerCase()}`} className="client-tag" name="cursor-client"
                                    checked={cursorData.cursor === c.key}
                                    value={c.key}
                                    onChange={cursorChangeEvent} />
                                <button
                                    type="button"
                                    className="button-tag"
                                    onClick={() => cursorChange(c.key)}>
                                    {c.value}
                                </button>
                            </Fragment>)
                        })}
                    </div>
                    {cursorData.cursor === VIEW_CONDITION && (
                        <div className="radio-button-group aux-group">
                            <button type="button" className="button-tag" onClick={openImportConditionModal}>Import</button>
                        </div>
                    )}
                </div>
                {response.name != DEFAULT_RESPONSE && (
                    <div className={`client-argument-content-items ${cursorData.cursor === VIEW_CONDITION ? "show" : ""}`}>
                        <ConditionArguments />
                    </div>
                )}
                <div className={`client-argument-content-items ${cursorData.cursor === VIEW_DATA ? "show" : ""}`}>
                    <DataArguments/>
                </div>
                <div className={`client-argument-content-items ${cursorData.cursor === VIEW_HEADER ? "show" : ""}`}>
                    <HeaderArguments/>
                </div>
                <div className={`client-argument-content-items ${cursorData.cursor === VIEW_BODY ? "show" : ""}`}>
                    <p>TODO:</p>
                </div>
            </div>
            <ImportConditionsModal
                isOpen={modalConditionStatus}
                onSubmit={submitImportConditionModal}
                onClose={closeImportConditionModal} />
        </>
    );
}