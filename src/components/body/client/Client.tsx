import { useState } from 'react';
import { ContentContainer } from './center-container/ContentContainer'
import { LeftSidebar } from './left-sidebar/LeftSidebar'
import { RightSidebar } from './right-sidebar/RightSidebar'
import { Response } from '../../../interfaces/response/Response';

import './Client.css'

interface Payload {
    response?: Response;
}

export function Client() {
    const [data, setData] = useState<Payload>({
        response: undefined
    });

    const responseChange = (response: Response) => {
        let newData = {...data, response};
        setData(newData);
    }

    return (
        <>
            <LeftSidebar/>
            <ContentContainer onValueChange={responseChange}/>
            <RightSidebar response={data.response}/>
        </>
    )
}