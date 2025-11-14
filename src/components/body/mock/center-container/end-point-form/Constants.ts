import { DEFAULT_RESPONSE, ItemResponse } from "../../../../../interfaces/mock/Response";

export const responseOptions = (response: ItemResponse, actions: {
    delete: (response: ItemResponse) => void;
    rename: (response: ItemResponse) => void;
}) => {
    return [
        {
            icon: "🗑️",
            label: "Delete",
            title: "Delete response",
            action: () => actions.delete(response),
            disable: response.name == DEFAULT_RESPONSE
        },
        {
            icon: "✏️",
            label: "Rename",
            title: "Rename response",
            action: () => actions.rename(response),
            disable: response.name == DEFAULT_RESPONSE
        }
    ]
}