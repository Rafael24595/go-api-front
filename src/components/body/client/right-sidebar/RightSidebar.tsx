import { useState } from 'react';
import { formatBytes, millisecondsToTime } from '../../../../services/Tools';
import { PayloadColumn } from './payload-column/PayloadColumn';
import { HeaderColumn } from './header-column/HeaderColumn';
import { CookieColumn } from './cookie-column/CookieColumn';
import { useStoreRequest } from '../../../../store/StoreProviderRequest';
import { useStoreStatus } from '../../../../store/StoreProviderStatus';
import { httpStatusDescriptions } from '../../../../constants/HttpMethod';

import './RightSidebar.css';

const VIEW_PAYLOAD = "payload";
const VIEW_HEADER = "header";
const VIEW_COOKIE = "cookie";

const VALID_CURSORS = [VIEW_PAYLOAD, VIEW_HEADER, VIEW_COOKIE];

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
                <input type="radio" id="tag-right-sidebar-payload" className="client-tag" name="cursor-right-sidebar"
                    checked={cursor === VIEW_PAYLOAD} 
                    value={VIEW_PAYLOAD} 
                    onChange={cursorChange}/>
                <label htmlFor="tag-right-sidebar-payload">Payload</label>
                <input type="radio" id="tag-right-sidebar-stored" className="client-tag" name="cursor-right-sidebar"
                    checked={cursor === VIEW_HEADER}
                    value={VIEW_HEADER} 
                    onChange={cursorChange}/>
                <label htmlFor="tag-right-sidebar-stored">Header {response.headers.length > 0 && `(${response.headers.length})`}</label>
                <input type="radio" id="tag-right-sidebar-collection" className="client-tag" name="cursor-right-sidebar"
                    checked={cursor === VIEW_COOKIE} 
                    value={VIEW_COOKIE} 
                    onChange={cursorChange}/>
                <label htmlFor="tag-right-sidebar-collection">Cookie {response.cookies.length > 0 && `(${response.cookies.length})`}</label>
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
                {cursor === VIEW_PAYLOAD && <PayloadColumn/>}
                {cursor === VIEW_HEADER && <HeaderColumn/>}
                {cursor === VIEW_COOKIE && <CookieColumn/>}
            </div>
        </div>
    )
}
