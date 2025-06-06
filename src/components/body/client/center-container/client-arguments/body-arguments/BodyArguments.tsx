import { useEffect, useState } from 'react';
import { TextData } from './text/TextData';
import { ItemBody, ItemBodyParameter, orderItemBodyParameter } from '../../../../../../interfaces/request/Request';
import { JsonData } from './json/JsonData';
import { useStoreRequest } from '../../../../../../store/StoreProviderRequest';
import { formatJson, formatXml } from '../../../../../../utils/Formatter';
import { FormData } from './form-data/FormData';
import { Dict } from '../../../../../../types/Dict';
import { XmlData } from './xml/XmlData';

import './BodyArguments.css';

export const DOCUMENT_PARAM = "document";
export const PAYLOAD_PARAM = "payload";
export const FORM_DATA_PARAM = "form-data";

const VIEW_TEXT = "text";
const VIEW_XML = "xml";
const VIEW_JSON = "json";
const VIEW_FORM = "form";

const DEFAULT_CURSOR = VIEW_TEXT;

//const CURSOR_KEY = "BodyArgumentsCursor";

interface Payload {
    cursor: string;
    status: boolean;
    content: string;
    parameters: Dict<ItemBodyParameter[]>;
}

export function BodyArguments() {
    //const { find, store } = useStoreStatus();

    const { request, updateBody } = useStoreRequest();

    const [data, setData] = useState<Payload>({
        cursor: request.body.content_type || DEFAULT_CURSOR,
        status: request.body.status, 
        content: request.body.content_type,
        parameters: request.body.parameters,
    });

    useEffect(() => {
        setData(prevData => ({
            ...prevData,
            cursor: request.body.content_type || DEFAULT_CURSOR,
            status: request.body.status, 
            content: request.body.content_type,
            parameters: request.body.parameters,
        }));
    }, [request.body]);
    
    const cursorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newData = {
            ...data, 
            content: e.target.value,
            cursor: e.target.value
        };
        //store(CURSOR_KEY, e.target.value);
        setData(newData);
        //TODO: Find another solution, one more elegant.
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

        if(data.cursor == VIEW_JSON) {
            document.value = await formatJson(document.value);
        }

        if(data.cursor == VIEW_XML) {
            document.value = await formatXml(document.value);
        }
           
        setData((prevData) => { 
            const newData = {
                ...prevData,
                parameters: { 
                    ...prevData.parameters, 
                    [DOCUMENT_PARAM]: [document] 
                }
            };
            updateBody(makeBody(newData));
            return newData;
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
                        onChange={statusChange}/>
                    <input type="radio" id="tag-body-text" className="client-tag" name="cursor-body" 
                        checked={data.cursor === VIEW_TEXT} 
                        value={VIEW_TEXT} 
                        onChange={cursorChange}/>
                    <label htmlFor="tag-body-text">Text</label>
                    <input type="radio" id="tag-body-xml" className="client-tag" name="cursor-body" 
                        checked={data.cursor === VIEW_XML} 
                        value={VIEW_XML}
                        onChange={cursorChange}/>
                    <label htmlFor="tag-body-xml">Xml</label>
                    <input type="radio" id="tag-body-json" className="client-tag" name="cursor-body" 
                        checked={data.cursor === VIEW_JSON} 
                        value={VIEW_JSON} 
                        onChange={cursorChange}/>
                    <label htmlFor="tag-body-json">Json</label>
                    <input type="radio" id="tag-body-form" className="client-tag" name="cursor-body" 
                        checked={data.cursor === VIEW_FORM} 
                        value={VIEW_FORM} 
                        onChange={cursorChange}/>
                    <label htmlFor="tag-body-form">Form</label>
                    </div>
                    {(data.cursor === VIEW_JSON || data.cursor === VIEW_XML) && (
                        <div>
                            <button type="button" className="button-tag" onClick={formatPayload}>Format</button>
                        </div>
                    )}
                </div>
                {data.cursor === VIEW_TEXT && <TextData onValueChange={documentChange}/>}
                {data.cursor === VIEW_XML && <XmlData onValueChange={documentChange}/>}
                {data.cursor === VIEW_JSON && <JsonData onValueChange={documentChange}/>}
                {data.cursor === VIEW_FORM && <FormData onValueChange={formDataChange}/>}
            </div>
        </>
    )
}
