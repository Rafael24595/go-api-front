import { useEffect, useState } from "react";
import CodeMirror, { EditorState } from "@uiw/react-codemirror";
import { html, } from "@codemirror/lang-html";
import { lintGutter } from "@codemirror/lint";
import { formatXml } from "../../../../../../utils/Formatter";

import './XmlView.css'

interface XmlViewProps {
  value?: string;
}

export function XmlView({ value }: XmlViewProps) {
  const [data, setFormattedValue] = useState<string>(value || '');

  useEffect(() => {
    const formatData = async () => {
      const formatted = await formatXml(value);
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