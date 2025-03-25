import { JsonView } from './json-view/JsonView';
import { TextView } from './text-view/TextView';
import { HtmlView } from './html-view/HtmlView';
import { useStoreRequest } from '../../../../../store/StoreProviderRequest';

import './PayloadColumn.css';

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

export function PayloadColumn() {
    const { response } = useStoreRequest();

    return (
        <>
            <div id="response-payload-bytes">
                <div id="response-content-types">
                    <span>{ ViewParse(response.body.content_type) }</span>
                </div>
                <div id="response-content-bytes">
                    {response.body.content_type === VIEW_TEXT && <TextView value={response.body.payload}/>}
                    {response.body.content_type === VIEW_JSON && <JsonView value={response.body.payload}/>}
                    {response.body.content_type === VIEW_HTML && <HtmlView value={response.body.payload}/>}
                </div>
            </div>
        </>
    )
}