import { useEffect, useState } from "react";
import CodeMirror, { EditorState } from "@uiw/react-codemirror";
import { json, jsonParseLinter  } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";
import { formatJson } from "../../../../../../utils/Formatter";

import './JsonView.css'

interface JsonViewProps {
  value?: string;
}

export function JsonView({value}: JsonViewProps) {
    const [data, setFormattedValue] = useState<string>(value || '');
    
    useEffect(() => {
      const formatData = async () => {
        const formatted = await formatJson(value);
        setFormattedValue(formatted);
      };
  
      formatData();
    }, [value]);

    return (
        <>
            <CodeMirror
                value={data}
                height="100%"
                width="100%"
                extensions={[
                  json(), 
                  linter(jsonParseLinter()), 
                  lintGutter(),
                  EditorState.readOnly.of(true)
                ]}
                theme="light"
            />
        </>
    )
}