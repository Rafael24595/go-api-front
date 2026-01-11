import { useEffect, useState } from "react";
import CodeMirror, { EditorState } from "@uiw/react-codemirror";
import { html, } from "@codemirror/lang-html";
import { lintGutter } from "@codemirror/lint";
import { formatHtml } from "../../../../../../utils/Formatter";

import './HtmlView.css'

interface HtmlViewProps {
  value?: string;
  render?: boolean;
}

export function HtmlView({ value, render }: HtmlViewProps) {
  const [data, setFormattedValue] = useState<string>(value || '');

  useEffect(() => {
    const formatData = async () => {
      const formatted = await formatHtml(value);
      setFormattedValue(formatted);
    };

    formatData();
  }, [value]);

  return (
    <>
      {render ? (
        <CodeMirror
          value={data}
          height="100%"
          extensions={[
            html(),
            lintGutter(),
            EditorState.readOnly.of(true)]}
          theme="light"
        />
      )
        : (
          <iframe
            sandbox="allow-same-origin"
            srcDoc={data}
            style={{
              width: "100%",
              height: "100%",
              border: "none"
            }}
          />
        )}
    </>
  );
}