import { detachStatusCategoryKeyValue, mergeStatusCategoryKeyValue } from "../../services/Utils";
import { Dict } from "../../types/Dict";
import { ItemStatusCategoryKeyValue, toItem } from "../StatusCategoryKeyValue";
import { PrivateStatusValue } from "../StatusValue";

export type Context = {
  _id: string;
  status: boolean;
  timestamp: number;
  dictionary: Dict<Dict<PrivateStatusValue>>;
  owner: string;
  modified: number;
  domain: string;
};

export type ItemContext = {
  _id: string;
  status: boolean;
  timestamp: number;
  dictionary: ItemStatusCategoryKeyValue[];
  owner: string;
  modified: number;
  domain: string;
};

export function newContext(owner: string): Context {
  return {
    _id: "",
    status: true,
    timestamp: Date.now(),
    dictionary: {},
    modified: 0,
    owner: owner,
    domain: "user",
  }
}

export function newItemContext(owner: string): ItemContext {
  return {
    _id: "",
    status: true,
    timestamp: Date.now(),
    dictionary: [],
    modified: 0,
    owner: owner,
    domain: "user",
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
        modified: context.modified,
        domain: context.domain
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
      modified: context.modified,
      domain: context.domain
  };
}
