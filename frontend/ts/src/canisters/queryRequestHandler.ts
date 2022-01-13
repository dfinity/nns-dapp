import { Agent, QueryResponseStatus } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { uint8ArraytoArrayBuffer } from "../utils";

export const submitQueryRequest = async (
  agent: Agent,
  canisterId: Principal,
  methodName: string,
  bytes: Uint8Array
): Promise<Uint8Array> => {
  const queryResponse = await agent.query(canisterId, {
    methodName,
    arg: uint8ArraytoArrayBuffer(bytes),
  });

  if (queryResponse.status == QueryResponseStatus.Rejected) {
    throw new Error(
      [
        "Call failed:",
        `  Method: ${methodName}`,
        `  Canister ID: ${canisterId}`,
        `  HTTP status code: ${queryResponse.reject_code}`,
        `  HTTP status text: ${queryResponse.reject_message}`,
      ].join("\n")
    );
  }

  return new Uint8Array(queryResponse.reply.arg);
};
