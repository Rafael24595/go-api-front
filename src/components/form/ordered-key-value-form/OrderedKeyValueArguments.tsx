import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { cleanCopy, fixOrder, ItemStatusKeyValue, StatusKeyValue as StrStatusKeyValue } from '../../../interfaces/StatusKeyValue';
import { PositionWrapper, VerticalDragDrop } from '../../utils/drag/VerticalDragDrop';
import { StatusKeyValue, StatusKeyValueDefinition } from '../../structure/status-key-value/StatusKeyValue';

import './OrderedKeyValueArguments.css';

const DEFAULT_DEFINITION: StatusKeyValueDefinition = {
    key: "Key",
    value: "Value",
    disabled: true
}

interface OrderedKeyValueArgumentsProps {
    items: ItemStatusKeyValue[]
    updateItems: (items: ItemStatusKeyValue[]) => void
    definition?: StatusKeyValueDefinition
    dataList?: DataListPayload
}

interface Payload {
    empty: string
    items: ItemStatusKeyValue[]
}

export interface DataListPayload {
    key: string
    items: string[]
}

export function OrderedKeyValueArguments({ items, updateItems, definition, dataList }: OrderedKeyValueArgumentsProps) {
    const [data, setData] = useState<Payload>({
        empty: uuidv4(),
        items: items
    });

    useEffect(() => {
        setData((prevData) => ({
            ...prevData,
            items: items
        }));
    }, [items]);

    const makeKey = (item: ItemStatusKeyValue): string => {
        return `ordered-form-param-${item.id}`;
    }

    const rowTrim = (order: number) => {
        if (order < 0 || data.items.length < order) {
            return;
        }

        let newRows = cleanCopy(data.items);
        newRows.splice(order, 1);

        newRows = fixOrder(newRows);

        setData((prevData) => ({
            ...prevData,
            items: newRows
        }));

        updateItems(newRows);
    }

    const rowPush = (row: StrStatusKeyValue, focus: string, order?: number) => {
        let newEmpty = data.empty;
        let newRows = cleanCopy(data.items);

        if (order != undefined && 0 <= order && data.items.length >= order) {
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

        updateItems(newRows);
    }

    const updateOrder = async (items: PositionWrapper<ItemStatusKeyValue>[]) => {
        const newRows = cleanCopy(items.map(i => i.item));
        setData((prevData) => ({
            ...prevData,
            items: newRows
        }));
        updateItems(newRows);
    };

    return (
        <>
            {dataList && (
                <datalist id={dataList.key}>
                    {dataList.items.map(h => (
                        <option key={h} value={h} />
                    ))}
                </datalist>
            )}
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
                            ...(definition || DEFAULT_DEFINITION),
                            disabled: false
                        }}
                        rowPush={rowPush}
                        rowTrim={rowTrim}
                        keyList={dataList?.key}
                    />
                )}
                afterTemplate={(
                    <StatusKeyValue
                        key={data.empty}
                        definition={definition || DEFAULT_DEFINITION}
                        rowPush={rowPush}
                        rowTrim={rowTrim}
                        keyList={dataList?.key}
                    />
                )}
            />
        </>
    )
}