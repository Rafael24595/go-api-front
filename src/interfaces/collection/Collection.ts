import { Context, newContext } from "../context/Context";
import { Request } from "../request/Request";

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

export function newItemCollection(owner: string): ItemCollection {
  return {
    _id: "",
    name: "",
    timestamp: 0,
    context: newContext(owner),
    modified: 0,
    nodes: [],
    owner: owner
  }
}

export const toCollection = (collection: ItemCollection): Collection => {
  const nodes = collection.nodes
    .map(n => {return {
      order: n.order, 
      request: n.request._id || ""}
    });
  return {
    _id: collection._id,
    name: collection.name,
    timestamp: collection.timestamp,
    context: collection.context._id,
    nodes: nodes,
    modified: collection.modified,
    owner: collection.owner
  }
}
