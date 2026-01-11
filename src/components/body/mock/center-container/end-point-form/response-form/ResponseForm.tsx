
import { Fragment, useEffect, useState } from 'react';
import { KeyValue } from '../../../../../../interfaces/KeyValue';
import { useStoreStatus } from '../../../../../../store/StoreProviderStatus';
import { ArgumentArguments } from './argument-arguments/ArgumentArguments';
import { DEFAULT_RESPONSE, ItemResponse } from '../../../../../../interfaces/mock/Response';
import { ConditionArguments } from './condition-arguments/ConditionArguments';
import { ImportConditionsModal } from '../../../../../mock/endpoint/response/ImportConditionsModal';
import { DataArguments } from './data-arguments/DataArguments';
import { useStoreEndPoint } from '../../../../../../store/mock/endpoint/StoreProviderEndPoint';
import { BodyArguments } from './body-arguments/BodyArguments';
import { Formattable, findFormatter } from '../../../../../../services/mock/Constants';
import { Combo } from '../../../../../utils/combo/Combo';
import { responseConditionOptions } from './Constants';
import { calculateWindowSize } from '../../../../../../services/Utils';
import { useStoreTheme } from '../../../../../../store/theme/StoreProviderTheme';
import { CodeArea } from '../../../../../utils/code-area/CodeArea';
import { bridgeStepToCondition } from '../../../../../../services/api/ServiceEndPoint';

import './ResponseForm.css';

const VIEW_CONDITION = "condition";
const VIEW_DATA = "data";
const VIEW_ARGUMENT = "argument";
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
        key: VIEW_ARGUMENT,
        value: "Arguments",
    },
    {
        key: VIEW_BODY,
        value: "Body",
    },
];

const DEFAULT_CURSOR = VIEW_DATA;

const CURSOR_KEY = "EndPointResponseForm";

interface Payload {
    cursor: string
    options: KeyValue[]
}

const filterCursors = (cursor: KeyValue, response: ItemResponse) => {
    if (response.name != DEFAULT_RESPONSE) {
        return true;
    }

    if (cursor.key == VIEW_CONDITION) {
        return false;
    }

    return true;
}

export function ResponseForm() {
    const { find, store } = useStoreStatus();
    const { loadThemeWindow } = useStoreTheme();

    const { response, defineResponse } = useStoreEndPoint();

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

    const submitImportConditionModal = () => {
        closeImportConditionModal();
    }

    const closeImportConditionModal = () => {
        setModalConditionStatus(false);
    };

    const exportSteps = async (item?: ItemResponse) => {
        const curl = await bridgeStepToCondition((item || response).condition);
        const { width, height } = calculateWindowSize(curl, {
            minWidth: 550,
            minHeight: 200
        });
        loadThemeWindow(width, height, <CodeArea code={curl} />);
    }

    const cleanSteps = () => {
        const newResponse = { ...response };
        newResponse.condition = [];
        defineResponse(newResponse);
    };

    const showFormat = () => {
        return cursorData.cursor == VIEW_BODY &&
            Formattable.includes(response.body.content_type);
    };

    const formatPayload = async () => {
        const formatter = findFormatter(response.body.content_type);
        if (!formatter) {
            return;
        }

        const newResponse = { ...response };
        newResponse.body.payload = await formatter(newResponse.body.payload);

        defineResponse(newResponse);
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
                            <Combo custom={(
                                <span>⚙️</span>
                            )} options={responseConditionOptions({
                                importSteps: openImportConditionModal,
                                cleanSteps: cleanSteps,
                                exportSteps: exportSteps
                            })} />
                        </div>
                    )}
                    {showFormat() && (
                        <div className="radio-button-group aux-group">
                            <button type="button" className="button-tag" onClick={formatPayload}>Format</button>
                        </div>
                    )}
                </div>
                {response.name != DEFAULT_RESPONSE && (
                    <div className={`client-argument-content-items ${cursorData.cursor === VIEW_CONDITION ? "show" : ""}`}>
                        <ConditionArguments />
                    </div>
                )}
                <div className={`client-argument-content-items ${cursorData.cursor === VIEW_DATA ? "show" : ""}`}>
                    <DataArguments />
                </div>
                <div className={`client-argument-content-items ${cursorData.cursor === VIEW_ARGUMENT ? "show" : ""}`}>
                    <ArgumentArguments />
                </div>
                <div className={`client-argument-content-items ${cursorData.cursor === VIEW_BODY ? "show" : ""}`}>
                    <BodyArguments />
                </div>
            </div>
            <ImportConditionsModal
                isOpen={modalConditionStatus}
                onSubmit={submitImportConditionModal}
                onClose={closeImportConditionModal} />
        </>
    );
}