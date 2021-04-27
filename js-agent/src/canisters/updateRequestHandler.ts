import { Agent, Principal } from "@dfinity/agent";
import { polling } from "@dfinity/agent";
import { blobToUint8Array, uint8ArrayToBlob } from "./converter";

const pollStrategy = polling.defaultStrategy();

export const submitUpdateRequest = async (agent: Agent, canisterId: Principal, methodName: string, bytes: Uint8Array) : Promise<Uint8Array> => {
    const arg = uint8ArrayToBlob(bytes);

    const submitResponse = await agent.call(canisterId, {
        methodName,
        arg,
        effectiveCanisterId: canisterId
    });

    if (!submitResponse.response.ok) {
        throw new Error(
            [
                'Call failed:',
                `  Method: ${methodName}`,
                `  Canister ID: ${canisterId}`,
                `  Request ID: ${submitResponse.requestId}`,
                `  HTTP status code: ${submitResponse.response.status}`,
                `  HTTP status text: ${submitResponse.response.statusText}`,
            ].join('\n'),
        );
    }

    const blob = await polling.pollForResponse(
        agent,
        canisterId,
        submitResponse.requestId,
        pollStrategy);

    return blobToUint8Array(blob);
}