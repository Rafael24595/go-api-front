import { useEffect, useState } from 'react';
import { TextData } from './text/TextData';
import { Body } from '../../../../../../interfaces/request/Request';
import { JsonData } from './json/JsonData';
import { useStoreRequest } from '../../../../../../store/StoreProviderRequest';
import { useStoreStatus } from '../../../../../../store/StoreProviderStatus';

import './BodyArguments.css'

const VIEW_TEXT = "text";
const VIEW_JSON = "json";

const VALID_CURSORS = [VIEW_TEXT, VIEW_JSON];

const DEFAULT_CURSOR = VIEW_TEXT;

const CURSOR_KEY = "BodyArgumentsCursor";

interface Payload {
    cursor: string;
    status: boolean;
    content: string;
    payload: string;
}

export function BodyArguments() {
    const { find, store } = useStoreStatus();

    const { request, updateBody } = useStoreRequest();

    const [data, setData] = useState<Payload>({
        cursor: find(CURSOR_KEY, {
            def: DEFAULT_CURSOR,
            range: VALID_CURSORS
        }),
        status: request.body.status, 
        content: request.body.content_type,
        payload: request.body.payload,
    });

    useEffect(() => {
        setData(prevData => ({
            ...prevData,
            status: request.body.status, 
            content: request.body.content_type,
            payload: request.body.payload,
        }));
    }, [request.body]);
    
    const cursorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        store(CURSOR_KEY, e.target.value);
        setData({...data, cursor: e.target.value});
    };

    const statusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newData = {...data, status: e.target.checked};
        setData(newData);
        updateBody(makeBody(newData));
    };

    const payloadChange = (content: string, payload: string) => {
        content = payload == "" ? "" : content;
        let newData = {...data, content: content, payload: payload};
        setData(newData);
        updateBody(makeBody(newData));
    }

    const makeBody = (payload: Payload): Body => {
        return {
            status: payload.status,
            content_type: payload.content,
            payload: payload.payload
        };
    }

    const formatPayload = () => {
        let prettyPayload = data.payload;
        if(data.cursor == VIEW_JSON) {
            try {
                const jsonObj = JSON.parse(data.payload);
                prettyPayload = JSON.stringify(jsonObj, null, 2);
            } catch (error) {
                console.error(error);
            }
        }
        setData((prevData) => ({
            ...prevData,
            payload: prettyPayload
        }));
    }

    return (
        <>
            <div id="body-parameters-group" className="border-bottom">
                <div className="radio-button-group">
                  <input 
                      name="status" 
                      id="body-enable"
                      type="checkbox" 
                      checked={data.status}
                      onChange={statusChange}/>
                  <input type="radio" id="tag-body-text" className="client-tag" name="cursor-body" 
                      checked={data.cursor === VIEW_TEXT} 
                      value={VIEW_TEXT} 
                      onChange={cursorChange}/>
                  <label htmlFor="tag-body-text">Text</label>
                  <input type="radio" id="tag-body-json" className="client-tag" name="cursor-body" 
                      checked={data.cursor === VIEW_JSON} 
                      value={VIEW_JSON} 
                      onChange={cursorChange}/>
                  <label htmlFor="tag-body-json">Json</label>
                </div>
                {data.cursor === VIEW_JSON && (
                    <div>
                        <button type="button" className="button-tag" onClick={formatPayload}>Format</button>
                    </div>
                )}
              </div>
              <div id="client-argument-content">
                  {data.cursor === VIEW_TEXT && <TextData value={data.payload} onValueChange={payloadChange}/>}
                  {data.cursor === VIEW_JSON && <JsonData value={data.payload} onValueChange={payloadChange}/>}
              </div>
        </>
    )
}
