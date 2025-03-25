import { useState } from 'react';
import { formatBytes, millisecondsToTime } from '../../../../services/Tools';
import { PayloadColumn } from './payload-column/PayloadColumn';
import { HeaderColumn } from './header-column/HeaderColumn';
import { CookieColumn } from './cookie-column/CookieColumn';
import { useStoreRequest } from '../../../../store/StoreProviderRequest';

import './RightSidebar.css'

const VIEW_PAYLOAD = "payload";
const VIEW_HEADER = "header";
const VIEW_COOKIE = "cookie";

const VALID_CURSORS = [VIEW_PAYLOAD, VIEW_HEADER, VIEW_COOKIE];

const DEFAULT_CURSOR = VIEW_PAYLOAD;

const CURSOR_KEY = "RightSidebarCursor";

export function RightSidebar() {
    const { response } = useStoreRequest();

    const [cursor, setCursor] = useState<string>(getCursor());

    const cursorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        storeCursor(e.target.value);
        setCursor(e.target.value);
    };

    return (
        <div id='right-sidebar'>
            <div id="response-metadata">
                <span className="section-header-element">Status: { response.status }</span>
                <span className="section-header-element">Time: { millisecondsToTime(response.time) }</span>
                <span className="section-header-element">Size: { formatBytes(response.size) }</span>
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
                {cursor === VIEW_PAYLOAD && <PayloadColumn/>}
                {cursor === VIEW_HEADER && <HeaderColumn/>}
                {cursor === VIEW_COOKIE && <CookieColumn/>}
            </div>
        </div>
    )
}

const getCursor = () => {
    const storedValue = localStorage.getItem(CURSOR_KEY);
    return storedValue && VALID_CURSORS.includes(storedValue) ? storedValue : DEFAULT_CURSOR;
}

const storeCursor = (cursor: string) => {
    localStorage.setItem(CURSOR_KEY, cursor);
}
