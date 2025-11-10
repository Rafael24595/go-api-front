import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { fetchCmd } from "../../services/api/ServiceManager";
import { api } from "../../services/api/ApiManager";
import { useStoreSession } from "../../store/StoreProviderSession";

import './Terminal.css';

interface CmdRecord {
    request: boolean
    content: string
}

interface PayloadCmd {
    cursor: number
    records: CmdRecord[]
    history: CmdRecord[]
}

export function Cmd() {
    const [linesData, setLinesData] = useState<PayloadCmd>({
        cursor: 0,
        records: [],
        history: []
    });

    const { userData, checkSession } = useStoreSession()

    const inputRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        runCommand("cmd -h", true)
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [linesData.records]);

    const focusCmd = () => {
        const selection = window.getSelection();

        if (selection && selection.toString().length > 0) {
            return;
        }

        inputRef.current?.focus();
    }

    const handleKeyDown = async (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
            return resolveEnter();
        }

        if (e.key === "ArrowUp") {
            return resolveMoveCursor(-1);
        }

        if (e.key === "ArrowDown") {
            return resolveMoveCursor(1);
        }
    };

    const resolveEnter = async () => {
        runCommand(inputRef.current?.innerText || "");

        if (inputRef.current) {
            inputRef.current.innerText = "";
        }
    };

    const runCommand = async (input: string, ignore?: boolean) => {
        const cmd: CmdRecord = {
            request: true,
            content: input.trim() || ""
        };

        switch (cmd.content) {
            case "cls":
            case "clear":
                return clean(cmd);
            case "exit":
                return exit();
            default:
                return exec(cmd, ignore);
        }
    };

    const clean = (cmd: CmdRecord) => {
        setLinesData((prevData) => ({
            ...prevData,
            cursor: 0,
            records: [],
            history: [
                ...prevData.history,
                cmd
            ]
        }));

        if (inputRef.current) {
            inputRef.current.innerHTML = "";
        }
    };

    const exit = async () => {
        await checkSession();
        window.close();
    };

    const exec = async (cmd: CmdRecord, ignore?: boolean) => {
        const result = await fetchCmd(cmd.content)
            .catch(e => `${e.message || "something goes wrong"}`);

        const output: CmdRecord[] = [];
        for (const c of result.split("\n")) {
            output.push({
                request: false,
                content: c
            })
        }

        if (ignore) {
            setLinesData((prevData) => ({
                ...prevData,
                cursor: prevData.history.length,
                records: [
                    ...prevData.records,
                    ...output,
                ]
            }));

            return;
        }

        setLinesData((prevData) => ({
            cursor: prevData.history.length + 1,
            records: [
                ...prevData.records,
                cmd,
                ...output,
            ],
            history: [
                ...prevData.history,
                cmd,
            ]
        }));
    };

    const resolveMoveCursor = async (step: number) => {
        const requests = linesData.history.filter(r => r.request);

        let newCursor = linesData.cursor + step;
        if (newCursor < 0) {
            newCursor = 0;
        }

        let clean = false;
        if (newCursor >= requests.length) {
            newCursor = requests.length;
            clean = true;
        }

        if (inputRef.current) {
            inputRef.current.innerText = !clean ? requests[newCursor].content : "";
        }

        setLinesData((prevData) => ({
            ...prevData,
            cursor: newCursor
        }));
    };

    return (
        <div id="terminal" onClick={focusCmd}>
            {linesData.records.map((line, i) => (
                <span key={i} className={`terminal-output ${line.request ? "request" : ""}`}>
                    {line.content}
                </span>
            ))}
            <div id="terminal-text-area">
                <span id="prompt">{userData.username}@go-api{api}/cmd&gt;</span>
                <span
                    ref={inputRef}
                    onKeyDown={handleKeyDown}
                    contentEditable={true}
                    spellCheck={false}
                    autoFocus
                />
            </div>
            <div ref={bottomRef} />
        </div>
    )
}