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

export function EndPointForm() {
    const { endPoint, response, event, isModified: isEndPointModified, releaseEndPoint, discardEndPoint, switchSafe, updateMethod, updatePath, defineResponse, newResponse, resolveResponse } = useStoreEndPoint();

    const [data, setData] = useState<PayloadData>({
        safe: endPoint.safe,
        method: endPoint.method,
        path: endPoint.path
    });

    const [responseForm, setResponseForm] = useState<boolean>(false);

    useEffect(() => {
        setData({
            safe: endPoint.safe,
            method: endPoint.method,
            path: endPoint.path
        });
    }, [endPoint]);

    useEffect(() => {
        switch (event.reason) {
            case "new":
            case "fetch":
            case "discard":
                hideResponseForm();
                break;
            default:
                break;
        }
    }, [event]);

    const onSafeChange = () => {
        setData((prevData) => ({
            ...prevData,
            safe: !prevData.safe
        }));
        switchSafe();
    }

    const onMethodChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const method = e.target.value;
        setData((prevData) => ({
            ...prevData,
            method: method
        }));
        updateMethod(method);
    }

    const onPathChange = (e: ChangeEvent<HTMLInputElement>) => {
        const path = e.target.value;
        setData((prevData) => ({
            ...prevData,
            path: path
        }));
        updatePath(path);
    }

    const hideResponseForm = () => {
        setResponseForm(false);
    }

    const showResponseForm = (cursor: ItemResponse) => {
        defineResponse(cursor || emptyItemResponse());
        setResponseForm(true);
    }

    const showNewResponseForm = () => {
        if (!newResponse()) {
            return;
        }

        setResponseForm(true);
    }

    const actionDelete = (response: ItemResponse) => {

    }

    const actionRename = (response: ItemResponse) => {
        resolveResponse(response, true);
    }

    const actionDiscardEndPoint = () => {
        discardEndPoint();
        hideResponseForm();
    }

    const actionReleaseEndPoint = () => {
        releaseEndPoint();
        hideResponseForm();
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
                    <button id="end-point-form-safe" className="flat-button flat-emoji" onClick={onSafeChange} title={`${data.safe ? "Safe request" : "Unsafe request"}`}>{data.safe ? "🔒" : "🔓"}</button>
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
                    {responseForm ? (
                        <>
                            <p id="end-point-form-title">Response {response.name}:</p>
                            <div id="end-point-reponse-buttons">
                                <button className="button-tag" type="button" onClick={hideResponseForm}>Close</button>
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
                    {responseForm ? (
                        <>
                            <ResponseForm />
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
            </div>
            <div id="client-buttons" className="border-top">
                <span className="button-modified-status"></span>
                <button type="submit" onClick={actionReleaseEndPoint}>Save</button>
                <div className={`button-modified-container ${isEndPointModified() ? "visible" : ""}`}>
                    <Combo
                        custom={(
                            <span className={`button-modified-status ${isEndPointModified() ? "visible" : ""}`}></span>
                        )}
                        options={[
                            {
                                icon: "🧹",
                                label: "Discard",
                                title: "Discard end-point",
                                action: actionDiscardEndPoint
                            },
                            {
                                icon: "💾",
                                label: "Save",
                                title: "Save end-point",
                                action: actionReleaseEndPoint
                            },
                        ]}
                    />
                </div>
            </div>
        </>
    );
}