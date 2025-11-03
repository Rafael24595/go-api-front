export interface Token {
    id: string
    timestamp: number
    expire: number
    name: string
    description: string
    scopes: string[]
    owner: string
}

export const newToken = (expire: number, name: string, description: string, ...scopes: string[]): Token => {
    return {
        id: "",
        timestamp: Date.now(),
        name,
        expire,
        description,
        scopes,
        owner: ""
    }
}
