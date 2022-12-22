import type { ActorMethod } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";

export interface HttpRequest {
  url: string;
  method: string;
  body: Uint8Array;
  headers: Array<[string, string]>;
}
export interface HttpResponse {
  body: Uint8Array;
  headers: Array<[string, string]>;
  streaming_strategy: [] | [StreamingStrategy];
  status_code: number;
}
export interface Meta {
  url: [] | [string];
  theme: string;
  logo: string;
  name: string;
  description: [] | [string];
}
export interface StreamingCallbackToken {
  token: [] | [string];
  sha256: [] | [Uint8Array];
  headers: Array<[string, string]>;
  index: bigint;
  encoding_type: string;
  full_path: string;
}
export type StreamingStrategy = {
  Callback: {
    token: StreamingCallbackToken;
    callback: [Principal, string];
  };
};
export interface _SERVICE {
  http_request: ActorMethod<[HttpRequest], HttpResponse>;
  meta: ActorMethod<[], Meta>;
}
