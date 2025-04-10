import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import { JsonView } from './json-view/JsonView';
import { TextView } from './text-view/TextView';
import { HtmlView } from './html-view/HtmlView';
import { useStoreRequest } from '../../../../../store/StoreProviderRequest';
import { useStoreStatus } from '../../../../../store/StoreProviderStatus';
import { useEffect, useState } from 'react';

import './PayloadColumn.css';

const STATUS_KEY = "PayloadColumnFormatStatus";

const VIEW_TEXT = "text";
const VIEW_JSON = "json";
const VIEW_HTML = "html";
const VIEW_XML = "xml";

export const DEFAULT_VIEW = VIEW_TEXT;

interface Payload {
    autoFormat: boolean;
    format: string;
}

export function PayloadColumn() {
    const { findOrDefault, store } = useStoreStatus();
    
    const { response } = useStoreRequest();

    const [data, setData] = useState<Payload>(() => {
        const autoFormat = findOrDefault(STATUS_KEY, {
            def: true,
            parser: (v) => v == "true"
        });
        const format = autoFormat 
            ? detectLang(response.body.payload) 
            : VIEW_TEXT;
        return {
            autoFormat,
            format
        }
    });

    useEffect(() => {
        updateFormat(data.autoFormat);
    }, [response.body.payload]);

    const autoFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateFormat(e.target.checked);
        setData((prevData) => ({
            ...prevData,
            autoFormat: e.target.checked
        }));
        store(STATUS_KEY, e.target.checked);
    }

    const updateFormat = (autoFormat: boolean) => {
        const format = autoFormat 
            ? detectLang(response.body.payload) 
            : VIEW_TEXT;
        setData((prevData) => ({
            ...prevData,
            format
        }));
    }

    const cusorIs = (cursor: string) => {
        if(!data.autoFormat || data.format == VIEW_TEXT) {
            return response.body.content_type === cursor;
        }
        return data.format === cursor;
    }

    return (
        <>
            <div id="response-payload-bytes">
                <div id="response-content-types">
                    <div id="detect-container">
                        <label htmlFor="detect-format">Detect: </label>
                        <input 
                            name="status" 
                            id="detect-format" 
                            type="checkbox" 
                            checked={data.autoFormat}
                            onChange={autoFormatChange}/>
                    </div>
                    <span>{ viewParse(response.body.content_type) }</span>
                </div>
                <div id="response-content-bytes">
                    {cusorIs(VIEW_TEXT) && <TextView value={response.body.payload}/>}
                    {cusorIs(VIEW_JSON) && <JsonView value={response.body.payload}/>}
                    {(cusorIs(VIEW_HTML) || cusorIs(VIEW_XML)) && <HtmlView value={response.body.payload}/>}
                </div>
            </div>
        </>
    )
}

hljs.registerLanguage('json', json);
hljs.registerLanguage('xml', xml);

function detectLang(code: string) {
  const result = hljs.highlightAuto(code, ['json', 'xml']);
  return result.language || VIEW_TEXT;
}

function viewParse(view: string): string {
    switch (view) {
        case VIEW_JSON:
            return "Json"
        case VIEW_XML:
            return "Html"
        default:
            return "Text"
    }
}
