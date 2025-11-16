import { ItemResponse } from '../../../../../../../interfaces/mock/Response';
import { ChangeEvent, useEffect, useState } from 'react';
import { useStoreEndPoint } from '../../../../../../../store/mock/StoreProviderEndPoint';
import { FormatsLite, StepFormat } from '../../../../../../../services/mock/Constants';
import { TextData } from '../../../../../../form/text-area/text/TextData';
import { XmlData } from '../../../../../../form/text-area/xml/XmlData';
import { JsonData } from '../../../../../../form/text-area/json/JsonData';

import './BodyArguments.css';

interface Payload {
    content: string
    payload: string
}

const defaultPayload = (response: ItemResponse): Payload => {
    const body = response.body;
    const content = FormatsLite.map(f => f.key)
        .find(f => f == body.content_type);
    return {
        content: content || StepFormat.TEXT,
        payload: body.payload
    };
}

export function BodyArguments() {
    const { response, updateResponse } = useStoreEndPoint();

    const [data, setData] = useState<Payload>(defaultPayload(response));

    useEffect(() => {
        setData(defaultPayload(response));
    }, [response.body]);

    const onContentChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const content = e.target.value;
        setData((prevData) => ({
            ...prevData,
            content: content
        }));

        const newResponse: ItemResponse = {
            ...response,
            body: {
                ...response.body,
                content_type: content
            }
        };

        updateResponse(newResponse);
    }

    const onPayloadChange = (content: string, payload: string) => {
        setData({
            content: content,
            payload: payload
        });

        const newResponse: ItemResponse = {
            ...response,
            body: {
                content_type: content,
                payload: payload
            }
        };

        updateResponse(newResponse);
    }

    return (
        <>
            <div id="end-form-arguments" className="end-point-form-fragment column">
                <label htmlFor="end-point-resp-content" className="end-point-form-field row">
                    <span>Content-Type:</span>
                    <select id="end-point-resp-content" className="end-point-form-input" name="status" value={data.content} onChange={onContentChange}>
                        {FormatsLite.map(e => (
                            <option key={e.key} value={e.key}>
                                {e.value}
                            </option>
                        ))}
                    </select>
                </label>
                {data.content === StepFormat.TEXT && <TextData payload={data.payload} onValueChange={onPayloadChange} />}
                {data.content === StepFormat.XML && <XmlData payload={data.payload} onValueChange={onPayloadChange} />}
                {data.content === StepFormat.JSON && <JsonData payload={data.payload} onValueChange={onPayloadChange} />}
            </div>
        </>
    )
}