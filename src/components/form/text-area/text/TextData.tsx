import CodeMirror from "@uiw/react-codemirror";
import { lintGutter } from "@codemirror/lint";
import { useEffect, useState } from "react";
import { handleTab } from "../../../../utils/CodeMirrorHelper";

import './TextData.css';

export const CONTENT_TYPE = "text";

interface Payload {
  payload?: string;
  onValueChange: (contentType: string, payload: string) => void;
}

const defaultPayload = (payload?: string) => {
  return payload || "";
}

export function TextData({ payload, onValueChange }: Payload) {
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
        extensions={[lintGutter()]}
        onChange={onChange}
        onKeyDownCapture={handleTab}
      />
    </div>
  );
}
