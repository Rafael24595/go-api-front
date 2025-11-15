import { ItemStatusKeyValue } from '../../../../../../../interfaces/StatusKeyValue';
import { ItemResponse } from '../../../../../../../interfaces/mock/Response';
import { ChangeEvent, useEffect, useState } from 'react';
import { httpStatusDescriptions } from '../../../../../../../constants/HttpMethod';

import './DataArguments.css';

interface DataArgumentsProps {
    response: ItemResponse
    resolveResponse: (response: ItemResponse) => void
}

interface Payload {
    status: number
    description: string
}

export function DataArguments({ response, resolveResponse }: DataArgumentsProps) {
    const [data, setData] = useState<Payload>({
        status: response.status,
        description: ""
    });

    useEffect(() => {
        setData((prevData) => ({
            ...prevData,
            status: response.status,
            description: ""
        }));
    }, [response]);

    const onStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
        let status = parseInt(e.target.value, 10)
        if(httpStatusDescriptions.get(status) == undefined) {
            status = 200;
        }

        setData((prevData) => ({
            ...prevData,
            status: status
        }))
    }

    const updateItems = async (items: ItemStatusKeyValue[]) => {
        setData((prevData) => ({
            ...prevData,
            items: items
        }));

        const newResponse: ItemResponse = {
            ...response,
            headers: items
        };

        resolveResponse(newResponse);
    };

    return (
        <>
            <div className="end-point-form-fragment column">
                <label htmlFor="end-point-resp-status" className="end-point-form-field row">
                    <span>Method:</span>
                    <select id="end-point-resp-status" className="end-point-form-input" name="status" value={data.status} onChange={onStatusChange}>
                        {Array.from(httpStatusDescriptions.entries()).map(([code, desc]) => (
                            <option key={code} value={code}>
                                {code} - {desc}
                            </option>
                        ))}
                    </select>
                </label>
                <label htmlFor="end-point-resp-desc" className="end-point-form-field row">
                    <textarea name="end-point-resp-desc" id="end-point-resp-desc" rows={5} placeholder="Description..."></textarea>
                </label>
            </div>
        </>
    )
}