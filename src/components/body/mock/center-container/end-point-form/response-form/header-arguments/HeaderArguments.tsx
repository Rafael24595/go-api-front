import { DataListPayload, OrderedKeyValueArguments } from '../../../../../../form/ordered-key-value-form/OrderedKeyValueArguments';
import { StatusKeyValueDefinition } from '../../../../../../structure/status-key-value/StatusKeyValue';
import { HttpHeader } from '../../../../../../../constants/HttpHeader';
import { ItemStatusKeyValue } from '../../../../../../../interfaces/StatusKeyValue';
import { ItemResponse } from '../../../../../../../interfaces/mock/Response';
import { useEffect, useState } from 'react';

import './HeaderArguments.css';

const ROW_DEFINITION: StatusKeyValueDefinition = {
    key: "Header",
    value: "Value",
    disabled: true
}

const DATA_LIST: DataListPayload = {
    key: "http-headers",
    items: HttpHeader
}

interface HeaderArgumentsProps {
    response: ItemResponse
    resolveResponse: (response: ItemResponse) => void
}

interface Payload {
    items: ItemStatusKeyValue[]
}

export function HeaderArguments({ response, resolveResponse }: HeaderArgumentsProps) {
    const [data, setData] = useState<Payload>({
        items: response.headers
    });

    useEffect(() => {
        setData((prevData) => ({
            ...prevData,
            items: response.headers
        }));
    }, [response.headers]);

    const updateItems = async (items: ItemStatusKeyValue[]) => {
        setData((prevData) => ({
            ...prevData,
            items: items
        }));

        const newResponse: ItemResponse = {
            ...response,
            headers: items
        };

        resolveResponse(newResponse);
    };

    return (
        <>
            <OrderedKeyValueArguments
                items={data.items}
                updateItems={updateItems}
                dataList={DATA_LIST}
                definition={ROW_DEFINITION}
            />
        </>
    )
}