import { cookieToString } from '../../../../../interfaces/response/Response';
import { useStoreRequest } from '../../../../../store/StoreProviderRequest';

import './CookieColumn.css'

export function CookieColumn() {
    const { response } = useStoreRequest();

    return (
        <>
            {response.cookies.length > 0 ? (
                <table className="table-styled table-fix">
                    <tbody>
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                        {response.cookies.map((cookie) => (
                            <tr key={ cookie.code }>
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
            ) : (
                <p className="no-data"> - No cookies found - </p>
            )}
        </>
    )
}