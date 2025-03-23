import { JsonView } from './json-view/JsonView';
import { TextView } from './text-view/TextView';
import { Body } from '../../../../../interfaces/response/Response';
import { HtmlView } from './html-view/HtmlView';
import './PayloadColumn.css'

const VIEW_TEXT = "text";
const VIEW_JSON = "json";
const VIEW_HTML = "html";

export const DEFAULT_VIEW = VIEW_TEXT;

function ViewParse(view: string): string {
    switch (view) {
        case VIEW_JSON:
            return "Json"
        case VIEW_HTML:
            return "Html"
        default:
            return "Text"
    }
}

interface PayloadColumnProps {
    body?: Body
}

interface Payload {
    status: boolean
    contentType: string
    payload: string
}

export function PayloadColumn({body}: PayloadColumnProps) {
    const data: Payload = {
        status: true,
        contentType: body ? body.content_type : DEFAULT_VIEW,
        payload: body ? body.payload : ""
    }

    return (
        <>
            <div id="response-payload-bytes">
                <div id="response-content-types">
                    <span>{ ViewParse(data.contentType) }</span>
                </div>
                <div id="response-content-bytes">
                    {data.contentType === VIEW_TEXT && <TextView value={data.payload}/>}
                    {data.contentType === VIEW_JSON && <JsonView value={data.payload}/>}
                    {data.contentType === VIEW_HTML && <HtmlView value={data.payload}/>}
                </div>
            </div>
        </>
    )
}