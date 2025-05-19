import { EAlertCategory } from '../../../../../interfaces/AlertData';
import { copyTextToClipboard } from '../../../../../services/Utils';
import { useStoreRequest } from '../../../../../store/StoreProviderRequest';
import { useAlert } from '../../../../utils/alert/Alert';

import './HeaderColumn.css';

export function HeaderColumn() {
    const { response } = useStoreRequest();

    const { push } = useAlert();

    const copyHeaderToClipboard = (text: string) => {
        copyTextToClipboard(text, 
            () => push({
                    category: EAlertCategory.INFO,
                    content: "The header content has been copied to the clipboard"
                }),
            (err) => push({
                    category: EAlertCategory.ERRO,
                    content:`The header content could not be copied to the clipboard: ${err.message}`
                }),
        );
    }

    return (
        <>
            {response.headers.length > 0 ? (
                <table className="table-styled table-fix">
                    <tbody>
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                            {response.headers.map((header) => (
                                <tr key={header.key}>
                                    <td>
                                        { header.key }
                                    </td>
                                    <td>
                                        <button 
                                            className="button-paragraph" 
                                            type="button" 
                                            onClick={() => copyHeaderToClipboard(header.value)}>
                                                { header.value }
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            ) : (
                <p className="no-data"> - No Headers found - </p>
            )}
        </>
    )
}