import { FETCH_ROOT_KEY } from "$lib/constants/environment.constants";
import {
  type Agent,
  type AgentLog,
  type ApiQueryResponse,
  type CallOptions,
  ExternalError,
  type HttpAgent,
  type Identity,
  IdentityInvalidErrorCode,
  type QueryFields,
  type ReadStateOptions,
  type ReadStateResponse,
  type SubmitResponse,
} from "@dfinity/agent";
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
      throw ExternalError.fromCode(new IdentityInvalidErrorCode());
    }
    return usedIdentity;
  }

  get rootKey(): Uint8Array | null {
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

  fetchRootKey(): Promise<Uint8Array> {
    return this.wrappedAgent.fetchRootKey();
  }

  invalidateIdentity?(): void {
    this.identity = null;
  }

  replaceIdentity?(identity: Identity): void {
    this.identity = identity;
  }
}

const INVALID_SIGNATURE_DEBUG_INFO_KEY = "invalidSignatureDebugInfo";

const storeInvalidSignatureDebugInfo = (logEntry: AgentLog) => {
  if (
    logEntry.level != "error" ||
    !logEntry.message.includes("Invalid signature")
  ) {
    return;
  }

  const requestContext = logEntry.error.code.requestContext;
  if (isNullish(requestContext)) return;

  localStorage.setItem(
    INVALID_SIGNATURE_DEBUG_INFO_KEY,
    JSON.stringify({
      requestId: requestContext.requestId,
      senderPubkey: requestContext.senderPubKey,
      senderSig: requestContext.senderSignature,
      ingressExpiry: requestContext.ingressExpiry,
      debugInfoRecordedTimestamp: new Date().toISOString(),
    })
  );
  logRecordedInvalidSignatureDebugInfo();
};

const logRecordedInvalidSignatureDebugInfo = () => {
  if (
    typeof window !== "undefined" &&
    window.localStorage &&
    INVALID_SIGNATURE_DEBUG_INFO_KEY in localStorage
  ) {
    console.warn(
      "Found invalid signature debug info:",
      localStorage.getItem(INVALID_SIGNATURE_DEBUG_INFO_KEY)
    );
  }
};

// Also log on page load for easy discovery.
logRecordedInvalidSignatureDebugInfo();

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

    agent.log.subscribe(storeInvalidSignatureDebugInfo);

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
