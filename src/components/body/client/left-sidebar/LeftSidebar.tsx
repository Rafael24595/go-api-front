import { useImperativeHandle, useRef, useState } from 'react';
import { HistoricColumn, HistoricColumnMethods } from './historic-column/HistoricColumn';
import { StoredColumn } from './stored-column/StoredColumn';
import { CollectionColumn } from './collection-column/CollectionColumn';
import { Request } from '../../../../interfaces/request/Request';

import './LeftSidebar.css';

const VIEW_HISTORIC = "historic";
const VIEW_STORED = "stored";
const VIEW_COLLECTION = "collection";

const VALID_CURSORS = [VIEW_HISTORIC, VIEW_STORED, VIEW_COLLECTION];

const DEFAULT_CURSOR = VIEW_HISTORIC;

const CURSOR_KEY = "LeftSidebarCursor";

interface LeftSidebarProps {
    ref: React.RefObject<LeftSidebarMethods | null>;
    selected: string;
    defineRequest: (request: Request) => Promise<void>;
    selectRequest: (request: Request) => Promise<void>;
}

export type LeftSidebarMethods = {
    reloadView: () => void;
  };

interface Payload {
    cursor: string;
}

export function LeftSidebar({ ref, selected, defineRequest, selectRequest }: LeftSidebarProps) {
    const historicColumRef = useRef<HistoricColumnMethods>(null);
console.log(selected)
    const [data, setData] = useState<Payload>({
        cursor: getCursor(),
    });

    useImperativeHandle(ref, () => ({
        reloadView
    }));

    const reloadView = () => {
        switch (data.cursor) {
            case VIEW_HISTORIC:
                historicColumRef.current?.fetchHistoric();
            break;
            default:
                //TODO: Implement all cases.
            break;
        }
    }
        
    const cursorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCursor(e.target.value);
        setData({...data, cursor: e.target.value});
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
                {data.cursor === VIEW_HISTORIC && <HistoricColumn 
                    ref={historicColumRef}
                    selected={selected}
                    defineRequest={defineRequest}
                    selectRequest={selectRequest}/>}
                {data.cursor === VIEW_STORED && <StoredColumn
                    selected={selected}
                    defineRequest={defineRequest}
                    selectRequest={selectRequest}/>}
                {data.cursor === VIEW_COLLECTION && <CollectionColumn/>}
            </div>
        </div>
    )
}

const getCursor = () => {
    const storedValue = localStorage.getItem(CURSOR_KEY);
    return storedValue && VALID_CURSORS.includes(storedValue) ? storedValue : DEFAULT_CURSOR;
}

const setCursor = (cursor: string) => {
    localStorage.setItem(CURSOR_KEY, cursor);
}
