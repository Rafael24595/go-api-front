import { Context, newContext, newItemContext } from "../context/Context";

export interface Collection {
    _id: string;
    name: string;
    timestamp: number;
    context: string;
    nodes: Node[];
    owner: string;
    modified: number;
}

export interface Node {
    order: number;
    request: string;
}

export interface ItemCollection {
    _id: string;
    name: string;
    timestamp: number;
    context: Context;
    nodes: ItemNode[];
    owner: string;
    modified: number;
}

export interface ItemNode {
    order: number;
    request: Request;
}

export function newCollection(owner: string): Collection {
  return {
    _id: "",
    name: "",
    timestamp: 0,
    context: "",
    modified: 0,
    nodes: [],
    owner: owner
  }
}