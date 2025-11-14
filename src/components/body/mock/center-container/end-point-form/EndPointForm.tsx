import { useState } from 'react';
import { HTTP_METHODS } from '../../../../../constants/HttpMethod';
import { useStoreEndPoint } from '../../../../../store/mock/StoreProviderEndPoint';
import { ResponseForm } from './response-form/ResponseForm';
import { emptyItemResponse, ItemResponse } from '../../../../../interfaces/mock/Response';
import { millisecondsToDate } from '../../../../../services/Tools';
import { Combo } from '../../../../utils/combo/Combo';
import { responseOptions } from './Constants';

import './EndPointForm.css';

interface Payload {
    form: boolean
    cursor: ItemResponse
}

export function EndPointForm() {
    const { endPoint, resolveResponse } = useStoreEndPoint();

    const [response, setResponse] = useState<Payload>({
        form: false,
        cursor: emptyItemResponse()
    });

    const hideResponseForm = () => {
        setResponse((prevData) => ({
            ...prevData,
            form: false,
        }));
    }

    const showResponseForm = (cursor?: ItemResponse) => {
        setResponse({
            form: true,
            cursor: cursor ? {...cursor} : response.cursor
        });
    }

    const showNewResponseForm = () => {
        showResponseForm(emptyItemResponse())
    }

    const saveResponseForm = () => {
        if (!resolveResponse(response.cursor)) {
            return;
        }

        hideResponseForm();
        cleanResponseForm();
    }

    const resolveResponseForm = (response?: ItemResponse) => {
        setResponse((prevData) => ({
            ...prevData,
            cursor: response || emptyItemResponse()
        }));
    }

    const actionDelete = (response: ItemResponse) => {

    }

    const actionRename = (response: ItemResponse) => {
        resolveResponse(response, true);
    }

    const cleanResponseForm = () => {
        resolveResponseForm();
    }

    const statusToCss = (status: number) => {
        const toString = `${status}`;
        if (toString.length == 0) {
            return ""
        }
        return `c${toString[0]}xx`;
    }

    return (
        <>
            <div id="end-point-data-form">
                <div id="end-point-form-title-container" className="border-bottom">
                    <p id="end-point-form-title">End Point data:</p>
                    <label htmlFor="end-point-safe" id="end-point-form-safe">
                        <span>{endPoint.safe ? "🔒" : "🔓"}</span>
                        <input id="end-point-safe" name="safe" type="checkbox" checked={endPoint.safe} />
                    </label>
                </div>
                <div className="end-point-form-fragment">
                    <label htmlFor="end-point-method" className="end-point-form-field column">
                        <span>Method:</span>
                        <select id="end-point-method" className="end-point-form-input" name="method" value={endPoint.method}>
                            {HTTP_METHODS.map((method, index) => (
                                <option key={index} value={method}>
                                    {method}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label htmlFor="end-point-name" className="end-point-form-field column fix">
                        <span>Path:</span>
                        <input id="end-point-name" className="end-point-form-input" name="name" type="text" placeholder="name" value={endPoint.path} autoComplete="on" />
                    </label>
                </div>
                <div className="end-point-form-fragment">

                </div>
            </div>
            <div id="end-point-responses-form">
                <div id="end-point-form-title-container" className="border-bottom">
                    {response.form ? (
                        <>
                            <p id="end-point-form-title">New response:</p>
                            <div>
                                <button className="button-tag" type="button" onClick={() => saveResponseForm()}>Save</button>
                                <button className="button-tag" type="button" onClick={() => hideResponseForm()}>Close</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p id="end-point-form-title">Responses [{endPoint.responses.length}]:</p>
                            <button type="button" onClick={() => showNewResponseForm()}>+</button>
                        </>
                    )}
                </div>
                <div className="end-point-form-fragment">
                    {response.form ? (
                        <>
                            <ResponseForm response={response.cursor} resolveResponse={resolveResponseForm} />
                        </>
                    ) : (
                        <div id="end-point-responses">
                            {Object.values(endPoint.responses).map((value) => (
                                <div className="end-point-response">
                                    <button className="request-link border-bottom" type="button" onClick={() => showResponseForm(value)}>
                                        <div className="response-sign">
                                            <span className={`response-sign-status ${statusToCss(value.status)}`}>{value.status}</span>
                                            <span className="response-sign-name">{value.name}</span>
                                        </div>
                                        <div className="request-sign-date">
                                            <span className="request-sign-timestamp" title={millisecondsToDate(value.timestamp)}>{millisecondsToDate(value.timestamp)}</span>
                                        </div>
                                    </button>
                                    <Combo options={responseOptions(value, {
                                        delete: actionDelete, rename: actionRename
                                    })} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div >
        </>
    );
}