import { Fragment } from 'react';
import { EndPointColumn } from './end-point-column/historic-column/EndPointColumn';
import { useStoreMock } from '../../../../store/mock/StoreProviderMock';
import { MOCK_CURSORS, VIEW_END_POINTS } from '../MockBody';

import './LeftSidebar.css';

interface LeftSidebarProps {
    cursor: string;
    cursorChange: (cursor: string) => void;
}

export function LeftSidebar({ cursor, cursorChange }: LeftSidebarProps) {
    const { fetchAll, fetchEndPoints } = useStoreMock();

    const onCursorChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cursor = e.target.value;
        onCursorChange(cursor);
    };

    const onCursorChange = (cursor: string) => {
        switch (cursor) {
            case VIEW_END_POINTS:
                fetchEndPoints();
                break;
            default:
                fetchAll();
                break;
        }

        cursorChange(cursor);
    };

    return (
        <div id="left-sidebar-mock">
            <div className="radio-button-group cover border-bottom">
                {MOCK_CURSORS.map(c => (
                    <Fragment key={c.key}>
                        <input type="radio" id={`tag-left-sidebar-mock-${c.key.toLowerCase()}`} className="client-tag" name="cursor-left-sidebar"
                            checked={cursor === c.key}
                            value={c.key}
                            onChange={onCursorChangeEvent} />
                        <button
                            type="button"
                            className="button-tag"
                            onClick={() => cursorChange(c.key)}>
                            {c.value}
                        </button>
                    </Fragment>
                ))}
            </div>
            <div className={`mock-selector-preview-option ${cursor === VIEW_END_POINTS ? "show" : ""}`}>
                <EndPointColumn setCursor={onCursorChange} />
            </div>
        </div>
    )
}
