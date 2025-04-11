import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { fixOrder, ItemStatusKeyValue, StatusKeyValue as StrStatusKeyValue } from '../../../../../../interfaces/StatusKeyValue';
import { StatusKeyValue } from '../status-key-value/StatusKeyValue';
import { useStoreRequest } from '../../../../../../store/StoreProviderRequest';

import './CookieArguments.css'

const ROW_DEFINITION = { 
    key: "Cookie", 
    value: "Value", 
    disabled: true 
}

export function CookieArguments() {
    const { request, updateCookie } = useStoreRequest();

    const [data, setData] = useState<ItemStatusKeyValue[]>(request.cookie);

    useEffect(() => {
        setData(request.cookie);
    }, [request.cookie]);

    const rowTrim = (order: number) => {
        if(order < 0 || data.length < order ) {
            return;
        }

        let newArgument = copyRows();
        newArgument.splice(order, 1);

        newArgument = fixOrder(newArgument);
        
        setData(newArgument);
        updateCookie(newArgument);
    }

    const rowPush = (row: StrStatusKeyValue, focus: string, order?: number) => {
        let newArgument = copyRows();
        if(order != undefined && 0 <= order && data.length >= order) {
            newArgument[order] = {
                ...row, 
                id: newArgument[order].id, 
                focus: ""};
        } else {
            newArgument.push({
                ...row, 
                id: uuidv4(), 
                focus: focus});
        }

        newArgument = fixOrder(newArgument);

        setData(newArgument);
        updateCookie(newArgument);
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
                        order: item.order,
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
                key={uuidv4()}
                definition={ ROW_DEFINITION }
                rowPush={rowPush}
                rowTrim={rowTrim}
            />
        </>
    )
}