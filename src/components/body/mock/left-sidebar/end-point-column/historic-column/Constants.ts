import { ComboForm } from "../../../../../../interfaces/ComboOption";
import { LiteEndPoint } from "../../../../../../interfaces/mock/EndPoint";

export const endPointGroupOptions = (actions: {

}) => {
    return [
    ]
}

export const endPointOptions = (endPoint: LiteEndPoint, actions: {

}) => {
    return [
    ]
}

export const searchOptions = (): ComboForm[] => {
    return [
        {
            label: "Name",
            name: "name",
            title: "Filter by name",
        },
        {
            label: "Date",
            name: "timestamp",
            title: "Filter by date",
        },
        {
            label: "Method",
            name: "method",
            title: "Filter by method",
        },
        {
            label: "Path",
            name: "path",
            title: "Filter by path",
        },
        {
            label: "Safe",
            name: "safe",
            title: "Filter by safe status",
        },
    ]
}