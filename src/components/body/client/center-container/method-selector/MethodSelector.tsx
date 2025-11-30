import { useEffect, useState } from 'react';
import { HTTP_METHODS } from '../../../../../constants/HttpMethod';
import { useStoreRequest } from '../../../../../store/client/StoreProviderRequest';

import './MethodSelector.css'

export function MethodSelector () {
    const {request, updateMethod } = useStoreRequest();
    const [selected, setSelectedMethod] = useState(request.method);

    useEffect(() => {
        setSelectedMethod(request.method);
    }, [request.method]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMethod(e.target.value);
        updateMethod(e.target.value)
    };

    return (
        <select id="method" className="client-bar-component section-header-element" name="method" value={selected} onChange={handleChange}>
            {HTTP_METHODS.map((method, index) => (
                <option key={index} value={method}>
                    {method}
                </option>
            ))}
        </select>
    )
}