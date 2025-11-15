import { ChangeEvent, useEffect, useState } from 'react';
import { HTTP_METHODS } from '../../../../../constants/HttpMethod';
import { useStoreEndPoint } from '../../../../../store/mock/StoreProviderEndPoint';
import { ResponseForm } from './response-form/ResponseForm';
import { emptyItemResponse, ItemResponse } from '../../../../../interfaces/mock/Response';
import { millisecondsToDate } from '../../../../../services/Tools';
import { Combo } from '../../../../utils/combo/Combo';
import { responseOptions } from './Constants';

import './EndPointForm.css';

interface PayloadData {
    safe: boolean
    method: string
    path: string
}

interface PayloadResponse {
    form: boolean
    cursor: ItemResponse
}

export function EndPointForm() {
    const { endPoint, resolveResponse } = useStoreEndPoint();

    const [data, setData] = useState<PayloadData>({
        safe: endPoint.safe,
        method: endPoint.method,
        path: endPoint.path
    });

    const [response, setResponse] = useState<PayloadResponse>({
        form: false,
        cursor: emptyItemResponse()
    });

    useEffect(() => {
        setData({
            safe: endPoint.safe,
            method: endPoint.method,
            path: endPoint.path
        });
    }, [endPoint]);

    const onSafeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setData((prevData) => ({
            ...prevData,
            safe: e.target.checked
        }))
    }

    const onMethodChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setData((prevData) => ({
            ...prevData,
            method: e.target.value
        }))
    }

    const onPathChange = (e: ChangeEvent<HTMLInputElement>) => {
        setData((prevData) => ({
            ...prevData,
            path: e.target.value
        }))
    }

    const hideResponseForm = () => {
        setResponse((prevData) => ({
            ...prevData,
            form: false,
        }));
    }

    const showResponseForm = (cursor?: ItemResponse) => {
        setResponse({
            form: true,
            cursor: cursor ? { ...cursor } : response.cursor
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
                        <span>{data.safe ? "🔒" : "🔓"}</span>
                        <input id="end-point-safe" name="safe" type="checkbox" checked={data.safe} onChange={onSafeChange} />
                    </label>
                </div>
                <div className="end-point-form-fragment">
                    <label htmlFor="end-point-method" className="end-point-form-field column">
                        <span>Method:</span>
                        <select id="end-point-method" className="end-point-form-input" name="method" value={data.method} onChange={onMethodChange}>
                            {HTTP_METHODS.map((method, index) => (
                                <option key={index} value={method}>
                                    {method}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label htmlFor="end-point-name" className="end-point-form-field column fix">
                        <span>Path:</span>
                        <input id="end-point-name" className="end-point-form-input" name="name" type="text" placeholder="name" value={data.path} autoComplete="on" onChange={onPathChange} />
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
                            <button className="button-tag" type="button" onClick={() => showNewResponseForm()}>✚</button>
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