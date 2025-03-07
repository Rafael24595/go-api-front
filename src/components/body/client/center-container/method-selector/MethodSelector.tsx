import { useState } from 'react';
import { HttpMethod } from '../../../../../constants/HttpMethod';

import './MethodSelector.css'

interface MethodSelectorProps {
    selected: string;
    onMethodChange: (method: string) => void;
}

export function MethodSelector ({selected, onMethodChange }: MethodSelectorProps) {
    const methods = Object.values(HttpMethod);
    const [selectedMethod, setSelectedMethod] = useState(selected);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMethod(e.target.value);
        onMethodChange(e.target.value)
    };

    return (
        <select id="method" className="client-bar-component section-header-element" name="method" value={selectedMethod} onChange={handleChange}>
            {methods.map((method, index) => (
                <option key={index} value={method}>
                    {method}
                </option>
            ))}
        </select>
    )
}