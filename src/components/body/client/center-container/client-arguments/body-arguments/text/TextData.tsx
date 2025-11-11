import CodeMirror from "@uiw/react-codemirror";
import { lintGutter } from "@codemirror/lint";
import { ItemBodyParameter } from "../../../../../../../interfaces/client/request/Request";
import { useStoreRequest } from "../../../../../../../store/client/StoreProviderRequest";
import { useEffect, useState } from "react";
import { Optional } from "../../../../../../../types/Optional";
import { DOCUMENT_PARAM, PAYLOAD_PARAM } from "../BodyArguments";
import { Dict } from "../../../../../../../types/Dict";
import { handleTab } from "../../../../../../../utils/CodeMirrorHelper";

import './TextData.css';

export const CONTENT_TYPE = "text";

interface Payload {
  onValueChange: (content: string, parameter: ItemBodyParameter) => void;
}

export function TextData({ onValueChange }: Payload) {
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
            extensions={[lintGutter()]}
            onChange={onChange}
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