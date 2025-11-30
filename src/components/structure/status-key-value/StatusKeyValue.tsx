import { useEffect, useRef, useState } from 'react';
import type { StatusKeyValue } from '../../../interfaces/StatusKeyValue';

import './StatusKeyValue.css'

const DATA_LIST_MIN = 2;

interface StatusKeyValueProps {
    order?: number
    focus?: string
    value?: StatusKeyValue
    definition: StatusKeyValueDefinition
    rowPush: (row: StatusKeyValue, focus: string, order?: number) => void;
    rowTrim: (order: number) => void;
    keyList?: string;
}

export interface StatusKeyValueDefinition {
    key: string
    value: string
    disabled: boolean
}

interface Payload {
    order: number;
    status: boolean;
    key: string;
    value: string;
}

export function StatusKeyValue({ order, focus, value, definition, rowPush, rowTrim, keyList }: StatusKeyValueProps) {
    const inputKey = useRef<HTMLInputElement>(null);
    const inputValue = useRef<HTMLInputElement>(null);

    const [row, setRow] = useState<Payload>({
        order: order || 0,
        status: value ? value.status : false,
        key: value ? value.key : "",
        value: value ? value.value : "",
    });

    const handleChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (definition.disabled) {
            return;
        }

        const newRow = { ...row, status: e.target.checked }
        setRow(newRow)
        rowPush(newRow, e.target.name, order)
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (definition.disabled) {
            const key = e.target.name == "key" ? e.target.value : "";
            const value = e.target.name == "value" ? e.target.value : "";
            rowPush({ order: 0, status: true, key: key, value: value }, e.target.name, order)
            return;
        }

        let newRow = { ...row, [e.target.name]: e.target.value };
        setRow(newRow)
        rowPush(newRow, e.target.name, order)
    };

    const handleDelete = () => {
        if (order != undefined) {
            rowTrim(order)
        }
    };

    useEffect(() => {
        if (focus == "key") {
            inputKey.current?.focus()
            return;
        }
        if (focus == "value") {
            inputValue.current?.focus()
            return;
        }
    }, []);

    return (
        <>
            <div className="parameter-container">
                <input name="status" type="checkbox" onChange={handleChecked} disabled={definition.disabled} checked={row.status} />
                <input className="parameter-input" ref={inputKey} name="key" type="text" list={row.key.length < DATA_LIST_MIN ? "" : keyList} onChange={handleChange} placeholder={definition.key} value={row.key} />
                <input className="parameter-input" ref={inputValue} name="value" type="text" onChange={handleChange} placeholder={definition.value} value={row.value} />
                <button type="button" className={`remove-button ${!definition.disabled ? "show" : ''}`} onClick={handleDelete} disabled={definition.disabled}></button>
            </div>
        </>
    )
}