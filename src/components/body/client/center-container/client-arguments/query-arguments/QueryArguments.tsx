import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { cleanCopy, fixOrder, ItemStatusKeyValue, StatusKeyValue as StrStatusKeyValue } from '../../../../../../interfaces/StatusKeyValue';
import { StatusKeyValue } from '../status-key-value/StatusKeyValue';
import { useStoreRequest } from '../../../../../../store/StoreProviderRequest';

import './QueryArguments.css'

const ROW_DEFINITION = { 
    key: "Parameter", 
    value: "Value", 
    disabled: true 
}

export function QueryArguments() {
    const { request, updateQuery, processUri } = useStoreRequest();

    const [data, setData] = useState<ItemStatusKeyValue[]>(request.query);

    useEffect(() => {
        setData(request.query);
    }, [request.query]);

    const statusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        //TODO:
    };

    const rowTrim = (order: number) => {
        if(order < 0 || data.length < order ) {
            return;
        }

        let newArgument = cleanCopy(data);
        newArgument.splice(order, 1);
        
        newArgument = fixOrder(newArgument);

        setData(newArgument);
        updateQuery(newArgument);
    }

    const rowPush = (row: StrStatusKeyValue, focus: string, order?: number) => {
        let newArgument = cleanCopy(data);
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
        updateQuery(newArgument);
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
                        checked={false}
                        onChange={statusChange}/>
                </div>
                <button type="button" onClick={processUri}>Process</button>
            </div>
            <div id="client-argument-content">
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
            </div>
        </>
    )
}