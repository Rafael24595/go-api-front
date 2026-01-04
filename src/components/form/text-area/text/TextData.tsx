import CodeMirror from "@uiw/react-codemirror";
import { lintGutter } from "@codemirror/lint";
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
  const onChange = (payload: string) => {
    onValueChange(CONTENT_TYPE, payload);
  };

  return (
    <div id="sub-argument-content" className="grid">
      <CodeMirror
        value={defaultPayload(payload)}
        height="100%"
        width="100%"
        extensions={[lintGutter()]}
        onChange={onChange}
        onKeyDownCapture={handleTab}
      />
    </div>
  );
}
