import { v4 as uuidv4 } from 'uuid';

export interface StatusCategoryKeyValue {
    order: number
    status: boolean
    category: string
    key: string
    value: string
}

export interface ItemStatusCategoryKeyValue {
    id: string
    order: number
    status: boolean
    category: string
    key: string
    value: string
    focus: string
}

export const toItem = (rowsStr: StatusCategoryKeyValue[]): ItemStatusCategoryKeyValue[] => {
    if(!rowsStr) {
        return [];
    }
    return fixOrder([...rowsStr]
        .sort((a, b) => a.order - b.order)
        .map(r => ({...r, id: makeKey(r), focus: ""})));
}

export const fixOrder = (argument: ItemStatusCategoryKeyValue[]) => {
    return argument.map((item, i) => {
        item.order = i;
        return item;
    });
}

const makeKey = (argument: ItemStatusCategoryKeyValue | StatusCategoryKeyValue) => {
    return `${argument.category}-${argument.order}-${uuidv4()}`;
}