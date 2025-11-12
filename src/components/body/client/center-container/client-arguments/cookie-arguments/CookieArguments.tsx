import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { cleanCopy, fixOrder, ItemStatusKeyValue, StatusKeyValue as StrStatusKeyValue } from '../../../../../../interfaces/StatusKeyValue';
import { StatusKeyValue } from '../../../../../structure/status-key-value/StatusKeyValue';
import { useStoreRequest } from '../../../../../../store/client/StoreProviderRequest';
import { PositionWrapper, VerticalDragDrop } from '../../../../../utils/drag/VerticalDragDrop';

import './CookieArguments.css';

const ROW_DEFINITION = { 
    key: "Cookie", 
    value: "Value", 
    disabled: true 
}

interface Payload {
    empty: string
    items: ItemStatusKeyValue[]
}

export function CookieArguments() {
    const { request, updateCookie } = useStoreRequest();

    const [data, setData] = useState<Payload>({
        empty: uuidv4(),
        items: request.cookie
    });

    useEffect(() => {
        setData((prevData) => ({
            ...prevData,
            items: request.cookie
        }));
    }, [request.cookie]);

    const makeKey = (request: ItemStatusKeyValue): string => {
        return `cookie-param-${request.id}`;
    }

    const rowTrim = (order: number) => {
        if(order < 0 || data.items.length < order ) {
            return;
        }

        let newRows = cleanCopy(data.items);
        newRows.splice(order, 1);

        newRows = fixOrder(newRows);
        
        setData((prevData) => ({
            ...prevData,
            items: newRows
        }));

        updateCookie(newRows);
    }

    const rowPush = (row: StrStatusKeyValue, focus: string, order?: number) => {
        let newEmpty= data.empty;
        let newRows = cleanCopy(data.items);

        if(order != undefined && 0 <= order && data.items.length >= order) {
            newRows[order] = {
                ...row, 
                id: newRows[order].id, 
                focus: ""
            };
        } else {
            newEmpty = uuidv4();
            newRows.push({
                ...row, 
                id: uuidv4(), 
                focus: focus
            });
        }

        newRows = fixOrder(newRows);
        
        setData({
            empty: newEmpty,
            items: newRows
        });

        updateCookie(newRows);
    }

    const updateOrder = async (items: PositionWrapper<ItemStatusKeyValue>[]) => {
        const newRows = cleanCopy(items.map(i => i.item));
        setData((prevData) => ({
            ...prevData,
            items: newRows
        }));
        updateCookie(newRows);
    };

    return (
        <VerticalDragDrop
            id="client-argument-content"
            items={data.items}
            itemId={makeKey}
            onItemsChange={updateOrder}
            renderItem={(item, i) => (
                <StatusKeyValue
                    key={makeKey(item)}
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
            )}
            afterTemplate={(
                <StatusKeyValue 
                    key={data.empty}
                    definition={ ROW_DEFINITION }
                    rowPush={rowPush}
                    rowTrim={rowTrim}
                />
            )}
        />
    )
}