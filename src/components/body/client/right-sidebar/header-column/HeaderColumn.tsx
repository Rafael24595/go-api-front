import { StatusKeyValue } from '../../../../../interfaces/StatusKeyValue';
import './HeaderColumn.css'

interface HeaderColumnProps {
    header?: StatusKeyValue[]
}

interface Payload {
    header: StatusKeyValue[]
}

export function HeaderColumn({header}: HeaderColumnProps) {
    const data: Payload = {
        header: header ? header : []
    }

    return (
        <>
            {data.header.length > 0 ? (
                <table className="table-styled table-fix">
                    <tbody>
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                            {data.header.map((header) => (
                                <tr>
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