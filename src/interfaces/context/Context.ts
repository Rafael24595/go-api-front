import { Dict } from "../../types/Dict";
import { StatusValue } from "../StatusValue";

export type Context = {
  id: string;
  status: boolean;
  timestamp: number;
  dictionary: Dict<Dict<StatusValue[]>>;
  owner: string;
  modified: number;
};
