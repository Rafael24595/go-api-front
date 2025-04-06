import CodeMirror from "@uiw/react-codemirror";
import { lintGutter } from "@codemirror/lint";

import './TextData.css'

export const CONTENT_TYPE = "text";

interface Payload {
  value: string;
  onValueChange: (content: string, payload: string) => void;
}

export function TextData({value, onValueChange}: Payload) {   
    const onChange = (value: string) => {
      onValueChange(CONTENT_TYPE, value);
    };

    return (
        <>
            <CodeMirror
                value={value}
                height="300px"
                extensions={[lintGutter()]}
                onChange={onChange}
                theme="light"
            />
        </>
    )
}