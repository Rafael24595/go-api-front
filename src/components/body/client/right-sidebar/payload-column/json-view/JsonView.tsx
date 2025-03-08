import CodeMirror, { EditorState } from "@uiw/react-codemirror";
import { json, jsonParseLinter  } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";

import './JsonView.css'

interface JsonViewProps {
  value?: string;
}

interface Payload {
  value: string;
}

export function JsonView({value}: JsonViewProps) {
    const data: Payload = {
      value: value ? value : "{}"
    }

    return (
        <>
            <CodeMirror
                value={data.value}
                height="300px"
                extensions={[
                  json(), 
                  linter(jsonParseLinter()), 
                  lintGutter(), EditorState.readOnly.of(true)
                ]}
                theme="light"
            />
        </>
    )
}