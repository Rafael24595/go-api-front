import { DataListPayload, OrderedKeyValueArguments } from '../../../../../../form/ordered-key-value-form/OrderedKeyValueArguments';
import { StatusKeyValueDefinition } from '../../../../../../structure/status-key-value/StatusKeyValue';
import { HttpHeader } from '../../../../../../../constants/HttpHeader';
import { ItemStatusKeyValue } from '../../../../../../../interfaces/StatusKeyValue';
import { ItemResponse } from '../../../../../../../interfaces/mock/Response';
import { useEffect, useState } from 'react';
import { useStoreEndPoint } from '../../../../../../../store/mock/StoreProviderEndPoint';

import './ArgumentArguments.css';

const ROW_DEFINITION: StatusKeyValueDefinition = {
    key: "Argument",
    value: "Value",
    disabled: true
}

const DATA_LIST: DataListPayload = {
    key: "http-headers",
    items: HttpHeader
}

export function ArgumentArguments() {
    const { response, defineResponse } = useStoreEndPoint();

    const [data, setData] = useState<ItemStatusKeyValue[]>([...response.arguments]);

    useEffect(() => {
        setData([...response.arguments]);
    }, [response.arguments]);

    const updateItems = async (items: ItemStatusKeyValue[]) => {
        setData(items);

        const newResponse: ItemResponse = {
            ...response,
            arguments: items
        };

        defineResponse(newResponse);
    };

    return (
        <>
            <OrderedKeyValueArguments
                items={data}
                updateItems={updateItems}
                dataList={DATA_LIST}
                definition={ROW_DEFINITION}
            />
        </>
    )
}