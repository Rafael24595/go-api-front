import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { StatusCategoryKeyValue } from '../../../../../../interfaces/StatusCategoryKeyValue';
import type { KeyValue } from '../../../../../../interfaces/KeyValue';

import '../status-key-value/StatusKeyValue.css'

export interface ItemStatusCategoryKeyValue {
    id: string
    order: number
    status: boolean
    category: string
    key: string
    value: string
    focus: string
}

export const toItem = (rowsStr: StatusCategoryKeyValue[]): ItemStatusCategoryKeyValue[] => {
    if(!rowsStr) {
        return [];
    }
    return fixOrder([...rowsStr].sort((a, b) => a.order - b.order).map(r => ({...r, id: uuidv4(), focus: ""})));
}

export const fixOrder = (argument: ItemStatusCategoryKeyValue[]) => {
    return argument.map((item, i) => {
        item.order = i;
        return item;
    });
}

interface StatusCategoryKeyValueProps {
    order?: number
    focus?: string
    value?: StatusCategoryKeyValue
    definition: {
        categories: KeyValue[]
        key: string
        value: string
        disabled: boolean
    }     
    rowPush: (row: StatusCategoryKeyValue, focus: string, order?: number) => void;
    rowTrim: (order: number) => void;
}

interface Payload {
    order: number;
    status: boolean;
    category: string;
    key: string;
    value: string;
}

export function StatusCategoryKeyValue({order, focus, value, definition, rowPush, rowTrim}: StatusCategoryKeyValueProps) {
    const inputKey = useRef<HTMLInputElement>(null);
    const inputValue = useRef<HTMLInputElement>(null);

    const [row, setRow] = useState<Payload>({
        order: order || 0,
        status: value ? value.status : false,
        category: value ? value.category : 
            definition.categories.length > 0 ? definition.categories[0].value : "",
        key: value ? value.key : "",
        value: value ? value.value : "",
    });

    const handleChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(definition.disabled) {
            return;
        }

        const newRow = {...row, status: e.target.checked }
        setRow(newRow)
        rowPush(newRow, e.target.name, order)
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(definition.disabled) {
            const category = definition.categories.length > 0 ? definition.categories[0].value : "";
            const key = e.target.name == "key" ? e.target.value : "";
            const value = e.target.name == "value" ? e.target.value : "";
            rowPush({ order: 0, status: true, category: category, key: key, value: value },  e.target.name, order)    
            return;
        }

        let newRow = {...row,  [e.target.name]: e.target.value };
        setRow(newRow)
        rowPush(newRow, e.target.name, order)
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if(definition.disabled) {
            const category = e.target.name == "category" ? e.target.value : "";
            rowPush({ order: 0, status: true, category: category, key: "", value: "" }, "key", order)    
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
            <div className="parameter-container">{}
                <input name="status" type="checkbox" onChange={handleChecked} disabled={definition.disabled} checked={row.status}/>
                <select className="parameter-input secondary" name="category" onChange={handleCategoryChange}>
                    {definition.categories.map(c => (
                        <option key={c.value} value={c.value} selected={c.value == row.category}>{c.key}</option>
                    ))}
                </select>
                <input className="parameter-input" ref={inputKey} name="key" type="text" onChange={handleChange} placeholder={definition.key} value={row.key}/>
                <input className="parameter-input" ref={inputValue} name="value" type="text" onChange={handleChange} placeholder={definition.value} value={row.value}/>
                <button type="button" className={`remove-button ${!definition.disabled ? "show" : ''}`} onClick={handleDelete} disabled={definition.disabled}></button>
            </div>
        </>
    )
}