import { useEffect, useState } from 'react';
import { Auth } from '../../../../../../../interfaces/request/Request';

import './BearerData.css';
import '../../status-key-value/StatusKeyValue.css';

export const AUTH_CODE_BEARER = "BEARER";
interface BearerDataProps {
    value?: Auth
    onValueChange: (code:string, auth: Auth | undefined) => void;
}

interface Payload {
    status: boolean;
    bearer: string;
    token: string;
}

export function BearerData({value, onValueChange}: BearerDataProps) {
    const [data, setData] = useState<Payload>(extractValue(value));

    useEffect(() => {
        setData(extractValue(value));
    }, [value]);

    const handleChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newData = { ...data, status: e.target.checked };
        setData(newData);
        onValueChange(AUTH_CODE_BEARER, makeAuth(newData));
    };

    const inputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newData = {...data,  [e.target.name]: e.target.value };
        setData(newData);
        onValueChange(AUTH_CODE_BEARER, makeAuth(newData));
    };

    const textareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        let newData = {...data,  [e.target.name]: e.target.value };
        setData(newData);
        onValueChange(AUTH_CODE_BEARER, makeAuth(newData));
    };

    const makeAuth = (payload: Payload): Auth | undefined => {
        if(!payload.status && payload.bearer == "" && payload.token == "") {
            return undefined;
        }

        return {
            code: AUTH_CODE_BEARER,
            status: payload.status,
            parameters: {
                "bearer": payload.bearer,
                "token": payload.token
            }
        };
    };

    return (
        <>
            <div className="parameter-container">
                <input name="status" type="checkbox" onChange={handleChecked} checked={data.status}/>
                <input className="parameter-input" name="bearer" type="text" onChange={inputChange} placeholder="bearer" value={data.bearer}/>
            </div>
            <div className="parameter-container">
                <textarea 
                    id="bearer-input"
                    className="parameter-input"
                    name="token"
                    onChange={textareaChange}
                    placeholder="token"
                    value={data.token}
                />
            </div>
        </>
    )
}

const extractValue = (value: Auth | undefined): Payload => {
    return {
        status: value ? value.status : false,
        bearer: value && value.parameters["bearer"] ? value.parameters["bearer"] : "",
        token: value && value.parameters["token"] ? value.parameters["token"] : "",
    }
}
