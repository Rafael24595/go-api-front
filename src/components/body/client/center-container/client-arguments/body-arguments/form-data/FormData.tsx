import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FieldFormData } from './FieldFormData';
import { CleanItemBodyParameter, cloneItemBodyParameter, ItemBodyParameter, orderItemBodyParameter } from '../../../../../../../interfaces/client/request/Request';
import { useStoreRequest } from '../../../../../../../store/client/request/StoreProviderRequest';
import { FORM_DATA_PARAM } from '../BodyArguments';
import { Dict } from '../../../../../../../types/Dict';
import { PositionWrapper, VerticalDragDrop } from '../../../../../../utils/drag/VerticalDragDrop';

import './FormData.css';

export const CONTENT_TYPE = "form";

interface FormDataProps {
  onValueChange: (content: string, parameter: ItemBodyParameter[]) => void;
}

interface Payload {
    empty: string
    items: ItemBodyParameter[]
}

export function FormData({ onValueChange }: FormDataProps) {
    const { request } = useStoreRequest();

    const [data, setData] = useState<Payload>({
        empty: uuidv4(),
        items: filterParameters(request.body.parameters)
    });

    useEffect(() => {
        setData((prevData) => ({
            ...prevData,
            items: filterParameters(request.body.parameters)
        }));
    }, [request.body.parameters]);

    const makeKey = (request: ItemBodyParameter): string => {
        return `form-data-param-${request.id}`;
    }

    const rowTrim = (order: number) => {
        if(order < 0 || data.items.length < order ) {
            onValueChange(CONTENT_TYPE, []);
            return;
        }

        let newRows = cloneItemBodyParameter(data.items);
        newRows.splice(order, 1);
        
        newRows = orderItemBodyParameter(newRows);

        setData((prevData) => ({
            ...prevData,
            items: newRows
        }));

        onValueChange(CONTENT_TYPE, newRows);
    }

    const rowPush = (row: CleanItemBodyParameter, focus: string, order?: number) => {
        let newEmpty= data.empty;
        let newRows = cloneItemBodyParameter(data.items);

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

        newRows = orderItemBodyParameter(newRows);

        setData({
            empty: newEmpty,
            items: newRows
        });

        onValueChange(CONTENT_TYPE, newRows);
    }

    const updateOrder = async (items: PositionWrapper<ItemBodyParameter>[]) => {
        const newRows = cloneItemBodyParameter(items.map(i => i.item));
        setData((prevData) => ({
            ...prevData,
            items: newRows
        }));
        onValueChange(CONTENT_TYPE, newRows);
    };

    return (
        <VerticalDragDrop
            id="sub-argument-content"
            items={data.items}
            itemId={makeKey}
            onItemsChange={updateOrder}
            renderItem={(item, i) => (
                <FieldFormData
                    key={`form-data-param-${item.id}`}
                    order={i}
                    focus={item.focus}
                    value={item}
                    rowPush={rowPush}
                    rowTrim={rowTrim}
                />
            )}
            afterTemplate={(
                <FieldFormData 
                    key={uuidv4()}
                    disabled={true}
                    rowPush={rowPush}
                    rowTrim={rowTrim}
                />
            )}
        />
    )
}

const filterParameters = (parameters: Dict<ItemBodyParameter[]>): ItemBodyParameter[] => {
    const category = parameters[FORM_DATA_PARAM];
    if(!category) {
      return [];
    }
    return category;
}
