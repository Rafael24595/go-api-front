import { useState } from 'react';
import { HistoricColumn } from './historic-column/HistoricColumn';
import { StoredColumn } from './stored-column/StoredColumn';
import { CollectionColumn } from './collection-column/CollectionColumn';

import './LeftSidebar.css';

export const VIEW_HISTORIC = "historic";
export const VIEW_STORED = "stored";
export const VIEW_COLLECTION = "collection";

const VALID_CURSORS = [VIEW_HISTORIC, VIEW_STORED, VIEW_COLLECTION];

const DEFAULT_CURSOR = VIEW_HISTORIC;

const CURSOR_KEY = "LeftSidebarCursor";

interface Payload {
    cursor: string;
}

export function LeftSidebar() {
    const [data, setData] = useState<Payload>({
        cursor: findCursor(),
    });
        
    const cursorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCursor(e.target.value);
    };

    const setCursor = (cursor: string) => {
        storeCursor(cursor);
        setData({...data, cursor: cursor});
    };

    return (
        <div id='left-sidebar'>
            <div className="radio-button-group cover border-bottom">
                <input type="radio" id="tag-left-sidebar-historic" className="client-tag" name="cursor-left-sidebar"
                    checked={data.cursor === VIEW_HISTORIC} 
                    value={VIEW_HISTORIC} 
                    onChange={cursorChange}/>
                <label htmlFor="tag-left-sidebar-historic">Historic</label>
                <input type="radio" id="tag-left-sidebar-stored" className="client-tag" name="cursor-left-sidebar"
                    checked={data.cursor === VIEW_STORED} 
                    value={VIEW_STORED} 
                    onChange={cursorChange}/>
                <label htmlFor="tag-left-sidebar-stored">Stored</label>
                <input type="radio" id="tag-left-sidebar-collection" className="client-tag" name="cursor-left-sidebar"
                    checked={data.cursor === VIEW_COLLECTION} 
                    value={VIEW_COLLECTION} 
                    onChange={cursorChange}/>
                <label htmlFor="tag-left-sidebar-collection">Collection</label>
            </div>
            <div id="request-form-options">
                {data.cursor === VIEW_HISTORIC && <HistoricColumn setCursor={setCursor}/>}
                {data.cursor === VIEW_STORED && <StoredColumn/>}
                {data.cursor === VIEW_COLLECTION && <CollectionColumn/>}
            </div>
        </div>
    )
}

const findCursor = () => {
    const storedValue = localStorage.getItem(CURSOR_KEY);
    return storedValue && storedValue in VALID_CURSORS ? storedValue : DEFAULT_CURSOR;
}

const storeCursor = (cursor: string) => {
    localStorage.setItem(CURSOR_KEY, cursor);
}
