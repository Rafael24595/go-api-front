import { Fragment, useState } from 'react';
import { formatBytes, millisecondsToDate, millisecondsToTime, statusCodeToCss } from '../../../../services/Tools';
import { PayloadColumn } from './payload-column/PayloadColumn';
import { HeaderColumn } from './header-column/HeaderColumn';
import { CookieColumn } from './cookie-column/CookieColumn';
import { useStoreRequest } from '../../../../store/client/request/StoreProviderRequest';
import { useStoreStatus } from '../../../../store/StoreProviderStatus';
import { httpStatusDescriptions } from '../../../../constants/HttpMethod';
import { KeyValue } from '../../../../interfaces/KeyValue';
import { useStoreSystem } from '../../../../store/system/StoreProviderSystem';
import { apiURL } from '../../../../services/api/ApiManager';

import './RightSidebar.css';

const VIEW_PAYLOAD = "payload";
const VIEW_HEADER = "header";
const VIEW_COOKIE = "cookie";

const SECRET_JS_TETRIS = "play://Rafael24595/js-tetris";

const cursors: KeyValue[] = [
    {
        key: VIEW_PAYLOAD,
        value: "Payload",
    },
    {
        key: VIEW_HEADER,
        value: "Header",
    },
    {
        key: VIEW_COOKIE,
        value: "Cookie",
    }
];

const VALID_CURSORS = cursors.map(c => c.key);
const DEFAULT_CURSOR = VIEW_PAYLOAD;

const CURSOR_KEY = "RightSidebarCursor";

export function RightSidebar() {
    const { find, store } = useStoreStatus();

    const { metadata } = useStoreSystem();
    const { request, response, waitingRequest, cancelRequest } = useStoreRequest();

    const [cursor, setCursor] = useState<string>(
        find(CURSOR_KEY, {
            def: DEFAULT_CURSOR,
            range: VALID_CURSORS
        })
    );

    const cursorChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
        cursorChange(e.target.value);
    };

    const cursorChange = (cursor: string) => {
        store(CURSOR_KEY, cursor);
        setCursor(cursor);
    };

    return (
        <div id="right-sidebar-client">
            <div id="response-metadata">
                <span className="section-header-element response-data">
                    <span 
                        className="response-title select-none">Status:</span>
                    <span 
                        className={`response-code ${statusCodeToCss(response.status)}`} 
                        title={httpStatusDescriptions.get(Number(response.status))}>{ response.status }</span>
                </span>
                <span className="section-header-element response-data"><span className="response-title select-none" title={ response.timestamp ? millisecondsToDate(response.timestamp) : "" }>Time:</span> { millisecondsToTime(response.time) }</span>
                <span className="section-header-element response-data"><span className="response-title select-none">Size:</span> { formatBytes(response.size) }</span>
            </div>
            <div className="radio-button-group border-bottom">
                {cursors.map(c => (
                    <Fragment key={c.key}>
                        <input type="radio" id={`tag-right-sidebar-${c.key.toLowerCase()}`} className="client-tag" name="cursor-right-sidebar"
                            checked={cursor === c.key} 
                            value={c.key} 
                            onChange={cursorChangeEvent}/>
                        <button
                            type="button"
                            className="button-tag"
                            onClick={() => cursorChange(c.key)}>
                            {c.value}
                        </button>
                    </Fragment>
                ))}
            </div>
            <div id="response-container">
                {waitingRequest && (
                    <div id="cancel-container">
                        <div id="cancel-buttons">
                        <span className="loader-small"></span>
                            <button type="button" className="button-anchor" onClick={cancelRequest}>Cancel</button>
                        </div>
                    </div>
                )}
                <div className={`response-container-items ${cursor === VIEW_PAYLOAD ? "show" : ""}`}>
                    { metadata.enable_secrets && request.uri == SECRET_JS_TETRIS ? (
                        <iframe
                            src={`${apiURL()}/secret/js-tetris/play`}
                            className="secret-iframe"
                        />
                    ) : (
                        <PayloadColumn/>
                    )}
                </div>
                <div className={`response-container-items ${cursor === VIEW_HEADER ? "show" : ""}`}>
                    <HeaderColumn/>
                </div>
                <div className={`response-container-items ${cursor === VIEW_COOKIE ? "show" : ""}`}>
                    <CookieColumn/>
                </div>
            </div>
        </div>
    )
}
