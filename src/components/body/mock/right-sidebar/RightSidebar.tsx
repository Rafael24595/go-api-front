import { VIEW_END_POINTS } from '../MockBody';
import { EndPointMetrics } from './end-point-metrics/EndPointMetrics';

import './RightSidebar.css';

interface RightSidebarProps {
    cursor: string;
}

export function RightSidebar({ cursor }: RightSidebarProps) {
    return (
        <div id="right-sidebar-mock">
            <div className={`mock-selector-aux-option ${cursor === VIEW_END_POINTS ? "show" : ""}`}>
                <EndPointMetrics />
            </div>
        </div>
    )
}
