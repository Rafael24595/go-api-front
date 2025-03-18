import { Dict } from "../../types/Dict";
import { StatusValue } from "../StatusValue";

export type Context = {
  _id: string;
  status: boolean;
  timestamp: number;
  dictionary: Dict<Dict<StatusValue>>;
  owner: string;
  modified: number;
};

export function newContext(owner: string): Context {
  return {
    _id: "",
    status: true,
    timestamp: 0,
    dictionary: {},
    modified: 0,
    owner: owner
  }
}
