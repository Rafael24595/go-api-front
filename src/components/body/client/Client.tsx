import './Client.css'
import { ContentContainer } from './center-container/ContentContainer'
import { LeftSidebar } from './left-sidebar/LeftSidebar'
import { RightSidebar } from './right-sidebar/RightSidebar'

export function Client() {
    return (
        <>
            <LeftSidebar/>
            <ContentContainer/>
            <RightSidebar/>
        </>
    )
}