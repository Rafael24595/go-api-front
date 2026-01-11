import { v4 as uuidv4 } from 'uuid';
import { Fragment, useEffect, useState } from 'react';
import { findDocumentParameter, ItemBody, ItemBodyParameter, orderItemBodyParameter } from '../../../../../../interfaces/client/request/Request';
import { findFormatter } from '../../../../../../services/mock/Constants';
import { useStoreRequest } from '../../../../../../store/client/request/StoreProviderRequest';
import { FormData } from './form-data/FormData';
import { Dict } from '../../../../../../types/Dict';
import { KeyValue } from '../../../../../../interfaces/KeyValue';
import { TextData } from '../../../../../form/text-area/text/TextData';
import { XmlData } from '../../../../../form/text-area/xml/XmlData';
import { JsonData } from '../../../../../form/text-area/json/JsonData';
import { Events } from '../../../../../../types/EventAction';

import './BodyArguments.css';

export const DOCUMENT_PARAM = "document";
export const PAYLOAD_PARAM = "payload";
export const FORM_DATA_PARAM = "form-data";

const VIEW_TEXT = "text";
const VIEW_XML = "xml";
const VIEW_JSON = "json";
const VIEW_FORM = "form";

const cursors: KeyValue[] = [
    {
        key: VIEW_TEXT,
        value: "Text",
    },
    {
        key: VIEW_XML,
        value: "Xml",
    },
    {
        key: VIEW_JSON,
        value: "Json",
    },
    {
        key: VIEW_FORM,
        value: "Form",
    }
];

const DEFAULT_CURSOR = VIEW_TEXT;

interface Payload {
    key: string;
    status: boolean;
    content: string;
    parameters: Dict<ItemBodyParameter[]>;
}

export function BodyArguments() {
    const { request, event, updateBody } = useStoreRequest();

    const [cursor, setCursor] = useState<string>(request.body.content_type || DEFAULT_CURSOR);

    const [data, setData] = useState<Payload>({
        key: uuidv4(),
        status: request.body.status,
        content: request.body.content_type,
        parameters: request.body.parameters,
    });

    useEffect(() => {
        if (event.reason != Events.DEFINE && event.reason != Events.DISCARD) {
            return;
        }

        updateData();
    }, [event]);

    const updateData = (cursor?: string) => {
        setData({
            key: uuidv4(),
            status: request.body.status,
            content: request.body.content_type,
            parameters: request.body.parameters,
        });
        setCursor(cursor || request.body.content_type || DEFAULT_CURSOR);
    }

    const cursorChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
        cursorChange(e.target.value);
    };

    const cursorChange = (cursor: string) => {
        const newBody: ItemBody = {
            status: data.status,
            parameters: request.body.parameters,
            content_type: cursor,
        };

        updateData(cursor);

        if (Object.entries(request.body.parameters).length > 0) {
            updateBody(newBody);
        }
    };

    const statusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData({
            ...data,
            status: e.target.checked
        });

        updateBody({
            status: e.target.checked,
            parameters: data.parameters,
            content_type: data.content,
        });
    };

    const documentChange = (content: string, value: string) => {
        const parameter = {
            id: "",
            order: 0,
            status: true,
            isFile: false,
            fileType: "",
            fileName: "",
            key: "",
            value: value,
            focus: ""
        };

        const newParameters = { ...data.parameters };

        delete newParameters[DOCUMENT_PARAM];

        if (parameter.value != "") {
            parameter.key = PAYLOAD_PARAM;
            newParameters[DOCUMENT_PARAM] = orderItemBodyParameter([parameter]);
        }

        updateBody({
            status: data.status,
            parameters: newParameters,
            content_type: content,
        });
    }

    const formDataChange = (content: string, parameters: ItemBodyParameter[]) => {
        const newParameters = { ...data.parameters };

        delete newParameters[FORM_DATA_PARAM];

        if (parameters.length > 0) {
            newParameters[FORM_DATA_PARAM] = orderItemBodyParameter(parameters);
        }

        updateBody({
            status: data.status,
            parameters: newParameters,
            content_type: content,
        });
    }

    const formatPayload = async () => {
        const formatter = findFormatter(cursor);
        if (!formatter) {
            return;
        }

        const category = data.parameters[DOCUMENT_PARAM];
        if (!category) {
            return;
        }

        const document = category.find(p => p.key == PAYLOAD_PARAM);
        if (!document) {
            return;
        }

        document.value = await formatter(document.value);

        const newParameters = {
            ...data.parameters,
            [DOCUMENT_PARAM]: [document]
        };

        updateBody({
            status: data.status,
            parameters: newParameters,
            content_type: data.content,
        });
    }

    return (
        <>
            <div id="client-argument-content">
                <div id="body-parameters-group" className="border-bottom">
                    <div className="radio-button-group">
                        <input
                            name="status"
                            id="body-enable"
                            type="checkbox"
                            checked={data.status}
                            onChange={statusChange} />
                        {cursors.map(c => (
                            <Fragment key={c.key}>
                                <input type="radio" id={`tag-body-${c.key.toLowerCase()}`} className="client-tag" name="cursor-body"
                                    checked={cursor === c.key}
                                    value={c.key}
                                    onChange={cursorChangeEvent} />
                                <button
                                    type="button"
                                    className="button-tag"
                                    onClick={() => cursorChange(c.key)}>
                                    {c.value}
                                </button>
                            </Fragment>
                        ))}
                    </div>
                    {(cursor === VIEW_JSON || cursor === VIEW_XML) && (
                        <div className="radio-button-group aux-group">
                            <button type="button" className="button-tag" onClick={formatPayload}>Format</button>
                        </div>
                    )}
                </div>
                {cursor === VIEW_TEXT && <TextData
                    key={data.key}
                    payload={findDocumentParameter(data.parameters)}
                    onValueChange={documentChange} />}
                {cursor === VIEW_XML && <XmlData
                    key={data.key}
                    payload={findDocumentParameter(data.parameters)}
                    onValueChange={documentChange} />}
                {cursor === VIEW_JSON && <JsonData
                    key={data.key}
                    payload={findDocumentParameter(data.parameters)}
                    onValueChange={documentChange} />}
                {cursor === VIEW_FORM && <FormData
                    key={data.key}
                    onValueChange={formDataChange} />}
            </div>
        </>
    )
}
