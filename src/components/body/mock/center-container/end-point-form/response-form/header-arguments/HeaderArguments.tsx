import { DataListPayload, OrderedKeyValueArguments } from '../../../../../../form/ordered-key-value-form/OrderedKeyValueArguments';
import { StatusKeyValueDefinition } from '../../../../../../structure/status-key-value/StatusKeyValue';
import { HttpHeader } from '../../../../../../../constants/HttpHeader';
import { ItemStatusKeyValue } from '../../../../../../../interfaces/StatusKeyValue';
import { ItemResponse } from '../../../../../../../interfaces/mock/Response';
import { useEffect, useState } from 'react';
import { useStoreEndPoint } from '../../../../../../../store/mock/StoreProviderEndPoint';

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

export function HeaderArguments() {
    const { response, updateResponse } = useStoreEndPoint();

    const [data, setData] = useState<ItemStatusKeyValue[]>([...response.headers]);

    useEffect(() => {
        setData([...response.headers]);
    }, [response.headers]);

    const updateItems = async (items: ItemStatusKeyValue[]) => {
        setData(items);

        const newResponse: ItemResponse = {
            ...response,
            headers: items
        };

        updateResponse(newResponse);
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