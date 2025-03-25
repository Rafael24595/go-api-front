import { useRef } from 'react';
import { ContentContainer } from './center-container/ContentContainer'
import { LeftSidebar, LeftSidebarMethods } from './left-sidebar/LeftSidebar'
import { RightSidebar } from './right-sidebar/RightSidebar';

import './Client.css'

export function Client() {
    const leftSidebarRef = useRef<LeftSidebarMethods>(null);

    const reloadRequestSidebar = () => {
        leftSidebarRef.current?.reloadView();
    }

    return (
        <>
            <LeftSidebar ref={leftSidebarRef}/>
            <ContentContainer 
                reloadRequestSidebar={reloadRequestSidebar}/>
            <RightSidebar/>
        </>
    )
}