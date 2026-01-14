import { Request } from "../../interfaces/client/request/Request";
import { Response } from "../../interfaces/client/response/Response";

export interface ResponseExecuteAction {
    request: Request,
    response?: Response
}

export interface ResponseFetch<T> {
    promise: Promise<T>;
    cancel: () => void
}

export interface CmdExecResult {
    input: string
    output: string
}

export interface CmdCompHelp {
    message: string
    application: string
    position: number
    lenght: number
}
