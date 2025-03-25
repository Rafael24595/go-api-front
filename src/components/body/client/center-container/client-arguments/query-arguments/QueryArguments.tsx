import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { fixOrder, ItemStatusKeyValue, StatusKeyValue as StrStatusKeyValue, toItem } from '../../../../../../interfaces/StatusKeyValue';
import { StatusKeyValue } from '../status-key-value/StatusKeyValue';

import './QueryArguments.css'

const ROW_DEFINITION = { 
    key: "Parameter", 
    value: "Value", 
    disabled: true 
}

interface QueryProps {
    autoReadUri: boolean,
    argument: StrStatusKeyValue[]
    readUri: () => StrStatusKeyValue[];
    onReadUriChange: (uriProcess: boolean) => void;
    onValueChange: (rows: StrStatusKeyValue[]) => void;
}

interface Payload {
    autoReadUri: boolean,
    argument: ItemStatusKeyValue[]
}

export function QueryArguments({ readUri, argument, autoReadUri, onReadUriChange, onValueChange }: QueryProps) {
    const [data, setData] = useState<Payload>({
        autoReadUri: autoReadUri,
        argument: toItem(argument)
    });

    const statusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newData = {...data, autoReadUri: e.target.checked};
        setData(newData);
        onReadUriChange(newData.autoReadUri);
    };

    const executeReadUri = () => {
        const queries = readUri();
        const newData = {...data, argument: toItem(queries)};
        setData(newData);
    }

    const rowTrim = (order: number) => {
        if(order < 0 || data.argument.length < order ) {
            return;
        }

        let newArgument = copyRows();
        newArgument.splice(order, 1);

        newArgument = fixOrder(newArgument);

        const newData = {...data, argument: newArgument};
        setData(newData);
        onValueChange(newArgument);
    }

    const rowPush = (row: StrStatusKeyValue, focus: string, order?: number) => {
        let newArgument = copyRows();
        if(order != undefined && 0 <= order && data.argument.length >= order) {
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

        const newData = {...data, argument: newArgument};
        setData(newData);
        onValueChange(newArgument);
    }

    const copyRows = (): ItemStatusKeyValue[] => {
        return [...data.argument].map(r => ({...r, focus: ""}));
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
                        checked={data.autoReadUri}
                        onChange={statusChange}/>
                </div>
                <button type="button" onClick={executeReadUri}>Process</button>
            </div>
            <div id="client-argument-content">
                {data.argument.map((item, i) => (
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