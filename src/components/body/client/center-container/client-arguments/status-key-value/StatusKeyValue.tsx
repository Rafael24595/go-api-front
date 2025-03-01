import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { StatusKeyValue } from '../../../../../../interfaces/StatusKeyValue';

import './StatusKeyValue.css'

export interface ItemStatusKeyValue {
    id: string
    status: boolean
    key: string
    value: string
    focus: string
}

export const toItem = (rowsStr?: StatusKeyValue[]): ItemStatusKeyValue[] => {
    if(!rowsStr) {
        return [];
    }
    return [...rowsStr].map(r => ({...r, id: uuidv4(), focus: ""}));
}

interface StatusKeyValueProps {
    order?: number
    focus?: string
    value?: StatusKeyValue
    definition: {
        key: string
        value: string
        disabled: boolean
    }     
    rowPush: (row: StatusKeyValue, focus: string, order?: number) => void;
    rowTrim: (order: number) => void;
}

interface Payload {
    status: boolean;
    key: string;
    value: string;
}

export function StatusKeyValue({order, focus, value, definition, rowPush, rowTrim}: StatusKeyValueProps) {
    const inputKey = useRef<HTMLInputElement>(null);
    const inputValue = useRef<HTMLInputElement>(null);

    const [row, setRow] = useState<Payload>({
        status: value ? value.status : false,
        key: value ? value.key : "",
        value: value ? value.value : "",
    });

    const handleChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(definition.disabled) {
            return;
        }

        setRow({ ...row, [e.target.name]: e.target.checked })
        rowPush(row, e.target.name, order)
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(definition.disabled) {
            const key = e.target.name == "key" ? e.target.value : "";
            const value = e.target.name == "value" ? e.target.value : "";
            rowPush({status: true, key: key, value: value},  e.target.name, order)    
            return;
        }

        let newRow = {...row,  [e.target.name]: e.target.value };
        setRow(newRow)
        rowPush(newRow, e.target.name, order)
    };

    const handleDelete = () => {
        if(order != undefined) {
            rowTrim(order)
        }
    };

    useEffect(() => {
        if(focus == "key") {
            inputKey.current?.focus()
            return;
        }
        if(focus == "value") {
            inputValue.current?.focus()
            return;
        }
    }, []);

    return (
        <>
            <div className="parameter-container">
                <input name="status" type="checkbox" onChange={handleChecked} disabled={definition.disabled} checked={row.status}/>
                <input className="parameter-input" ref={inputKey} name="key" type="text" onChange={handleChange} placeholder={definition.key} value={row.key}/>
                <input className="parameter-input" ref={inputValue} name="value" type="text" onChange={handleChange} placeholder={definition.value} value={row.value}/>
                <button type="button" className={`remove-button ${!definition.disabled ? "show" : ''}`} onClick={handleDelete} disabled={definition.disabled}></button>
            </div>
        </>
    )
}