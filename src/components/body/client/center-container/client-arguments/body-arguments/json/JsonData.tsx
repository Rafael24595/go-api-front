import CodeMirror from "@uiw/react-codemirror";
import { json, jsonParseLinter  } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";
import { ItemBodyParameter } from "../../../../../../../interfaces/request/Request";
import { useStoreRequest } from "../../../../../../../store/StoreProviderRequest";
import { useEffect, useState } from "react";
import { DOCUMENT_PARAM, PAYLOAD_PARAM } from "../BodyArguments";
import { Optional } from "../../../../../../../types/Optional";
import { Dict } from "../../../../../../../types/Dict";

import './JsonData.css';

export const CONTENT_TYPE = "json";

interface Payload {
  onValueChange: (content: string, parameter: ItemBodyParameter) => void;
}

export function JsonData({ onValueChange }: Payload) {
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
        <>
            <CodeMirror
                value={ data != undefined ? data.value : "" }
                height="300px"
                extensions={[json(), linter(jsonParseLinter()), lintGutter()]}
                onChange={onChange}
                theme="light"
            />
        </>
    )
}

const findParameter = (parameters: Dict<ItemBodyParameter[]>) => {
    const category = parameters[DOCUMENT_PARAM];
    if(!category) {
      return undefined;
    }
    return category.find(p => p.key == PAYLOAD_PARAM);
}