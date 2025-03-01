import { useState } from 'react';
import { Auth } from '../../../../../../../interfaces/request/Request';

import './BasicData.css';
import '../../status-key-value/StatusKeyValue.css';

export const AUTH_CODE_BASIC = "BASIC";

interface BasicProps {
    value?: Auth
    onValueChange: (auth: Auth) => void;
}

interface Payload {
    status: boolean;
    username: string;
    password: string;
}

export function BasicData({value, onValueChange}: BasicProps) {
    const [data, setData] = useState<Payload>({
            status: value ? value.status : false,
            username: value && value.parameters["username"] ? value.parameters["username"] : "",
            password: value && value.parameters["password"] ? value.parameters["password"] : "",
    });

    const handleChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newData = { ...data, status: e.target.checked };
        setData(newData);
        onValueChange(makeAuth(newData));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newData = {...data,  [e.target.name]: e.target.value };
        setData(newData);
        onValueChange(makeAuth(newData));
    };

    const makeAuth = (payload: Payload): Auth => {
        return {
            code: AUTH_CODE_BASIC,
            status: payload.status,
            parameters: {
                "username": payload.username,
                "password": payload.password
            }
        };
    };
    
    return (
        <>
            <div className="parameter-container">
                <input name="status" type="checkbox" onChange={handleChecked} checked={data.status}/>
                <input className="parameter-input" name="username" type="text" onChange={handleChange} placeholder="username" value={data.username}/>
                <input className="parameter-input" name="password" type="password" onChange={handleChange} placeholder="password" value={data.password}/>
            </div>
        </>
    )
}