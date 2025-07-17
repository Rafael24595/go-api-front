import { Fragment, useEffect, useState } from 'react';
import { TextData } from './text/TextData';
import { ItemBody, ItemBodyParameter, orderItemBodyParameter } from '../../../../../../interfaces/request/Request';
import { JsonData } from './json/JsonData';
import { useStoreRequest } from '../../../../../../store/StoreProviderRequest';
import { formatJson, formatXml } from '../../../../../../utils/Formatter';
import { FormData } from './form-data/FormData';
import { Dict } from '../../../../../../types/Dict';
import { XmlData } from './xml/XmlData';
import { KeyValue } from '../../../../../../interfaces/KeyValue';

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
    status: boolean;
    content: string;
    parameters: Dict<ItemBodyParameter[]>;
}

export function BodyArguments() {
    const { request, updateBody } = useStoreRequest();

    const [cursor, setCursor] = useState<string>(request.body.content_type || DEFAULT_CURSOR);

    const [data, setData] = useState<Payload>({
        status: request.body.status, 
        content: request.body.content_type,
        parameters: request.body.parameters,
    });

    useEffect(() => {
        setData({
            status: request.body.status, 
            content: request.body.content_type,
            parameters: request.body.parameters,
        });
        setCursor(request.body.content_type || DEFAULT_CURSOR);
    }, [request.body]);
    
    const cursorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newData = {
            ...data, 
            content: e.target.value,
        };
        
        setCursor(e.target.value);
        setData(newData);

        if(Object.entries(request.body.parameters).length > 0) {
            updateBody(makeBody(newData));
        }
    };

    const statusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newData = {
            ...data, 
            status: e.target.checked
        };
        setData(newData);
        updateBody(makeBody(newData));
    };

    const documentChange = (content: string, document: ItemBodyParameter) => {
        const newParameters = { ...data.parameters };

        delete newParameters[DOCUMENT_PARAM];
        
        if (document.value != "") {
            document.key = PAYLOAD_PARAM;
            newParameters[DOCUMENT_PARAM] = orderItemBodyParameter([document]);
        }

        const newData = {
            ...data,
            content: content,
            parameters: newParameters
        };

        setData(newData);
        updateBody(makeBody(newData));
    }

    const formDataChange = (content: string, parameters: ItemBodyParameter[]) => {
        const newParameters = { ...data.parameters };

        newParameters[FORM_DATA_PARAM] = orderItemBodyParameter(parameters);

        const newData = {
            ...data,
            content: content,
            parameters: newParameters
        };

        setData(newData);
        updateBody(makeBody(newData));
    }

    const makeBody = (payload: Payload): ItemBody => {
        return {
            status: payload.status,
            content_type: payload.content,
            parameters: payload.parameters
        };
    }

    const formatPayload = async () => {
        let category = data.parameters[DOCUMENT_PARAM];
        if(!category) {
            return;
        }

        let document = category.find(p => p.key == PAYLOAD_PARAM);
        if(!document) {
            return;
        }

        if(cursor == VIEW_JSON) {
            document.value = await formatJson(document.value);
        }

        if(cursor == VIEW_XML) {
            document.value = await formatXml(document.value);
        }

        const newData = {
            ...data,
            parameters: {
                ...data.parameters,
                [DOCUMENT_PARAM]: [document]
            }
        };
           
        setData(newData);
        updateBody(makeBody(newData));
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
                        onChange={statusChange}/>
                    {cursors.map(c => (
                        <Fragment key={c.key}>
                            <input type="radio" id={`tag-body-${c.key.toLowerCase()}`} className="client-tag" name="cursor-body"
                                checked={cursor === c.key} 
                                value={c.key} 
                                onChange={cursorChange}/>
                            <label htmlFor={`tag-body-${c.key.toLowerCase()}`}>{c.value}</label>
                        </Fragment>
                    ))}
                    </div>
                    {(cursor === VIEW_JSON || cursor === VIEW_XML) && (
                        <div>
                            <button type="button" className="button-tag" onClick={formatPayload}>Format</button>
                        </div>
                    )}
                </div>
                {cursor === VIEW_TEXT && <TextData onValueChange={documentChange}/>}
                {cursor === VIEW_XML && <XmlData onValueChange={documentChange}/>}
                {cursor === VIEW_JSON && <JsonData onValueChange={documentChange}/>}
                {cursor === VIEW_FORM && <FormData onValueChange={formDataChange}/>}
            </div>
        </>
    )
}
