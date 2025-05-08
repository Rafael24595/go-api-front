import CodeMirror, { EditorState } from "@uiw/react-codemirror";
import { lintGutter } from "@codemirror/lint";

import './TextView.css';

interface TextViewProps {
  value?: string;
}

export function TextView({value}: TextViewProps) {
    const data: string = value ? value : "";

    return (
        <>
            <CodeMirror
                value={data}
                height="100%"
                width="100%"
                extensions={[
                  lintGutter(), 
                  EditorState.readOnly.of(true)
                ]}
                theme="light"
            />
        </>
    )
}