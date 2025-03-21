import { useRef, useState } from 'react';
import { ContentContainer } from './center-container/ContentContainer'
import { LeftSidebar, LeftSidebarMethods } from './left-sidebar/LeftSidebar'
import { RightSidebar } from './right-sidebar/RightSidebar'
import { Response } from '../../../interfaces/response/Response';
import { newRequest, Request } from '../../../interfaces/request/Request';
import { findAction } from '../../../services/api/ServiceStorage';
import { v4 as uuidv4 } from 'uuid';

import './Client.css'

interface Payload {
    request: Request;
    response?: Response;
}

export function Client() {
    const leftSidebarRef = useRef<LeftSidebarMethods>(null);

    const [data, setData] = useState<Payload>({
        request: newRequest("anonymous"),
        response: undefined
    });

    const defineRequest = async (request: Request) => {
        setData({ request: request, response: undefined });
    }

    const selectRequest = async (request: Request) => {
        //TODO: Manage with session.
        const apiResponse = await findAction("anonymous", request);
        setData({ request: apiResponse.request, response: apiResponse.response });
    }

    const responseChange = (request: Request, response: Response) => {
        let newData = {...data, request, response};
        setData(newData);
    }

    const reloadRequestSidebar = () => {
        leftSidebarRef.current?.reloadView();
    }

    const keygen = () => {
        return `${uuidv4()}-${Date.now()}`;
    }

    return (
        <>
            <LeftSidebar 
                ref={leftSidebarRef}
                defineRequest={defineRequest}
                selectRequest={selectRequest}/>
            <ContentContainer 
                key={keygen()} 
                request={data.request}
                response={data.response}
                reloadRequestSidebar={reloadRequestSidebar}
                onValueChange={responseChange}/>
            <RightSidebar response={data.response}/>
        </>
    )
}