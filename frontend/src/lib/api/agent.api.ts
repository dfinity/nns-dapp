import { FETCH_ROOT_KEY } from "$lib/constants/environment.constants";
import type {
  Agent,
  ApiQueryResponse,
  CallOptions,
  HttpAgent,
  Identity,
  QueryFields,
  ReadStateOptions,
  ReadStateResponse,
  SubmitResponse,
} from "@dfinity/agent";
import { IdentityInvalidError } from "@dfinity/agent";
import type { JsonObject } from "@dfinity/candid";
import type { Principal } from "@dfinity/principal";
import {
  createAgent as createAgentUtil,
  isNullish,
  nonNullish,
} from "@dfinity/utils";

type PrincipalAsText = string;
let agents: Record<PrincipalAsText, HttpAgent> | undefined | null = undefined;

/**
 * Allows using an existing agent with a different identity, by calling every
 * method on the wrapped agent, but passing in the new identity.
 */
class IdentityAgentWrapper implements Agent {
  private identity: Identity | null;
  private readonly wrappedAgent: HttpAgent;

  constructor({
    identity,
    wrappedAgent,
  }: {
    identity: Identity;
    wrappedAgent: HttpAgent;
  }) {
    this.identity = identity;
    this.wrappedAgent = wrappedAgent;
  }

  getValidIdentity(overrideIdentity?: Identity | undefined | null): Identity {
    const usedIdentity =
      overrideIdentity !== undefined ? overrideIdentity : this.identity;
    if (isNullish(usedIdentity)) {
      throw new IdentityInvalidError(
        "This identity has expired due this application's security policy. Please refresh your authentication."
      );
    }
    return usedIdentity;
  }

  get rootKey(): ArrayBuffer | null {
    return this.wrappedAgent.rootKey;
  }

  async getPrincipal(): Promise<Principal> {
    return this.getValidIdentity().getPrincipal();
  }

  createReadStateRequest?(
    options: ReadStateOptions,
    identity?: Identity
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  ): Promise<any> {
    return this.wrappedAgent.createReadStateRequest(
      options,
      this.getValidIdentity(identity)
    );
  }

  readState(
    effectiveCanisterId: Principal | string,
    options: ReadStateOptions,
    identity?: Identity,
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    request?: any
  ): Promise<ReadStateResponse> {
    return this.wrappedAgent.readState(
      effectiveCanisterId,
      options,
      this.getValidIdentity(identity),
      request
    );
  }

  call(
    canisterId: Principal | string,
    fields: CallOptions,
    identity?: Identity
  ): Promise<SubmitResponse> {
    return this.wrappedAgent.call(
      canisterId,
      fields,
      this.getValidIdentity(identity)
    );
  }

  async status(): Promise<JsonObject> {
    return this.wrappedAgent.status();
  }

  async query(
    canisterId: Principal | string,
    options: QueryFields,
    identity?: Identity | Promise<Identity>
  ): Promise<ApiQueryResponse> {
    return this.wrappedAgent.query(
      canisterId,
      options,
      this.getValidIdentity(await identity)
    );
  }

  fetchRootKey(): Promise<ArrayBuffer> {
    return this.wrappedAgent.fetchRootKey();
  }

  invalidateIdentity?(): void {
    this.identity = null;
  }

  replaceIdentity?(identity: Identity): void {
    this.identity = identity;
  }
}

export const createAgent = async ({
  identity,
  host,
}: {
  identity: Identity;
  host?: string;
}): Promise<Agent> => {
  const principalAsText: string = identity.getPrincipal().toText();

  // e.g. a particular agent for anonymous call and another for signed-in identity
  if (agents?.[principalAsText] === undefined) {
    const agent = await createAgentUtil({
      identity,
      ...(host !== undefined && { host }),
      fetchRootKey: FETCH_ROOT_KEY,
    });

    agents = {
      ...(nonNullish(agents) && agents),
      [principalAsText]: agent,
    };
  }

  return new IdentityAgentWrapper({
    identity,
    wrappedAgent: agents[principalAsText],
  });
};

export const resetAgents = () => (agents = null);
