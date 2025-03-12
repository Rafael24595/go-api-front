import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { StatusKeyValue as StrStatusKeyValue } from '../../../../../../interfaces/StatusKeyValue';
import { ItemStatusKeyValue, StatusKeyValue, toItem } from '../status-key-value/StatusKeyValue';

import './HeaderArguments.css'

const ROW_DEFINITION = { 
    key: "Header", 
    value: "Value", 
    disabled: true 
}

interface HeaderProps {
    argument: StrStatusKeyValue[]
    onValueChange: (rows: StrStatusKeyValue[]) => void;
}


export function HeaderArguments({ argument, onValueChange }: HeaderProps) {
    const [data, setData] = useState<ItemStatusKeyValue[]>(toItem(argument));

    const rowTrim = (order: number) => {
        if(order < 0 || data.length < order ) {
            return;
        }

        let newRows = copyRows();
        newRows.splice(order, 1);

        setData(newRows)
        onValueChange(newRows)
    }

    const rowPush = (row: StrStatusKeyValue, focus: string, order?: number) => {
        let newRows = copyRows();
        if(order != undefined && 0 <= order && data.length >= order) {
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

        setData(newRows);
        onValueChange(newRows)
    }

    const copyRows = (): ItemStatusKeyValue[] => {
        return [...data].map(r => ({...r, focus: ""}));
    }

    return (
        <>
            {data.map((item, i) => (
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