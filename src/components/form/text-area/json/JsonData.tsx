import CodeMirror from "@uiw/react-codemirror";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";
import { useEffect, useState } from "react";

import './JsonData.css';
import { handleTab } from "../../../../utils/CodeMirrorHelper";

export const CONTENT_TYPE = "json";

interface Payload {
  payload?: string;
  onValueChange: (contentType: string, payload: string) => void;
}

const defaultPayload = (payload?: string) => {
  return payload || "{}";
}

export function JsonData({ payload, onValueChange }: Payload) {
  const [data, setData] = useState<string>(defaultPayload(payload));

  useEffect(() => {
    setData(defaultPayload(payload));
  }, [payload]);

  const onChange = (payload: string) => {
    setData(payload);
    onValueChange(CONTENT_TYPE, payload);
  };

  return (
    <div id="sub-argument-content" className="grid">
      <CodeMirror
        value={data}
        height="100%"
        width="100%"
        extensions={[json(), linter(jsonParseLinter()), lintGutter()]}
        onChange={onChange}
        theme="light"
        onKeyDownCapture={handleTab}
      />
    </div>
  );
}
