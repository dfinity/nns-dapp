import { Agent, BinaryBlob, Principal } from "@dfinity/agent";
import { pollForResponse } from "@dfinity/agent/lib/cjs/polling_handler";

const DEFAULT_ACTOR_CONFIG = {
    maxAttempts: 300,
    throttleDurationInMSecs: 1000,
};

export const submitUpdateRequest = async (agent: Agent, canisterId: Principal, methodName: string, arg: BinaryBlob) : Promise<BinaryBlob> => {
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

    return await pollForResponse(
        agent,
        canisterId,
        submitResponse.requestId,
        DEFAULT_ACTOR_CONFIG.maxAttempts,
        DEFAULT_ACTOR_CONFIG.maxAttempts,
        DEFAULT_ACTOR_CONFIG.throttleDurationInMSecs);
}