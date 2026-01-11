import { Dict } from "../../types/Dict"

export interface RawWebData {
    id: string
    timestamp: number
    data: Dict<string>
    modified: number
    owner: string
}

export interface WebData {
    id: string
    timestamp: number
    data: Data
    modified: number
    owner: string
}

export interface FormWebData {
    theme?: string
}

interface Data {
    theme: string
}

export const emptyWebData = (): WebData => {
    return {
        id: "",
        timestamp: 0,
        data: {
            theme: ""
        },
        modified: 0,
        owner: ""
    }
}

export const rawToWebData = (raw: RawWebData): WebData => {
    const data: Data = {
        theme: raw.data["theme"] || ""
    }

    return {
        ...raw,
        data: data,
    }
}
