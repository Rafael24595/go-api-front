import { ItemResponse } from '../../../../../../../interfaces/mock/Response';
import { ChangeEvent, useEffect, useState } from 'react';
import { httpStatusDescriptions } from '../../../../../../../constants/HttpMethod';
import { useStoreEndPoint } from '../../../../../../../store/mock/StoreProviderEndPoint';

import './DataArguments.css';

interface Payload {
    status: number
    description: string
}

export function DataArguments() {
    const { response, updateResponse } = useStoreEndPoint();

    const [data, setData] = useState<Payload>({
        status: response.status,
        description: response.description
    });

    useEffect(() => {
        setData({
            status: response.status,
            description: response.description
        });
    }, [response]);

    const onStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
        let status = parseInt(e.target.value, 10)
        if(httpStatusDescriptions.get(status) == undefined) {
            status = 200;
        }

        setData((prevData) => ({
            ...prevData,
            status: status
        }));

        const newResponse: ItemResponse = {
            ...response,
            status: status
        };

        updateResponse(newResponse);
    }

    const onDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const description = e.target.value;

        setData((prevData) => ({
            ...prevData,
            description: description
        }));

        const newResponse: ItemResponse = {
            ...response,
            description: description
        };

        updateResponse(newResponse);
    }

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
                    <textarea name="end-point-resp-desc" id="end-point-resp-desc" rows={5} placeholder="Description..." onChange={onDescriptionChange}></textarea>
                </label>
            </div>
        </>
    )
}