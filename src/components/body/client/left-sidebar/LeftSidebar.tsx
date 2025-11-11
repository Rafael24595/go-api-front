import { Fragment, useState } from 'react';
import { HistoricColumn } from './historic-column/HistoricColumn';
import { StoredColumn } from './stored-column/StoredColumn';
import { CollectionColumn } from './collection-column/CollectionColumn';
import { useStoreStatus } from '../../../../store/StoreProviderStatus';
import { useStoreCollections } from '../../../../store/client/StoreProviderCollections';
import { KeyValue } from '../../../../interfaces/KeyValue';

import './LeftSidebar.css';

export const VIEW_HISTORIC = "historic";
export const VIEW_STORED = "stored";
export const VIEW_COLLECTION = "collection";

const cursors: KeyValue[] = [
    {
        key: VIEW_HISTORIC,
        value: "Historic",
    },
    {
        key: VIEW_STORED,
        value: "Stored",
    },
    {
        key: VIEW_COLLECTION,
        value: "Collection",
    }
];

const VALID_CURSORS = cursors.map(c => c.key);
const DEFAULT_CURSOR = VIEW_HISTORIC;

const CURSOR_KEY = "ClientLeftSidebarCursor";

export function LeftSidebar() {
    const { find, store } = useStoreStatus();
    const { fetchHistoric, fetchStored, fetchCollection, fetchAll } = useStoreCollections();

    const [cursor, setCursor] = useState<string>(
        find(CURSOR_KEY, {
            def: DEFAULT_CURSOR,
            range: VALID_CURSORS
        }));

    const cursorChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
        cursorChange(e.target.value);
    };

    const cursorChange = (cursor: string) => {
        store(CURSOR_KEY, cursor);

        switch (cursor) {
            case VIEW_HISTORIC:
                fetchHistoric();
                break;
            case VIEW_STORED:
                fetchStored();
                break;
            case VIEW_COLLECTION:
                fetchCollection();
                break;
            default:
                fetchAll();
                break;
        }

        setCursor(cursor);
    };

    return (
        <div id="left-sidebar-client">
            <div className="radio-button-group cover border-bottom">
                {cursors.map(c => (
                    <Fragment key={c.key}>
                        <input type="radio" id={`tag-left-sidebar-client-${c.key.toLowerCase()}`} className="client-tag" name="cursor-left-sidebar"
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
            <div className={`request-form-options ${cursor === VIEW_HISTORIC ? "show" : ""}`}>
                <HistoricColumn setCursor={setCursor}/>
            </div>
            <div className={`request-form-options ${cursor === VIEW_STORED ? "show" : ""}`}>
                <StoredColumn/>
            </div>
            <div className={`request-form-options ${cursor === VIEW_COLLECTION ? "show" : ""}`}>
                <CollectionColumn/>
            </div>
        </div>
    )
}
