import { Agent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { polling } from "@dfinity/agent";
import { uint8ArraytoArrayBuffer } from "../utils";

export const submitUpdateRequest = async (
  agent: Agent,
  canisterId: Principal,
  methodName: string,
  bytes: Uint8Array
): Promise<Uint8Array> => {
  const pollStrategy = polling.defaultStrategy();
  const submitResponse = await agent.call(canisterId, {
    methodName,
    arg: uint8ArraytoArrayBuffer(bytes),
    effectiveCanisterId: canisterId,
  });

  if (!submitResponse.response.ok) {
    throw new Error(
      [
        "Call failed:",
        `  Method: ${methodName}`,
        `  Canister ID: ${canisterId}`,
        `  Request ID: ${submitResponse.requestId}`,
        `  HTTP status code: ${submitResponse.response.status}`,
        `  HTTP status text: ${submitResponse.response.statusText}`,
      ].join("\n")
    );
  }

  const blob = await polling.pollForResponse(
    agent,
    canisterId,
    submitResponse.requestId,
    pollStrategy
  );

  return new Uint8Array(blob);
};
