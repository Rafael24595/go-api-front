import CodeMirror from "@uiw/react-codemirror";
import { json, jsonParseLinter  } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";

import './JsonData.css'

export const CONTENT_TYPE = "json";

interface Payload {
  value: string;
  onValueChange: (content: string, payload: string) => void;
}

export function JsonData({value, onValueChange}: Payload) {
    const onChange = (value: string) => {
      onValueChange(CONTENT_TYPE, value);
    };

    return (
        <>
            <CodeMirror
                value={value}
                height="300px"
                extensions={[json(), linter(jsonParseLinter()), lintGutter()]}
                onChange={onChange}
                theme="light"
            />
        </>
    )
}