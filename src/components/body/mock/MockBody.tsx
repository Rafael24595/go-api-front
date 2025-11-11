import { useState } from 'react';
import { KeyValue } from '../../../interfaces/KeyValue';
import { useStoreStatus } from '../../../store/StoreProviderStatus';
import { LeftSidebar } from './left-sidebar/LeftSidebar'
import './MockBody.css'
import { ContentContainer } from './center-container/ContentContainer';
import { RightSidebar } from './right-sidebar/RightSidebar';

export const VIEW_END_POINTS = "endpoint";

export const MOCK_CURSORS: KeyValue[] = [
    {
        key: VIEW_END_POINTS,
        value: "End Point",
    }
];

const VALID_CURSORS = MOCK_CURSORS.map(c => c.key);
const DEFAULT_CURSOR = VIEW_END_POINTS;

const CURSOR_KEY = "MockLeftSidebarCursor";

export function MockBody() {

    const { find, store } = useStoreStatus();

    const [cursor, setCursor] = useState<string>(
        find(CURSOR_KEY, {
            def: DEFAULT_CURSOR,
            range: VALID_CURSORS
        }));

    const cursorChange = (cursor: string) => {
        store(CURSOR_KEY, cursor);
    };

    return (
        <div id='body-content'>
            <LeftSidebar cursor={cursor} cursorChange={cursorChange} />
            <ContentContainer cursor={cursor} />
            <RightSidebar cursor={cursor}/>
        </div>
    )
}