import { FindOptions } from "./StoreProviderStatus"

export const booleanParser = (def?: boolean): FindOptions<boolean> => {
    return {
        def: def != undefined ? def : true,
        parser: (v) => v == "true"
    }
}

export const jsonParser = (def?: any): FindOptions<any> => {
    return {
        def: def != undefined ? def : {},
        parser: (v) => JSON.parse(v)
    }
}

