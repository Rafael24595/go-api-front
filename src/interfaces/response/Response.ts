import { Cookies, Headers } from "../request/Request"

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

export interface Body {
    status: boolean
    content_type: string
    bytes: string
  }