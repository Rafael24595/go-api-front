import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FieldFormData } from './FieldFormData';
import { CleanItemBodyParameter, cloneItemBodyParameter, ItemBodyParameter, orderItemBodyParameter } from '../../../../../../../interfaces/request/Request';
import { useStoreRequest } from '../../../../../../../store/StoreProviderRequest';
import { FORM_DATA_PARAM } from '../BodyArguments';
import { Dict } from '../../../../../../../types/Dict';

import './FormData.css';

export const CONTENT_TYPE = "form";

interface Payload {
  onValueChange: (content: string, parameter: ItemBodyParameter[]) => void;
}

export function FormData({ onValueChange }: Payload) {
    const { request } = useStoreRequest();

    const [data, setData] = useState<ItemBodyParameter[]>(filterParameters(request.body.parameters));

    useEffect(() => {
        setData(filterParameters(request.body.parameters));
    }, [request.body.parameters]);

    const rowTrim = (order: number) => {
        if(order < 0 || data.length < order ) {
            return;
        }

        let newArgument = cloneItemBodyParameter(data);
        newArgument.splice(order, 1);
        
        newArgument = orderItemBodyParameter(newArgument);

        setData(newArgument);
        onValueChange(CONTENT_TYPE, newArgument);
    }

    const rowPush = (row: CleanItemBodyParameter, focus: string, order?: number) => {
        let newArgument = cloneItemBodyParameter(data);
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

        newArgument = orderItemBodyParameter(newArgument);

        setData(newArgument);
        onValueChange(CONTENT_TYPE, newArgument);
    }

    return (
        <>
            {data.map((item, i) => (
                <FieldFormData
                    key={`form-data-param-${item.id}`}
                    order={i}
                    focus={item.focus}
                    value={item}
                    rowPush={rowPush}
                    rowTrim={rowTrim}
                />
            ))}
            <FieldFormData 
                key={uuidv4()}
                disabled={true}
                rowPush={rowPush}
                rowTrim={rowTrim}
            />
        </>
    )
}

const filterParameters = (parameters: Dict<ItemBodyParameter[]>): ItemBodyParameter[] => {
    const category = parameters[FORM_DATA_PARAM];
    if(!category) {
      return [];
    }
    return category;
}
