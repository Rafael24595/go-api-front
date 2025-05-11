import { useStoreRequest } from '../../../../../store/StoreProviderRequest';

import './HeaderColumn.css'

export function HeaderColumn() {
    const { response } = useStoreRequest();

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
                                        { header.value }
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