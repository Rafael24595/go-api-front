import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import { JsonView } from './json-view/JsonView';
import { TextView } from './text-view/TextView';
import { HtmlView } from './html-view/HtmlView';
import { XmlView } from './xml-view/XmlView';
import { useStoreRequest } from '../../../../../store/client/request/StoreProviderRequest';
import { useStoreStatus } from '../../../../../store/StoreProviderStatus';
import { useEffect, useState } from 'react';
import { copyTextToClipboard } from '../../../../../services/Utils';
import { useAlert } from '../../../../utils/alert/Alert';
import { EAlertCategory } from '../../../../../interfaces/AlertData';
import { formatHtml, formatJson, formatXml } from '../../../../../utils/Formatter';
import { booleanParser } from '../../../../../store/Helper';

import './PayloadColumn.css';

const STATUS_KEY = "PayloadColumnFormatStatus";
const HTML_RENDER_KEY = "PayloadColumnHtmlRender";

const VIEW_TEXT = "text";
const VIEW_JSON = "json";
const VIEW_HTML = "html";
const VIEW_XML = "xml";

export const DEFAULT_VIEW = VIEW_TEXT;

interface Payload {
    autoFormat: boolean;
    format: string;
}

interface HtmlViewPayload {
    render: boolean;
}

export function PayloadColumn() {
    const { find, store } = useStoreStatus();

    const { push } = useAlert();

    const { response } = useStoreRequest();

    const [data, setData] = useState<Payload>(() => {
        const autoFormat = find(STATUS_KEY, booleanParser());
        const format = autoFormat
            ? detectLang(response.body.payload)
            : response.body.content_type;
        return {
            autoFormat,
            format
        }
    });

    const [htmlViewData, setHtmlViewData] = useState<HtmlViewPayload>({
        render: find(HTML_RENDER_KEY, booleanParser())
    });

    useEffect(() => {
        updateFormat(data.autoFormat);
    }, [response.body.payload]);

    const copyPayloadToClipboard = async (text: string) => {
        text = await format(text);
        copyTextToClipboard(text,
            () => push({
                category: EAlertCategory.INFO,
                content: "The payload content has been copied to the clipboard"
            }),
            (err) => push({
                category: EAlertCategory.ERRO,
                content: `The payload content could not be copied to the clipboard: ${err.message}`
            }),
        );
    }

    const format = async (text: string) => {
        if (cusorIs(VIEW_TEXT)) {
            return text;
        }

        try {
            if (cusorIs(VIEW_JSON)) {
                return await formatJson(text);
            }
            if (cusorIs(VIEW_XML)) {
                return await formatXml(text);
            }
            if (cusorIs(VIEW_HTML)) {
                return await formatHtml(text);
            }
        } catch (err) {
            console.error(err);
        }

        return text;
    }

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
            : response.body.content_type;
        setData((prevData) => ({
            ...prevData,
            format
        }));
    }

    const cusorIs = (cursor: string) => {
        if (!data.autoFormat || data.format == VIEW_TEXT) {
            return response.body.content_type === cursor;
        }
        return data.format === cursor;
    }

    const switchHtmlRender = () => {
        setHtmlViewData(prevData => ({
            render: !prevData.render
        }));
    }

    return (
        <>
            <div id="response-payload-bytes">
                <div id="response-content-types">
                    {response.body.content_type == "html" ? (
                        <button className="modal-button" onClick={switchHtmlRender}>{ htmlViewData.render ? "Render" : "Plain" }</button>
                    ) : (

                        <div id="detect-container">
                            <label htmlFor="detect-format" className="select-none">Detect: </label>
                            <input
                                name="status"
                                id="detect-format"
                                type="checkbox"
                                checked={data.autoFormat}
                                onChange={autoFormatChange} />
                        </div>
                    )}
                    <span className="select-none">{viewParse(response.body.content_type)}</span>
                </div>
                {response.body.payload.length > 0 && (
                    <button
                        className="clipboard-button"
                        type="button"
                        onClick={() => copyPayloadToClipboard(response.body.payload)}>
                    </button>
                )}
                <div id="response-content-bytes" className="grid">
                    {cusorIs(VIEW_TEXT) && <TextView value={response.body.payload} />}
                    {cusorIs(VIEW_JSON) && <JsonView value={response.body.payload} />}
                    {cusorIs(VIEW_XML) && <XmlView value={response.body.payload} />}
                    {cusorIs(VIEW_HTML) && <HtmlView value={response.body.payload} render={htmlViewData.render} />}
                </div>
            </div>
        </>
    )
}

hljs.registerLanguage('json', json);
hljs.registerLanguage('xml', xml);

function detectLang(code: string) {
    const result = hljs.highlightAuto(code, ['json', 'html', 'xml']);
    return result.language || VIEW_TEXT;
}

function viewParse(view: string): string {
    switch (view) {
        case VIEW_JSON:
            return "Json"
        case VIEW_XML:
            return "Xml"
        case VIEW_HTML:
            return "Html"
        default:
            return "Text"
    }
}
