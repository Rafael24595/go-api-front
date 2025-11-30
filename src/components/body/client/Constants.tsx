import { parseCurlBlob, parseJsonBlob } from "../../../services/Utils"
import { ImportModalDataProps, ImportModalInput } from "../../form/import-modal/ImportModal"

export const importModalRequestDefinition = <T,>(): ImportModalDataProps<T> => {
    return {
        title: <span>Import Requests</span>,
        cacheKey: "ImportModalCollectionInputType",
        dimension: {
            width: "50%",
            height: "45%",
            maxWidth: "800px",
            maxHeight: "450px"
        },
        placeholder: "",
        cursors: [ImportModalInput.CURSOR_LOCAL, ImportModalInput.CURSOR_TEXT],
        parseBlob: parseJsonBlob,
    }
}

export const importModalCurlDefinition =  (): ImportModalDataProps <string> => {
    return {
        title: <span>Import cURL sentences</span>,
        cacheKey: "ImportModalCollectionInputType",
        dimension: {
            width: "50%",
            height: "45%",
            maxWidth: "800px",
            maxHeight: "450px"
        },
        placeholder: "",
        cursors: [ImportModalInput.CURSOR_LOCAL, ImportModalInput.CURSOR_TEXT],
        parseBlob: parseCurlBlob,
    }
}
