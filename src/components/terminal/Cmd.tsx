import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { fetchCmdComp, fetchCmdExec } from "../../services/api/ServiceManager";
import { api } from "../../services/api/ApiManager";
import { useStoreSession } from "../../store/system/StoreProviderSession";
import { CmdCompHelp } from "../../services/api/Responses";

import './Terminal.css';

interface CmdRecord {
    request: boolean
    content: string
}

interface PayloadCmd {
    cursor: number
    records: CmdRecord[]
    history: CmdRecord[]
    reference: string
    step: number
}

export function Cmd() {
    const [linesData, setLinesData] = useState<PayloadCmd>({
        cursor: 0,
        records: [],
        history: [],
        reference: "",
        step: -1,
    });

    const { userData, checkSession } = useStoreSession()

    const inputRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        runCommand("cmd -h", true)
        inputRef.current?.focus();
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

        if (e.key === "Tab") {
            e.preventDefault();
            return resolveTab();
        }

        setLinesData(prevData => ({
            ...prevData,
            reference: "",
            step: -1,
        }));
    };

    const resolveEnter = async () => {
        runCommand(inputRef.current?.innerText || "");

        if (inputRef.current) {
            inputRef.current.innerText = "";
        }
    };

    const resolveTab = async () => {
        comp(linesData.reference || inputRef.current?.innerText || "");
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
            cursor: prevData.history.length + 1,
            records: [],
            history: [
                ...prevData.history,
                cmd
            ],
            reference: "",
            step: -1
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
        const result = await fetchCmdExec(cmd.content)
            .catch(e => ({ input: "", output: `${e.message || "something goes wrong"}` }));

        if (result.input != "") {
            cmd = {
                content: result.input,
                request: cmd.request 
            }
        }

        setLinesData(prevData => {
            let newRecords = [...prevData.records];
            let newHistory = [...prevData.history];
            let newCursor = prevData.history.length;

            if (!ignore) {
                newRecords.push(cmd);
                newHistory.push(cmd);
                newCursor += 1;
            }

            newRecords.push(...cmdToRecord(result.output));

            return {
                ...prevData,
                cursor: newCursor,
                records: newRecords,
                history: newHistory,
                reference: "",
                step: -1,
            }

        });
    };

    const comp = async (cmd: string) => {
        const result: CmdCompHelp = await fetchCmdComp(cmd, linesData.step || -1)
            .catch(e => {
                return {
                    message: `${e.message || "something goes wrong"}`,
                    position: -1,
                    application: cmd,
                    lenght: 0
                };
            });

        const application = result.application ? result.application : cmd;

        if (inputRef.current) {
            defineInnerText(inputRef.current, application);
        }

        setLinesData(prevData => {
            let newRecords = [...prevData.records];
            let newHistory = [...prevData.history];
            let newCursor = prevData.history.length;

            let newCmd = result.lenght == 1 ? application : cmd;
            let newReference = prevData.reference == "" ? newCmd : prevData.reference;

            if (result.message) {
                prevData.records.push({
                    request: true,
                    content: cmd.trim() || ""
                });
                prevData.records.push(...cmdToRecord(result.message));
            }

            if (result.application) {
                newHistory.push({
                    request: true,
                    content: result.application.trim() || ""
                });
                newCursor += 1;
            }

            return {
                ...prevData,
                cursor: newCursor,
                records: newRecords,
                history: newHistory,
                reference: newReference,
                step: result.position
            }
        });

    };

    const cmdToRecord = (cmd: string) => {
        const output: CmdRecord[] = [];
        for (const c of cmd.split("\n")) {
            output.push({
                request: false,
                content: c
            })
        }
        return output;
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
            const text = !clean ? requests[newCursor].content : "";
            defineInnerText(inputRef.current, text);
        }

        setLinesData((prevData) => ({
            ...prevData,
            cursor: newCursor
        }));
    };

    const defineInnerText = async (input: HTMLElement, text: string) => {
        input.innerText = text;
        requestAnimationFrame(() => {
            moveCursorToEnd(inputRef.current!);
        });
    };

    const moveCursorToEnd = (element: HTMLElement) => {
        element.focus();

        const selection = window.getSelection();
        if (!selection) {
            return;
        }

        const range = document.createRange();
        const textNode = element.firstChild;

        if (textNode) {
            range.setStart(textNode, textNode.textContent!.length);
            range.collapse(true);
        } else {
            range.selectNodeContents(element);
            range.collapse(false);
        }

        selection.removeAllRanges();
        selection.addRange(range);
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