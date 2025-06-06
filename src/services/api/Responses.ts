import { Request } from "../../interfaces/request/Request";
import { Response } from "../../interfaces/response/Response";

export interface ResponseExecuteAction {
    request: Request,
    response?: Response
}

export interface ResponseFetch<T> {
    promise: Promise<T>;
    cancel: () => void
}