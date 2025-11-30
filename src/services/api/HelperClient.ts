import axios from "axios";

export async function fetchFile(uri: string) {
    const response = await axios.get(uri, { responseType: 'blob' });
    const fileName = fileNameFromURI(uri);

    const file = new File([response.data], fileName, { type: "blob" });

    return file;
}

function fileNameFromURI(uri: string) {
    const pathname = new URL(uri).pathname;
    return decodeURIComponent(pathname.substring(pathname.lastIndexOf('/') + 1));
}

export const queryHelper = (...query: [string, any][]): string => {
  const result = query.filter(([_k, v]) => v != undefined)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  if (result == "") {
    return result
  }

  return `?${result}`
};