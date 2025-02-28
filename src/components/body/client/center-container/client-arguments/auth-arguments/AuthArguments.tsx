import { useState } from 'react';
import './AuthArguments.css'
import { BasicData } from './basic-data/BasicData';
import { BearerData } from './bearer-data/BearerData';

const VIEW_BASIC = "basic";
const VIEW_BEARER = "bearer";

const DEFAULT_CURSOR = VIEW_BASIC;

interface AuthArgumentsProps {
    cursorStatus?: string;
}

export function AuthArguments({cursorStatus}: AuthArgumentsProps) {
    const [table, setTable] = useState({
        cursor: cursorStatus || DEFAULT_CURSOR,
    });

    const cursorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTable({...table, cursor: e.target.value})
    };

    const authChange = (data: any) => {

    }

    return (
        <>
            <p>//TODO: Implement AuthArguments</p>
            <div id="client-argument-auth">
                <div className="radio-button-group border-bottom">
                    <input type="radio" id="tag-auth-basic" className="client-tag" name="cursor-auth" 
                        checked={table.cursor === VIEW_BASIC} 
                        value={VIEW_BASIC} 
                        onChange={cursorChange}/>
                    <label htmlFor="tag-auth-basic">Basic</label>
                    <input type="radio" id="tag-auth-bearer" className="client-tag" name="cursor-auth" 
                        checked={table.cursor === VIEW_BEARER} 
                        value={VIEW_BEARER} 
                        onChange={cursorChange}/>
                    <label htmlFor="tag-auth-bearer">Bearer</label>
                </div>
            </div>
            <div id="client-argument-content">
                {table.cursor === VIEW_BASIC && <BasicData values={{}} onValueChange={authChange}/>}
                {table.cursor === VIEW_BEARER && <BearerData values={{}} onValueChange={authChange}/>}
            </div>
        </>
    )
}