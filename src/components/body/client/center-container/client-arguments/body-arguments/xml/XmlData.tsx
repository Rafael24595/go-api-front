import CodeMirror from "@uiw/react-codemirror";
import { xml } from "@codemirror/lang-xml";
import { linter, lintGutter } from "@codemirror/lint";
import { ItemBodyParameter } from "../../../../../../../interfaces/client/request/Request";
import { useStoreRequest } from "../../../../../../../store/client/StoreProviderRequest";
import { useEffect, useState } from "react";
import { DOCUMENT_PARAM, PAYLOAD_PARAM } from "../BodyArguments";
import { Optional } from "../../../../../../../types/Optional";
import { Dict } from "../../../../../../../types/Dict";
import { xmlLinter } from "../../../../../../../utils/Formatter";
import { handleTab } from "../../../../../../../utils/CodeMirrorHelper";

import './XmlData.css';

export const CONTENT_TYPE = "xml";

interface Payload {
  onValueChange: (content: string, parameter: ItemBodyParameter) => void;
}

export function XmlData({ onValueChange }: Payload) {
    const { request } = useStoreRequest();
    
    const [data, setData] = useState<Optional<ItemBodyParameter>>(findParameter(request.body.parameters));

    useEffect(() => {
        setData(findParameter(request.body.parameters));
    }, [request.body.parameters]);

    const onChange = (value: string) => {
      const newParameter = {
        id: "",
        order: 0,
        status: true,
        isFile: false,
        fileType: "",
        fileName: "",
        key: "",
        value: value,
        focus: ""
      };
      setData(newParameter);
      onValueChange(CONTENT_TYPE, newParameter);
    };

    return (
      <div id="sub-argument-content" className="grid">
        <CodeMirror
            value={ data != undefined ? data.value : "" }
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

const findParameter = (parameters: Dict<ItemBodyParameter[]>) => {
    const category = parameters[DOCUMENT_PARAM];
    if(!category) {
      return undefined;
    }
    return category.find(p => p.key == PAYLOAD_PARAM);
}