import CodeMirror, { EditorState } from "@uiw/react-codemirror";
import { lintGutter } from "@codemirror/lint";

import './TextView.css'

interface TextViewProps {
  value?: string;
}

interface Payload {
  value: string;
}

export function TextView({value}: TextViewProps) {
    const data: Payload = {
      value: value ? value : ""
    }

    return (
        <>
            <CodeMirror
                value={data.value}
                height="300px"
                extensions={[
                  lintGutter(), EditorState.readOnly.of(true)
                ]}
                theme="light"
            />
        </>
    )
}