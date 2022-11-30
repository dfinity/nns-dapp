import { FETCH_ROOT_KEY } from "$lib/constants/environment.constants";
import type { HttpAgent, Identity } from "@dfinity/agent";
import { createAgent as createAgentUtil } from "@dfinity/utils";

let agent: HttpAgent | undefined;

export const createAgent = async (params: {
  identity: Identity;
  host?: string;
}): Promise<HttpAgent> => {
    if (agent === undefined) {
        agent = await createAgentUtil({
            ...params,
            fetchRootKey: FETCH_ROOT_KEY,
        });
    }

    return agent;
}

export const resetAgent = () => agent = undefined;
