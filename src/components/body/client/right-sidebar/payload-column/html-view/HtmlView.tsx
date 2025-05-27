import { useEffect, useState } from "react";
import CodeMirror, { EditorState } from "@uiw/react-codemirror";
import { html, } from "@codemirror/lang-html";
import { lintGutter } from "@codemirror/lint";
import { formatHtml } from "../../../../../../utils/Formatter";

import './HtmlView.css'

interface HtmlViewProps {
  value?: string;
}

export function HtmlView({ value }: HtmlViewProps) {
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
      <CodeMirror
        value={data}
        height="100%"
        extensions={[
          html(),
          lintGutter(),
          EditorState.readOnly.of(true)]}
        theme="light"
      />
    </>
  );
}