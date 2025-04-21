import { useEffect, useState } from 'react';
import { HttpMethod } from '../../../../../constants/HttpMethod';
import { useStoreRequest } from '../../../../../store/StoreProviderRequest';

import './MethodSelector.css'

export function MethodSelector () {
    const {request, updateMethod } = useStoreRequest();
    const methods = Object.values(HttpMethod);
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
            {methods.map((method, index) => (
                <option key={index} value={method}>
                    {method}
                </option>
            ))}
        </select>
    )
}