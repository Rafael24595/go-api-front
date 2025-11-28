import { ChangeEvent, useEffect, useState } from 'react';
import { HTTP_METHODS, httpStatusDescriptions } from '../../../../../constants/HttpMethod';
import { useStoreEndPoint } from '../../../../../store/mock/StoreProviderEndPoint';
import { ResponseForm } from './response-form/ResponseForm';
import { DEFAULT_RESPONSE, emptyItemResponse, ItemResponse } from '../../../../../interfaces/mock/Response';
import { millisecondsToDate, statusCodeToCss } from '../../../../../services/Tools';
import { Combo } from '../../../../utils/combo/Combo';
import { responseOptions, statusOptions } from './Constants';
import { PositionWrapper, VerticalDragDrop } from '../../../../utils/drag/VerticalDragDrop';
import { Optional } from '../../../../../types/Optional';

import './EndPointForm.css';

interface PayloadData {
    status: boolean
    safe: boolean
    method: string
    path: string
}

export function EndPointForm() {
    const { endPoint, response, event,
        isModified, releaseEndPoint, discardEndPoint,
        updateStatus, switchSafe, updateMethod,
        updatePath, defineResponse, newResponse,
        resolveResponse, removeResponse, orderResponses } = useStoreEndPoint();

    const [data, setData] = useState<PayloadData>({
        status: endPoint.status,
        safe: endPoint.safe,
        method: endPoint.method,
        path: endPoint.path
    });

    const [responseForm, setResponseForm] = useState<boolean>(false);

    const [dragData, setDragData] = useState<Optional<ItemResponse>>(undefined);

    useEffect(() => {
        setData({
            status: endPoint.status,
            safe: endPoint.safe,
            method: endPoint.method,
            path: endPoint.path
        });
    }, [endPoint]);

    useEffect(() => {
        switch (event.reason) {
            case "new":
            case "define":
            case "fetch":
            case "discard":
                hideResponseForm();
                break;
            default:
                break;
        }
    }, [event]);

    const onStatusChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newStatus = e.target.checked;
        setData((prevData) => ({
            ...prevData,
            status: newStatus
        }));
        updateStatus(newStatus);
    }

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

    const onRequestChange = (e: ChangeEvent<HTMLInputElement>, cursor: ItemResponse) => {
        cursor.status = e.target.checked
        defineResponse(cursor);
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

    const isRequestDrag = (item: ItemResponse) => {
        if (!dragData) {
            return false
        }
        return item.name == dragData.name;
    }

    const onRequestDrag = async (item: PositionWrapper<ItemResponse>) => {
        setDragData(item.item);
    };

    const onRequestDrop = async () => {
        setDragData(undefined);
    };

    const updateOrder = async (items: PositionWrapper<ItemResponse>[]) => {
        const ordered = items.map((p) => {
            p.item.order = p.index;
            return p.item
        });

        orderResponses(ordered);
    };

    const actionDelete = (response: ItemResponse) => {
        removeResponse(response);
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
    }

    const makeEndPointTitle = (): string => {
        if (endPoint._id == "") {
            return "New End Point";
        }

        return `End Point «${endPoint.name}»`;
    }

    return (
        <>
            <div id="end-point-data-form">
                <div id="end-point-form-title-container" className="border-bottom">
                    <div className="end-point-form-fragment">
                        <input id="end-point-status" name="status" type="checkbox"
                            onChange={onStatusChange}
                            title={`${data.status ? "Enabled end-point" : "Disabled end-point"}`}
                            checked={data.status} />
                        <p id="end-point-form-title">{makeEndPointTitle()}:</p>
                    </div>
                    <button id="end-point-form-safe" className="flat-button flat-emoji"
                        onClick={onSafeChange}
                        title={`${data.safe ? "Safe end-point" : "Unsafe end-point"}`}>{data.safe ? "🔒" : "🔓"}</button>
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
                        <input id="end-point-name" className="end-point-form-input" name="name" type="text"
                            placeholder="name"
                            value={data.path}
                            autoComplete="on"
                            onChange={onPathChange} />
                    </label>
                </div>
                <div className="end-point-form-fragment">

                </div>
            </div>
            <div id="end-point-responses-form">
                <div id="end-point-form-title-container" className="border-bottom">
                    {responseForm ? (
                        <>
                            <div className="end-point-sign-status">
                                <input id={`end-point-status-${response.order}`} className="end-point-response-status title" name="status" type="checkbox"
                                    onChange={(e) => onRequestChange(e, response)}
                                    title={`${response.status ? "Enabled response" : "Disabled response"}`}
                                    checked={response.status} />
                                <p id="end-point-form-title">Response «{response.name}»:</p>
                            </div>
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
                        <ResponseForm />
                    ) : (
                        <VerticalDragDrop
                            id="end-point-responses"
                            items={endPoint.responses}
                            itemId={makeResponseKey}
                            onItemDrag={onRequestDrag}
                            onItemDrop={onRequestDrop}
                            onItemsChange={updateOrder}
                            renderItem={(cursor) => (
                                <div key={makeResponseKey(cursor)} className={`end-point-response ${isRequestDrag(cursor) && "node-request-drag"}`}>
                                    <div className="end-point-sign-status">
                                        <input id={`end-point-status-${cursor.order}`} name="status" type="checkbox"
                                            className={`end-point-response-status ${cursor.name == DEFAULT_RESPONSE ? "hide" : ""}`}
                                            onChange={(e) => onRequestChange(e, cursor)}
                                            title={`${cursor.status ? "Enabled response" : "Disabled response"}`}
                                            checked={cursor.status} />
                                        <button className="request-link border-bottom" type="button" onClick={() => showResponseForm(cursor)}>
                                            <div className="response-sign">
                                                <span className={`response-sign-code ${statusCodeToCss(cursor.code)}`}
                                                    title={httpStatusDescriptions.get(cursor.code) || ""}>{cursor.code}</span>
                                                <span className="response-sign-name">{cursor.name}</span>
                                            </div>
                                            <div className="request-sign-date">
                                                <span className="request-sign-timestamp"
                                                    title={millisecondsToDate(cursor.timestamp)}>{millisecondsToDate(cursor.timestamp)}</span>
                                            </div>
                                        </button>
                                    </div>
                                    <Combo options={responseOptions(cursor, {
                                        delete: actionDelete, rename: actionRename
                                    })} />
                                </div>
                            )}
                            emptyTemplate={(
                                <p className="no-data"> - No history found - </p>
                            )}
                        />
                    )}
                </div>
            </div>
            <div id="client-buttons" className="border-top">
                <span className="button-modified-status"></span>
                <button type="submit" onClick={actionReleaseEndPoint}>Save</button>
                <div className={`button-modified-container ${isModified() ? "visible" : ""}`}>
                    <Combo
                        custom={(
                            <span className={`button-modified-status ${isModified() ? "visible" : ""}`}></span>
                        )}
                        options={statusOptions({
                            discard: actionDiscardEndPoint, release: actionReleaseEndPoint
                        })}
                    />
                </div>
            </div>
        </>
    );
}

const makeResponseKey = (item: ItemResponse): string => {
    return `${item.timestamp}-${item.name}-${item.code}`;
}
