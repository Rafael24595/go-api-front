import { ItemResponse } from '../../../../../../../interfaces/mock/Response';
import { ChangeEvent, useEffect, useState } from 'react';
import { httpStatusDescriptions } from '../../../../../../../constants/HttpMethod';
import { useStoreEndPoint } from '../../../../../../../store/mock/StoreProviderEndPoint';

import './DataArguments.css';

interface Payload {
    code: number
    description: string
}

export function DataArguments() {
    const { response, defineResponse } = useStoreEndPoint();

    const [data, setData] = useState<Payload>({
        code: response.code,
        description: response.description
    });

    useEffect(() => {
        setData({
            code: response.code,
            description: response.description
        });
    }, [response]);

    const onCodeChange = (e: ChangeEvent<HTMLSelectElement>) => {
        let code = parseInt(e.target.value, 10)
        if(httpStatusDescriptions.get(code) == undefined) {
            code = 200;
        }

        setData((prevData) => ({
            ...prevData,
            code: code
        }));

        const newResponse: ItemResponse = {
            ...response,
            code: code
        };

        defineResponse(newResponse);
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

        defineResponse(newResponse);
    }

    return (
        <>
            <div id="end-form-arguments" className="end-point-form-fragment column">
                <label htmlFor="end-point-resp-code" className="end-point-form-field row">
                    <span>Code:</span>
                    <select id="end-point-resp-code" className="end-point-form-input" name="code" value={data.code} onChange={onCodeChange}>
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