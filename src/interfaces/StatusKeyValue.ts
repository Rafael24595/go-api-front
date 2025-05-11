import { v4 as uuidv4 } from 'uuid';

export interface StatusKeyValue {
    order: number
    status: boolean
    key: string
    value: string
}

export interface ItemStatusKeyValue {
    id: string
    order: number
    status: boolean
    key: string
    value: string
    focus: string
}

export const toItem = (rowsStr: StatusKeyValue[]): ItemStatusKeyValue[] => {
    if(!rowsStr) {
        return [];
    }
    return [...rowsStr]
        .sort((a, b) => a.order - b.order)
        .map(r => ({...r, id: makeKey(r), focus: ""}));
}

export const fixOrder = (argument: ItemStatusKeyValue[]) => {
    return argument.map((item, i) => {
        item.order = i;
        return item;
    });
}

export const cleanCopy = (argument: ItemStatusKeyValue[]): ItemStatusKeyValue[] => {
    return [...argument].map((r, i) => ({...r, 
        order: i,
        focus: "",
    }));
}

const makeKey = (argument: ItemStatusKeyValue | StatusKeyValue) => {
    return `${argument.order}-${uuidv4()}`;
}