import { useEffect, useState } from "react";
import CodeMirror, { EditorState } from "@uiw/react-codemirror";
import { xml } from "@codemirror/lang-xml";
import { linter, lintGutter } from "@codemirror/lint";
import { formatXml, xmlLinter } from "../../../../../../utils/Formatter";

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
          xml(),
          linter(xmlLinter()),
          lintGutter(),
          EditorState.readOnly.of(true)]}
        theme="light"
      />
    </>
  );
}