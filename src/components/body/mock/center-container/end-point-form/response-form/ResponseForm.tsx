
import { Fragment, useState } from 'react';
import { KeyValue } from '../../../../../../interfaces/KeyValue';
import { useStoreStatus } from '../../../../../../store/StoreProviderStatus';
import { HeaderArguments } from './header-arguments/HeaderArguments';
import { DEFAULT_RESPONSE, ItemResponse } from '../../../../../../interfaces/mock/Response';
import { ConditionArguments } from './condition-arguments/ConditionArguments';
import { ImportConditionsModal } from '../../../../../mock/endpoint/response/ImportConditionsModal';
import { ConditionStep } from '../../../../../../services/mock/ConditionStep';

import './ResponseForm.css';

const VIEW_CONDITION = "condition";
const VIEW_HEADER = "header";
const VIEW_BODY = "body";

const cursors: KeyValue[] = [
    {
        key: VIEW_CONDITION,
        value: "Condition",
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

const VALID_CURSORS = cursors.map(c => c.key);
const DEFAULT_CURSOR = VIEW_CONDITION;

const CURSOR_KEY = "EndPointResponseForm";

interface ResponseFormProps {
    response: ItemResponse
    resolveResponse: (response: ItemResponse) => void
}

export function ResponseForm({ response, resolveResponse }: ResponseFormProps) {
    const { find, store } = useStoreStatus();

    const [cursor, setCursor] = useState<string>(
        find(CURSOR_KEY, {
            def: DEFAULT_CURSOR,
            range: VALID_CURSORS
        }));

    const [modalConditionStatus, setModalConditionStatus] = useState<boolean>(false);

    const cursorChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
        cursorChange(e.target.value);
    };

    const cursorChange = (cursor: string) => {
        store(CURSOR_KEY, cursor);
        setCursor(cursor);
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
                        {cursors.filter(t => response.condition != DEFAULT_RESPONSE || t.key != VIEW_CONDITION).map(c => {
                            return (<Fragment key={c.key}>
                                <input type="radio" id={`tag-client-${c.key.toLowerCase()}`} className="client-tag" name="cursor-client"
                                    checked={cursor === c.key}
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
                    {cursor === VIEW_CONDITION && (
                        <div className="radio-button-group aux-group">
                            <button type="button" className="button-tag" onClick={openImportConditionModal}>Import</button>
                        </div>
                    )}
                </div>
                {response.condition != DEFAULT_RESPONSE && (
                    <div className={`client-argument-content-items ${cursor === VIEW_CONDITION ? "show" : ""}`}>
                        <ConditionArguments response={response} resolveResponse={resolveResponse} />
                    </div>
                )}
                <div className={`client-argument-content-items ${cursor === VIEW_HEADER ? "show" : ""}`}>
                    <HeaderArguments response={response} resolveResponse={resolveResponse} />
                </div>
                <div className={`client-argument-content-items ${cursor === VIEW_BODY ? "show" : ""}`}>
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