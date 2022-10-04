import { FETCH_ROOT_KEY } from "$lib/constants/environment.constants";
import type { HttpAgent, Identity } from "@dfinity/agent";
import { createAgent as createAgentUtil } from "@dfinity/utils";

export const createAgent = async (params: {
  identity: Identity;
  host?: string;
}): Promise<HttpAgent> =>
  createAgentUtil({
    ...params,
    fetchRootKey: FETCH_ROOT_KEY,
  });
