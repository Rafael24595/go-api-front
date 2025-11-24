import { ComboForm } from "../../../../../../interfaces/ComboOption";
import { LiteEndPoint } from "../../../../../../interfaces/mock/EndPoint";

export const endPointGroupOptions = (actions: {

}) => {
    return [
    ]
}

export const endPointOptions = (endPoint: LiteEndPoint, actions: {
    isCached: (endPoint: LiteEndPoint) => boolean;
    discard: (endPoint: LiteEndPoint) => void;
}) => {
    return [
        {
            icon: "🧹",
            label: "Discard",
            title: "Discard changes",
            disable: !actions.isCached(endPoint),
            action: () => actions.discard(endPoint)
        },
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