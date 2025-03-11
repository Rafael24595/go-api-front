import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { StatusKeyValue as StrStatusKeyValue } from '../../../../../../interfaces/StatusKeyValue';
import { ItemStatusKeyValue, StatusKeyValue, toItem } from '../status-key-value/StatusKeyValue';

import './QueryArguments.css'

const ROW_DEFINITION = { 
    key: "Parameter", 
    value: "Value", 
    disabled: true 
}

interface QueryProps {
    uriProcess: boolean,
    values: StrStatusKeyValue[]
    processUri: () => void;
    onUriProcessChange: (uriProcess: boolean) => void;
    onValueChange: (rows: StrStatusKeyValue[]) => void;
}

interface Payload {
    uriProcess: boolean,
    rows: ItemStatusKeyValue[]
}

export function QueryArguments({ uriProcess, values, processUri, onUriProcessChange, onValueChange }: QueryProps) {
    const [data, setRows] = useState<Payload>({
        uriProcess: uriProcess,
        rows: toItem(values)
    });

    const statusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newData = {...data, uriProcess: e.target.checked};
        setRows(newData);
        onUriProcessChange(newData.uriProcess);
    };

    const rowTrim = (order: number) => {
        if(order < 0 || data.rows.length < order ) {
            return;
        }

        let newRows = copyRows();
        newRows.splice(order, 1);

        const newData = {...data, rows: newRows};

        setRows(newData)
        onValueChange(newRows)
    }

    const rowPush = (row: StrStatusKeyValue, focus: string, order?: number) => {
        let newRows = copyRows();
        if(order != undefined && 0 <= order && data.rows.length >= order) {
            newRows[order] = {
                ...row, 
                id: newRows[order].id, 
                focus: ""};
        } else {
            newRows.push({
                ...row, 
                id: uuidv4(), 
                focus: focus});
        }

        const newData = {...data, rows: newRows};
        setRows(newData);
        onValueChange(newRows)
    }

    const copyRows = (): ItemStatusKeyValue[] => {
        return [...data.rows].map(r => ({...r, focus: ""}));
    }

    return (
        <>
            <div id="query-process-group" className="border-bottom">
                <div>
                    <label htmlFor="process-uri">Auto: </label>
                    <input 
                        name="status" 
                        id="process-uri" 
                        type="checkbox" 
                        checked={data.uriProcess}
                        onChange={statusChange}/>
                </div>
                <button type="button" onClick={processUri}>Process</button>
            </div>
            <div id="client-argument-content">
                {data.rows.map((item, i) => (
                    <StatusKeyValue
                        key={`query-param-${item.id}`}
                        order={i}
                        focus={item.focus}
                        value={{
                            status: item.status,
                            key: item.key,
                            value: item.value
                        }}
                        definition={{ 
                            ...ROW_DEFINITION, 
                            disabled: false}}
                        rowPush={rowPush}
                        rowTrim={rowTrim}
                    />
                ))}
                <StatusKeyValue 
                    definition={ ROW_DEFINITION }
                    rowPush={rowPush}
                    rowTrim={rowTrim}
                />
            </div>
        </>
    )
}