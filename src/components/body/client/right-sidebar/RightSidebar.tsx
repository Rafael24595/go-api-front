import { useState } from 'react';
import { Response } from '../../../../interfaces/response/Response';
import { formatBytes, millisecondsToTime } from '../../../../services/Tools';
import { PayloadColumn } from './payload-column/PayloadColumn';
import { HeaderColumn } from './header-column/HeaderColumn';
import { CookieColumn } from './cookie-column/CookieColumn';
import { StatusKeyValue } from '../../../../interfaces/StatusKeyValue';
import { detachStatusKeyValue } from '../../../../services/Utils';

import './RightSidebar.css'

const VIEW_PAYLOAD = "payload";
const VIEW_HEADER = "header";
const VIEW_COOKIE = "cookie";

const DEFAULT_CURSOR = VIEW_PAYLOAD;

interface RightSidebarProps {
    cursorStatus?: string;
    response?: Response
}

interface Payload {
    cursor: string;
    status: string;
    time: number;
    size: number;
    header: StatusKeyValue[];
    cookies: StatusKeyValue[];
}

export function RightSidebar({cursorStatus, response}: RightSidebarProps) {
    const [data, setData] = useState<Payload>({
        cursor: cursorStatus || DEFAULT_CURSOR,
        status: response ? `${response.status}` : "",
        time: response ? response.time : NaN,
        size: response ? response.size : NaN,
        header: response ? detachStatusKeyValue(response.headers.headers) : [],
        cookies: response ? detachStatusKeyValue(response.cookies.cookies) : []
    });

    const cursorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newData = {...data, cursor: e.target.value};
        setData(newData);
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
            <div id="request-form-options">
                {data.cursor === VIEW_PAYLOAD && <PayloadColumn/>}
                {data.cursor === VIEW_HEADER && <HeaderColumn/>}
                {data.cursor === VIEW_COOKIE && <CookieColumn/>}
            </div>
        </div>
    )
}