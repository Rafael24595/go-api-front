import { Body, Cookies, Headers } from "../request/Request"

export interface Response {
    id: string
    request: string
    date: number
    time: number
    status: number
    headers: Headers
    cookies: Cookies
    body: Body
    size: number
}