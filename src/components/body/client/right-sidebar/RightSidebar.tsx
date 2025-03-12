import { useEffect, useState } from 'react';
import { Body, Response } from '../../../../interfaces/response/Response';
import { formatBytes, millisecondsToTime } from '../../../../services/Tools';
import { PayloadColumn } from './payload-column/PayloadColumn';
import { HeaderColumn } from './header-column/HeaderColumn';
import { CookieColumn } from './cookie-column/CookieColumn';
import { StatusKeyValue } from '../../../../interfaces/StatusKeyValue';
import { detachStatusKeyValue } from '../../../../services/Utils';
import { Cookie } from '../../../../interfaces/request/Request';

import './RightSidebar.css'

const VIEW_PAYLOAD = "payload";
const VIEW_HEADER = "header";
const VIEW_COOKIE = "cookie";

const VALID_CURSORS = [VIEW_PAYLOAD, VIEW_HEADER, VIEW_COOKIE];

const DEFAULT_CURSOR = VIEW_PAYLOAD;

const CURSOR_KEY = "RightSidebarCursor";

interface RightSidebarProps {
    response?: Response
}

interface Payload {
    cursor: string;
    status: string;
    time: number;
    size: number;
    header: StatusKeyValue[];
    cookies: Cookie[];
    body?: Body;
}

export function RightSidebar({ response }: RightSidebarProps) {
    const getCursor = () => {
        const storedValue = localStorage.getItem(CURSOR_KEY);
        return storedValue && VALID_CURSORS.includes(storedValue) ? storedValue : DEFAULT_CURSOR;
    }

    const setCursor = (cursor: string) => {
        localStorage.setItem(CURSOR_KEY, cursor);
    }

    const makeData = (): Payload => {
        return {
            cursor: getCursor(),
            status: response ? `${response.status}` : "",
            time: response ? response.time : NaN,
            size: response ? response.size : NaN,
            header: response ? detachStatusKeyValue(response.headers.headers) : [],
            cookies: response && response.cookies.cookies ? Object.values(response.cookies.cookies) : [],
            body: response ? response.body : undefined
        }
    }

    const [data, setData] = useState<Payload>(makeData());

    useEffect(() => {
        setData({ ...makeData(), cursor: data.cursor });
    }, [response]);

    const cursorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCursor(e.target.value);
        setData({...data, cursor: e.target.value});
    };

    return (
        <div id='right-sidebar'>
            <div id="response-metadata">
                <span className="section-header-element">Status: { data.status }</span>
                <span className="section-header-element">Time: { millisecondsToTime(data.time) }</span>
                <span className="section-header-element">Size: { formatBytes(data.size) }</span>
            </div>
            <div className="radio-button-group border-bottom">
                <input type="radio" id="tag-right-sidebar-payload" className="client-tag" name="cursor-right-sidebar"
                    checked={data.cursor === VIEW_PAYLOAD} 
                    value={VIEW_PAYLOAD} 
                    onChange={cursorChange}/>
                <label htmlFor="tag-right-sidebar-payload">Payload</label>
                <input type="radio" id="tag-right-sidebar-stored" className="client-tag" name="cursor-right-sidebar"
                    checked={data.cursor === VIEW_HEADER}
                    value={VIEW_HEADER} 
                    onChange={cursorChange}/>
                <label htmlFor="tag-right-sidebar-stored">Header {data.header.length > 0 && `(${data.header.length})`}</label>
                <input type="radio" id="tag-right-sidebar-collection" className="client-tag" name="cursor-right-sidebar"
                    checked={data.cursor === VIEW_COOKIE} 
                    value={VIEW_COOKIE} 
                    onChange={cursorChange}/>
                <label htmlFor="tag-right-sidebar-collection">Cookie {data.cookies.length > 0 && `(${data.cookies.length})`}</label>
            </div>
            <div id="response-container">
                {data.cursor === VIEW_PAYLOAD && <PayloadColumn body={data.body}/>}
                {data.cursor === VIEW_HEADER && <HeaderColumn header={data.header}/>}
                {data.cursor === VIEW_COOKIE && <CookieColumn cookie={data.cookies}/>}
            </div>
        </div>
    )
}