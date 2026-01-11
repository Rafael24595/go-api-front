import CodeMirror from "@uiw/react-codemirror";
import { xml } from "@codemirror/lang-xml";
import { linter, lintGutter } from "@codemirror/lint";
import { xmlLinter } from "../../../../utils/Formatter";
import { handleTab } from "../../../../utils/CodeMirrorHelper";

import './XmlData.css';

export const CONTENT_TYPE = "xml";

interface Payload {
  payload?: string;
  onValueChange: (contentType: string, payload: string) => void;
}

const defaultPayload = (payload?: string) => {
  return payload || "<root></root>";
}

export function XmlData({ payload, onValueChange }: Payload) {
  const onChange = (payload: string) => {
    onValueChange(CONTENT_TYPE, payload);
  };

  return (
    <div id="sub-argument-content" className="grid">
      <CodeMirror
        value={defaultPayload(payload)}
        height="100%"
        width="100%"
        extensions={[xml(), linter(xmlLinter()), lintGutter()]}
        onChange={onChange}
        theme="light"
        onKeyDownCapture={handleTab}
      />
    </div>
  )
}
