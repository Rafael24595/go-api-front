
import * as prettier from 'prettier/standalone';
import * as babelParser from 'prettier/plugins/babel';
import * as htmlParser from 'prettier/parser-html';
import prettierEstreePlugin  from 'prettier/plugins/estree';
import { EditorView } from '@uiw/react-codemirror';
import { Diagnostic } from '@codemirror/lint';

export const formatJson = async (text?: string) => {
    try {
        const object = JSON.parse(text || "");
        text = JSON.stringify(object, null, 2)
    } catch {
        //
    }

    return await prettier.format(text || "", {
        parser: 'json',
        plugins: [babelParser, prettierEstreePlugin],
    });
}

export const formatHtml = async(text?: string) => {
    return await prettier.format(text || "", {
        parser: 'html',
        plugins: [htmlParser],
    });
}

//TODO: Use a real parser.
export const formatXml = async(text?: string) => {
    text = (text || "").replace(/></g, '> <');
    return await prettier.format(text, {
        parser: 'html',
        plugins: [htmlParser],
    });
}

export const xmlLinter = () => (view: EditorView): Diagnostic[] => {
    const diagnostics: Diagnostic[] = [];
    const xmlText = view.state.doc.toString();

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlText, "application/xml");
        const error = doc.querySelector("parsererror");

        if (error) {
            diagnostics.push({
                from: 0,
                to: xmlText.length,
                severity: "error",
                message: error.textContent || "Invalid XML",
            });
        }
    } catch (e: any) {
        diagnostics.push({
            from: 0,
            to: xmlText.length,
            severity: "error",
            message: e.message || "Unknown XML error",
        });
    }

    return diagnostics;
};