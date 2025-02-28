import { useState } from 'react';

import './MethodSelector.css'
import { HttpMethod } from '../../../../../constants/HttpMethod';

interface MethodSelectorProps {
    selected?: string;
    onMethodChange: (method: string) => void;
}

export function MethodSelector ({selected, onMethodChange }: MethodSelectorProps) {
    const methods = Object.values(HttpMethod);
    const [selectedMethod, setSelectedMethod] = useState(selected || methods[0]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMethod(e.target.value);
        onMethodChange(e.target.value)
    };

    return (
        <select id="method" className="client-bar-component" name="method" value={selectedMethod} onChange={handleChange}>
            {methods.map((method, index) => (
                <option key={index} value={method}>
                    {method}
                </option>
            ))}
        </select>
    )
}