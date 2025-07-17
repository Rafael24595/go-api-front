import { Fragment, useState } from 'react';
import { formatBytes, millisecondsToTime } from '../../../../services/Tools';
import { PayloadColumn } from './payload-column/PayloadColumn';
import { HeaderColumn } from './header-column/HeaderColumn';
import { CookieColumn } from './cookie-column/CookieColumn';
import { useStoreRequest } from '../../../../store/StoreProviderRequest';
import { useStoreStatus } from '../../../../store/StoreProviderStatus';
import { httpStatusDescriptions } from '../../../../constants/HttpMethod';
import { KeyValue } from '../../../../interfaces/KeyValue';

import './RightSidebar.css';

const VIEW_PAYLOAD = "payload";
const VIEW_HEADER = "header";
const VIEW_COOKIE = "cookie";

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

    const { response, waitingRequest, cancelRequest } = useStoreRequest();

    const [cursor, setCursor] = useState<string>(
        find(CURSOR_KEY, {
            def: DEFAULT_CURSOR,
            range: VALID_CURSORS
        })
    );

    const cursorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        store(CURSOR_KEY, e.target.value);
        setCursor(e.target.value);
    };

    const statusToCss = (status: string) => {
        if(status.length == 0) {
            return ""
        }
        return `c${status[0]}xx`;
      }

    return (
        <div id='right-sidebar'>
            <div id="response-metadata">
                <span className="section-header-element response-data">
                    <span 
                        className="response-title select-none">Status:</span>
                    <span 
                        className={`response-code ${statusToCss(response.status)}`} 
                        title={httpStatusDescriptions.get(Number(response.status))}>{ response.status }</span>
                </span>
                <span className="section-header-element response-data"><span className="response-title select-none">Time:</span> { millisecondsToTime(response.time) }</span>
                <span className="section-header-element response-data"><span className="response-title select-none">Size:</span> { formatBytes(response.size) }</span>
            </div>
            <div className="radio-button-group border-bottom">
                {cursors.map(c => (
                    <Fragment key={c.key}>
                        <input type="radio" id={`tag-right-sidebar-${c.key.toLowerCase()}`} className="client-tag" name="cursor-right-sidebar"
                            checked={cursor === c.key} 
                            value={c.key} 
                            onChange={cursorChange}/>
                        <label htmlFor={`tag-right-sidebar-${c.key.toLowerCase()}`}>{c.value}</label>
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
                    <PayloadColumn/>
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
