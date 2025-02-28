import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { StatusKeyValue as StrStatusKeyValue } from '../../../../../../interfaces/request/StatusKeyValue';
import { StatusKeyValue } from '../status-key-value/StatusKeyValue'
import './QueryArguments.css'

const ROW_DEFINITION = { 
    key: "Parameter", 
    value: "Value", 
    disabled: false 
}

interface ItemStatusKeyValue {
    id: string
    status: boolean
    key: string
    value: string
    focus: string
}

const toItem = (rowsStr?: StrStatusKeyValue[]): ItemStatusKeyValue[] => {
    if(!rowsStr) {
        return [];
    }
    return [...rowsStr].map(r => ({...r, id: uuidv4(), focus: ""}));
}

interface QueryArgumentsProps {
    values?: StrStatusKeyValue[]
    onValueChange: (rows: StrStatusKeyValue[]) => void;
}

export function QueryArguments({ values, onValueChange }: QueryArgumentsProps) {
    const [rows, setRows] = useState<ItemStatusKeyValue[]>(toItem(values));

    const rowTrim = (order: number) => {
        if(order < 0 || rows.length < order ) {
            return;
        }

        let newRows = copyRows();
        newRows.splice(order, 1);

        setRows(newRows)
        onValueChange(newRows)
    }

    const rowPush = (row: StrStatusKeyValue, focus: string, order?: number) => {
        let newRows = copyRows();
        if(order != undefined && 0 <= order && rows.length >= order) {
            newRows[order] = {...row, id: newRows[order].id, focus: ""};
        } else {
            newRows.push({...row, id: uuidv4(), focus: focus});
        }

        setRows(newRows);
        onValueChange(newRows)
    }

    const copyRows = (): ItemStatusKeyValue[] => {
        return [...rows].map(r => ({...r, focus: ""}));
    }

    return (
        <>
            {rows.map((item, i) => (
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
        </>
    )
}