import { useState } from 'react';

import './BodyArguments.css'
import { TextData } from './text/TextData';
import { Body } from '../../../../../../interfaces/request/Request';
import { JsonData } from './json/JsonData';

const VIEW_TEXT = "text";
const VIEW_JSON = "json";

const DEFAULT_CURSOR = VIEW_TEXT;

interface BodyArgumentsProps {
    value: Body
    cursorStatus?: string;
    onValueChange: (body: Body) => void;
}

interface Payload {
    cursor: string;
    status: boolean;
    content: string;
    payload: string;
}

export function BodyArguments({value, cursorStatus, onValueChange}: BodyArgumentsProps) {
    const [data, setData] = useState<Payload>({
            cursor: cursorStatus || DEFAULT_CURSOR,
            status: value.status, 
            content: value.contentType,
            payload: value.payload,
        });
    
    const cursorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newData = {...data, cursor: e.target.value};
        setData(newData);
    };

    const statusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newData = {...data, status: e.target.checked};
        setData(newData);
        onValueChange(makeBody(newData));
    };

    const payloadChange = (content: string, payload: string) => {
        let newData = {...data, content: content, payload: payload};
        setData(newData);
        onValueChange(makeBody(newData));
    }

    const makeBody = (payload: Payload): Body => {
        return {
            status: payload.status,
            contentType: payload.content,
            payload: payload.payload
        };
    }

    return (
        <>
            <div className="radio-button-group border-bottom">
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
              <div id="client-argument-content">
                  {data.cursor === VIEW_TEXT && <TextData value={data.payload} onValueChange={payloadChange}/>}
                  {data.cursor === VIEW_JSON && <JsonData value={data.payload} onValueChange={payloadChange}/>}
              </div>
        </>
    )
}