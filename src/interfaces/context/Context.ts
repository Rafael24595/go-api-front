import { detachStatusCategoryKeyValue, mergeStatusCategoryKeyValue } from "../../services/Utils";
import { Dict } from "../../types/Dict";
import { ItemStatusCategoryKeyValue, toItem } from "../StatusCategoryKeyValue";
import { StatusValue } from "../StatusValue";

export type Context = {
  _id: string;
  status: boolean;
  timestamp: number;
  dictionary: Dict<Dict<StatusValue>>;
  owner: string;
  modified: number;
};

export type ItemContext = {
  _id: string;
  status: boolean;
  timestamp: number;
  dictionary: ItemStatusCategoryKeyValue[];
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

export function newItemContext(owner: string): ItemContext {
  return {
    _id: "",
    status: true,
    timestamp: 0,
    dictionary: [],
    modified: 0,
    owner: owner
  }
}

export const fromContext = (context: Context): ItemContext => {
    const argumentVec = toItem(detachStatusCategoryKeyValue(context.dictionary));
    return {
        _id: context._id,
        status: context.status,
        timestamp: context.timestamp,
        dictionary: argumentVec,
        owner: context.owner,
        modified: context.modified
    };
}

export const toContext = (context: ItemContext): Context => {
  const argumentMap = mergeStatusCategoryKeyValue(context.dictionary)
  return {
      _id: context._id,
      status: context.status,
      timestamp: context.timestamp,
      dictionary: argumentMap,
      owner: context.owner,
      modified: context.modified
  };
}
