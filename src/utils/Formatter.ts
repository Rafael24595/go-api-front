
import * as prettier from 'prettier/standalone';
import * as babelParser from 'prettier/plugins/babel';
import * as htmlParser from 'prettier/parser-html';
import prettierEstreePlugin  from 'prettier/plugins/estree';

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