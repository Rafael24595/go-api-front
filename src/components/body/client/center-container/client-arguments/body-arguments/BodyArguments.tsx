import { useState } from 'react';

import CodeMirror from "@uiw/react-codemirror";
import { json, jsonParseLinter  } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";

import './BodyArguments.css'

export function BodyArguments() {
    const [code, setCode] = useState("{}");
    
      const onChange = (value: string) => {
        setCode(value);
        console.log("Updated code:", value);
      };

    return (
        <>
            <p>//TODO: Implement BodyArguments</p>
            <CodeMirror
                value={code}
                height="300px"
                extensions={[json(), linter(jsonParseLinter()), lintGutter()]}
                onChange={onChange}
                theme="light"
            />
        </>
    )
}