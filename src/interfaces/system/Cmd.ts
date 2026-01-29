export interface CmdRecord {
    request: boolean
    content: string
}

export interface CmdLocalApp {
    order: number
    flag: string
    help: string
    exec: (cmd: CmdRecord) => void
}