import { useState } from 'react';
import { ContentContainer } from './center-container/ContentContainer'
import { LeftSidebar } from './left-sidebar/LeftSidebar'
import { RightSidebar } from './right-sidebar/RightSidebar'
import { Response } from '../../../interfaces/response/Response';
import { newRequest, Request } from '../../../interfaces/request/Request';
import { findAction } from '../../../services/api/ServiceStorage';

import './Client.css'

interface Payload {
    request: Request
    response?: Response;
}

export function Client() {
    const [data, setData] = useState<Payload>({
        request: newRequest(),
        response: undefined
    });

    const selectRequest = async (request: Request) => {
        //TODO: Manage with session.
        const apiResponse = await findAction("anonymous", request);
        setData({ request: apiResponse.request, response: apiResponse.response });
    }

    const responseChange = (request: Request, response: Response) => {
        let newData = {...data, request, response};
        setData(newData);
    }

    return (
        <>
            <LeftSidebar selectRequest={selectRequest}/>
            <ContentContainer request={data.request} onValueChange={responseChange}/>
            <RightSidebar response={data.response}/>
        </>
    )
}