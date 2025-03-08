import { Cookie, cookieToString } from '../../../../../interfaces/request/Request'
import './CookieColumn.css'

interface CookieColumnProps {
    cookie?: Cookie[]
}

interface Payload {
    cookie: Cookie[]
}

export function CookieColumn({cookie}: CookieColumnProps) {
    const data: Payload = {
        cookie: cookie ? cookie : []
    };

    return (
        <>
            <table className="table-styled table-fix">
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Value</th>
                    </tr>
                    {data.cookie.map((cookie) => (
                        <tr>
                            <td>
                                { cookie.code }
                            </td>
                            <td>
                                { cookieToString(cookie) }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}