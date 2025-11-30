import { ContentContainer } from './center-container/ContentContainer';
import { LeftSidebar } from './left-sidebar/LeftSidebar'
import { RightSidebar } from './right-sidebar/RightSidebar';

import './ClientBody.css'

export function ClientBody() {
    return (
        <div id='body-content'>
            <LeftSidebar />
            <ContentContainer />
            <RightSidebar />
        </div>
    )
}