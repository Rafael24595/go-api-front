import { v4 as uuidv4 } from 'uuid';
import { ItemResponse } from '../../../../../../../interfaces/mock/Response';
import { ChangeEvent, useEffect, useState } from 'react';
import { useStoreEndPoint } from '../../../../../../../store/mock/StoreProviderEndPoint';
import { FormatsLite, StepFormat } from '../../../../../../../services/mock/Constants';
import { TextData } from '../../../../../../form/text-area/text/TextData';
import { XmlData } from '../../../../../../form/text-area/xml/XmlData';
import { JsonData } from '../../../../../../form/text-area/json/JsonData';
import { EndPointEvents } from '../../../../../../../store/mock/Constants';

import './BodyArguments.css';

interface Payload {
    key: string
    content: string
    payload: string
}

const defaultPayload = (response: ItemResponse): Payload => {
    const body = response.body;
    const content = FormatsLite.map(f => f.key)
        .find(f => f == body.content_type);
    return {
        key: uuidv4(),
        content: content || StepFormat.TEXT,
        payload: body.payload
    };
}

export function BodyArguments() {
    const { event, response, defineResponse, updateResponse } = useStoreEndPoint();

    const [data, setData] = useState<Payload>(defaultPayload(response));

    useEffect(() => {
        if (event.reason == EndPointEvents.DEFINE_REQUEST) {
            setData(defaultPayload(response));
        }
    }, [response.body]);

    const onContentChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const newResponse: ItemResponse = {
            ...response,
            body: {
                ...response.body,
                content_type: e.target.value
            }
        };

        defineResponse(newResponse);
    }

    const onPayloadChange = (content: string, payload: string) => {
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
                {data.content === StepFormat.TEXT && <TextData 
                    key={data.key}
                    payload={data.payload} 
                    onValueChange={onPayloadChange} />}
                {data.content === StepFormat.XML && <XmlData 
                    key={data.key}
                    payload={data.payload} 
                    onValueChange={onPayloadChange} />}
                {data.content === StepFormat.JSON && <JsonData 
                    key={data.key}
                    payload={data.payload} 
                    onValueChange={onPayloadChange} />}
            </div>
        </>
    )
}