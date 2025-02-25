import { useState } from "react";

import './ContentContainer.css'
import { MethodSelector } from "./method-selector/MethodSelector";
import { ArgumentsSelector } from "./client-arguments/ArgumentsSelector";

export function ContentContainer() {
    const [formData, setFormData] = useState({
        url: "",
        method: ""
      });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMethodChange = (method: string) => {
        setFormData({ ...formData, method });
    };

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        console.log("Form Data Submitted:", formData);
    };

    return (
        <div id='content-container'>
            <form id="client-form" onSubmit={handleSubmit}>
                <div id="client-bar">
                    <MethodSelector selected={formData.method} onMethodChange={handleMethodChange}/>
                    <input id="url" className="client-bar-component" name="url" type="text" onChange={handleChange} value={formData.url}/>
                    <button id="client-button-send" className="client-bar-component">Send</button>
                </div>
                <div id="client-content">
                    <ArgumentsSelector/>
                </div>
                <div id="client-buttons" className="border-top">
                    <button type="submit">Save</button>
                </div>
            </form>
        </div>
    )
}