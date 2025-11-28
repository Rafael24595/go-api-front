export interface SignedPayload<T> {
  owner: string;
  payload: T
}