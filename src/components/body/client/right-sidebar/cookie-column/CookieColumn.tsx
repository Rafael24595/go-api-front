import { EAlertCategory } from '../../../../../interfaces/AlertData';
import { cookieToString } from '../../../../../interfaces/client/response/Response';
import { copyTextToClipboard } from '../../../../../services/Utils';
import { useStoreRequest } from '../../../../../store/client/StoreProviderRequest';
import { useAlert } from '../../../../utils/alert/Alert';

import './CookieColumn.css';

export function CookieColumn() {
    const { response } = useStoreRequest();

    const { push } = useAlert();
    
    const copyCookieToClipboard = (text: string) => {
        copyTextToClipboard(text, 
            () => push({
                    category: EAlertCategory.INFO,
                    content: "The cookie content has been copied to the clipboard"
                }),
            (err) => push({
                    category: EAlertCategory.ERRO,
                    content:`The cookie content could not be copied to the clipboard: ${err.message}`
                }),
        );
    }

    return (
        <>
            {response.cookies.length > 0 ? (
                <table className="table-styled table-fix">
                    <tbody>
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                        {response.cookies.map((cookie, i) => (
                            <tr key={ `${cookie.code}-${i}` }>
                                <td>
                                    { cookie.code }
                                </td>
                                <td>
                                    <button 
                                        className="button-paragraph" 
                                        type="button" 
                                        onClick={() => copyCookieToClipboard(cookie.value)}>
                                            { cookieToString(cookie) }
                                    </button>
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