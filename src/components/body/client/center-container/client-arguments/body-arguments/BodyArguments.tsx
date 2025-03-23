import { useState } from 'react';

import './BodyArguments.css'
import { TextData } from './text/TextData';
import { Body } from '../../../../../../interfaces/request/Request';
import { JsonData } from './json/JsonData';

const VIEW_TEXT = "text";
const VIEW_JSON = "json";

const VALID_CURSORS = [VIEW_TEXT, VIEW_JSON];

const DEFAULT_CURSOR = VIEW_TEXT;

const CURSOR_KEY = "BodyArgumentsCursor";

interface BodyArgumentsProps {
    argument: Body
    onValueChange: (body: Body) => void;
}

interface Payload {
    cursor: string;
    status: boolean;
    content: string;
    payload: string;
}

export function BodyArguments({ argument, onValueChange }: BodyArgumentsProps) {
    const [data, setData] = useState<Payload>({
            cursor: getCursor(),
            status: argument.status, 
            content: argument.content_type,
            payload: argument.payload,
    });
    
    const cursorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCursor(e.target.value);
        setData({...data, cursor: e.target.value});
    };

    const statusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newData = {...data, status: e.target.checked};
        setData(newData);
        onValueChange(makeBody(newData));
    };

    const payloadChange = (content: string, payload: string) => {
        content = payload == "" ? "" : content;
        let newData = {...data, content: content, payload: payload};
        setData(newData);
        onValueChange(makeBody(newData));
    }

    const makeBody = (payload: Payload): Body => {
        return {
            status: payload.status,
            content_type: payload.content,
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

const getCursor = () => {
    const storedValue = localStorage.getItem(CURSOR_KEY);
    return storedValue && VALID_CURSORS.includes(storedValue) ? storedValue : DEFAULT_CURSOR;
}

const setCursor = (cursor: string) => {
    localStorage.setItem(CURSOR_KEY, cursor);
} 
