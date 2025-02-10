import * as agentApi from "$lib/api/agent.api";
import { advanceTime } from "$tests/utils/timers.test-utils";
import type {
  Agent,
  AgentLog,
  ApiQueryResponse,
  CallOptions,
  HttpAgent,
  Identity,
  ObservableLog,
  ObserveFunction,
  QueryFields,
  ReadStateOptions,
  SubmitResponse,
} from "@dfinity/agent";
import { AgentCallError } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import * as utils from "@dfinity/utils";
import type { Mocked } from "vitest";
import { mock } from "vitest-mock-extended";

const host = "http://localhost:8000";
const testPrincipal1 = Principal.fromHex("123123123");
const testPrincipal2 = Principal.fromHex("456456456");

const createIdentity = (principal: Principal) =>
  ({
    getPrincipal: () => principal,
  }) as Identity;

const createAgent = (identity: Identity) =>
  agentApi.createAgent({
    identity,
    host,
  });

const createMockAgent = () => {
  const mockAgent = mock<HttpAgent>({
    log: mock<ObservableLog>({
      subscribe: vi.fn(),
    }),
  });
  return mockAgent;
};

describe("agent-api", () => {
  let utilsCreateAgentSpy;

  beforeEach(() => {
    agentApi.resetAgents();

    utilsCreateAgentSpy = vi
      .spyOn(utils, "createAgent")
      .mockImplementation(async () => createMockAgent());
  });

  it("createAgent should create an agent", async () => {
    const testIdentity = createIdentity(testPrincipal1);
    const agent = await createAgent(testIdentity);

    expect(await agent.getPrincipal()).toEqual(testPrincipal1);
  });

  it("createAgent should cache the underlying agent for the same identity", async () => {
    const testIdentity = createIdentity(testPrincipal1);
    expect(utilsCreateAgentSpy).not.toBeCalled();
    await createAgent(testIdentity);
    expect(utilsCreateAgentSpy).toBeCalledTimes(1);
    await createAgent(testIdentity);
    expect(utilsCreateAgentSpy).toBeCalledTimes(1);
  });

  it("createAgent returns a different agent for a different identity", async () => {
    const testIdentity1 = createIdentity(testPrincipal1);
    const testIdentity2 = createIdentity(testPrincipal2);

    expect(utilsCreateAgentSpy).not.toBeCalled();

    const mockAgent1 = createMockAgent();
    utilsCreateAgentSpy.mockResolvedValue(mockAgent1);
    const agent1 = await createAgent(testIdentity1);
    expect(utilsCreateAgentSpy).toBeCalledTimes(1);

    const mockAgent2 = createMockAgent();
    utilsCreateAgentSpy.mockResolvedValue(mockAgent2);
    const agent2 = await createAgent(testIdentity2);
    expect(utilsCreateAgentSpy).toBeCalledTimes(2);

    expect(await agent1.getPrincipal()).toEqual(testPrincipal1);
    expect(await agent2.getPrincipal()).toEqual(testPrincipal2);

    // The underlying agents are also different.
    expect(mockAgent1.call).not.toBeCalled();
    expect(mockAgent2.call).not.toBeCalled();
    agent1.call("canisterId", {} as CallOptions);
    expect(mockAgent1.call).toBeCalledTimes(1);
    expect(mockAgent2.call).not.toBeCalled();
    agent2.call("canisterId", {} as CallOptions);
    expect(mockAgent1.call).toBeCalledTimes(1);
    expect(mockAgent2.call).toBeCalledTimes(1);
  });

  describe("agent forwards method calls to the underlying agent", () => {
    const testIdentity = createIdentity(testPrincipal1);

    let mockAgent: Mocked<HttpAgent>;
    let agent: Agent;

    beforeEach(async () => {
      mockAgent = createMockAgent();
      utilsCreateAgentSpy.mockResolvedValue(mockAgent);

      agent = await createAgent(testIdentity);
    });

    it("for rootKey getter", async () => {
      const rootKey = new Int8Array([1, 2, 3]);

      mockAgent.rootKey = rootKey;

      expect(agent.rootKey).toEqual(rootKey);
    });

    it("for method createReadStateRequest", async () => {
      const returnValue = "returnValue";
      mockAgent.createReadStateRequest.mockResolvedValue(returnValue);

      const param = {
        path: [[Int8Array.from([3, 4, 5])]],
      } as unknown as ReadStateOptions;

      expect(mockAgent.createReadStateRequest).not.toBeCalled();

      expect(await agent.createReadStateRequest(param)).toEqual(returnValue);

      expect(mockAgent.createReadStateRequest).toBeCalledTimes(1);
      expect(mockAgent.createReadStateRequest).toBeCalledWith(
        param,
        testIdentity
      );
    });

    it("for method readState", async () => {
      const readStateResponse = { certificate: Int8Array.from([1, 9, 3]) };

      mockAgent.readState.mockResolvedValue(readStateResponse);

      const effectiveCanisterId = "effectiveCanisterId";
      const options = {
        path: [[Int8Array.from([7, 1, 2])]],
      } as unknown as ReadStateOptions;
      const request = "request";

      expect(mockAgent.readState).not.toBeCalled();

      expect(
        await agent.readState(
          effectiveCanisterId,
          options,
          undefined, // identity
          request
        )
      ).toEqual(readStateResponse);

      expect(mockAgent.readState).toBeCalledTimes(1);
      expect(mockAgent.readState).toBeCalledWith(
        effectiveCanisterId,
        options,
        testIdentity,
        request
      );
    });

    it("for method call", async () => {
      const submitResponse = Int8Array.from([
        5, 2, 3,
      ]) as unknown as SubmitResponse;

      mockAgent.call.mockResolvedValue(submitResponse);

      const params = [
        "canisterId",
        { methodName: "foo" } as CallOptions,
      ] as const;

      expect(mockAgent.call).not.toBeCalled();

      expect(await agent.call(...params)).toEqual(submitResponse);

      expect(mockAgent.call).toBeCalledTimes(1);
      expect(mockAgent.call).toBeCalledWith(...params, testIdentity);
    });

    it("for method status", async () => {
      expect(mockAgent.status).not.toBeCalled();

      const status = { status: "ok" };
      mockAgent.status.mockResolvedValue(status);

      expect(await agent.status()).toEqual(status);

      expect(mockAgent.status).toBeCalledTimes(1);
    });

    it("for method query", async () => {
      const apiQueryResponse = "queryResponse" as unknown as ApiQueryResponse;

      mockAgent.query.mockResolvedValue(apiQueryResponse);

      const params = [
        "canisterId",
        { methodName: "bar" } as QueryFields,
      ] as const;

      expect(mockAgent.query).not.toBeCalled();

      expect(await agent.query(...params)).toEqual(apiQueryResponse);

      expect(mockAgent.query).toBeCalledTimes(1);
      expect(mockAgent.query).toBeCalledWith(...params, testIdentity);
    });

    it("for method fetchRootKey", async () => {
      const rootKey = new Int8Array([3, 2, 3]);

      mockAgent.fetchRootKey.mockResolvedValue(rootKey);

      expect(mockAgent.fetchRootKey).not.toBeCalled();

      expect(await agent.fetchRootKey()).toEqual(rootKey);

      expect(mockAgent.fetchRootKey).toBeCalledTimes(1);
    });
  });

  describe("invalidateIdentity", () => {
    const testIdentity = createIdentity(testPrincipal1);

    let mockAgent: Mocked<HttpAgent>;
    let agent: Agent;

    beforeEach(async () => {
      mockAgent = createMockAgent();
      utilsCreateAgentSpy.mockResolvedValue(mockAgent);

      agent = await createAgent(testIdentity);
    });

    it("makes getPrincipal throw", async () => {
      const call = async () => agent.getPrincipal();

      // Does not throw at first:
      await call();

      agent.invalidateIdentity();

      await expect(call).rejects.toThrow();
    });

    it("makes createReadStateRequest throw", async () => {
      const param = {
        path: [[Int8Array.from([3, 4, 5])]],
      } as unknown as ReadStateOptions;

      const call = async () => agent.createReadStateRequest(param);

      // Does not throw at first:
      await call();

      agent.invalidateIdentity();

      await expect(call).rejects.toThrow();
    });

    it("makes readState throw", async () => {
      const effectiveCanisterId = "effectiveCanisterId";
      const options = {
        path: [[Int8Array.from([7, 1, 2])]],
      } as unknown as ReadStateOptions;
      const request = "request";

      const call = async () =>
        agent.readState(effectiveCanisterId, options, undefined, request);

      // Does not throw at first:
      await call();

      agent.invalidateIdentity();

      await expect(call).rejects.toThrow();
    });

    it("makes query throw", async () => {
      const params = [
        "canisterId",
        { methodName: "bar" } as QueryFields,
      ] as const;

      const call = async () => agent.query(...params);

      // Does not throw at first:
      await call();

      agent.invalidateIdentity();

      await expect(call).rejects.toThrow();
    });

    it("makes call throw", async () => {
      const params = [
        "canisterId",
        { methodName: "foo" } as CallOptions,
      ] as const;

      const call = async () => agent.call(...params);

      // Does not throw at first:
      await call();

      agent.invalidateIdentity();

      await expect(call).rejects.toThrow();
    });
  });

  describe("createAgent uses a cached underlying agent with the specified identity", () => {
    const testIdentity1 = createIdentity(testPrincipal1);
    // Note: testIdentity2 has the same principal as testIdentity1, but they are
    // different objects.
    const testIdentity2 = createIdentity(testPrincipal1);

    const mockAgent = createMockAgent();

    beforeEach(async () => {
      utilsCreateAgentSpy.mockResolvedValue(mockAgent);
    });

    it("for method createReadStateRequest()", async () => {
      const agent1 = await createAgent(testIdentity1);
      const agent2 = await createAgent(testIdentity2);

      const param = {
        path: [[Int8Array.from([3, 4, 5])]],
      } as unknown as ReadStateOptions;

      expect(mockAgent.createReadStateRequest).not.toBeCalled();

      await agent1.createReadStateRequest(param);

      expect(mockAgent.createReadStateRequest).toBeCalledTimes(1);
      expect(mockAgent.createReadStateRequest).toBeCalledWith(
        param,
        testIdentity1
      );
      expect(mockAgent.createReadStateRequest).not.toBeCalledWith(
        param,
        testIdentity2
      );

      await agent2.createReadStateRequest(param);

      expect(mockAgent.createReadStateRequest).toBeCalledTimes(2);
      expect(mockAgent.createReadStateRequest).toBeCalledWith(
        param,
        testIdentity2
      );
    });

    it("for method readState()", async () => {
      const agent1 = await createAgent(testIdentity1);
      const agent2 = await createAgent(testIdentity2);

      const effectiveCanisterId = "effectiveCanisterId";
      const options = {
        path: [[Int8Array.from([7, 1, 2])]],
      } as unknown as ReadStateOptions;
      const request = "request";

      expect(mockAgent.readState).not.toBeCalled();

      await agent1.readState(effectiveCanisterId, options, undefined, request);

      expect(mockAgent.readState).toBeCalledTimes(1);
      expect(mockAgent.readState).toBeCalledWith(
        effectiveCanisterId,
        options,
        testIdentity1,
        request
      );
      expect(mockAgent.readState).not.toBeCalledWith(
        effectiveCanisterId,
        options,
        testIdentity2,
        request
      );

      await agent2.readState(effectiveCanisterId, options, undefined, request);

      expect(mockAgent.readState).toBeCalledTimes(2);
      expect(mockAgent.readState).toBeCalledWith(
        effectiveCanisterId,
        options,
        testIdentity2,
        request
      );
    });

    it("for method call()", async () => {
      const agent1 = await createAgent(testIdentity1);
      const agent2 = await createAgent(testIdentity2);

      expect(mockAgent.call).not.toBeCalled();
      await agent1.call("canisterId", {} as CallOptions);

      expect(mockAgent.call).toBeCalledTimes(1);
      expect(mockAgent.call).toBeCalledWith("canisterId", {}, testIdentity1);
      expect(mockAgent.call).not.toBeCalledWith(
        "canisterId",
        {},
        testIdentity2
      );

      await agent2.call("canisterId", {} as CallOptions);

      expect(mockAgent.call).toBeCalledTimes(2);
      expect(mockAgent.call).toBeCalledWith("canisterId", {}, testIdentity2);
    });

    it("for method query()", async () => {
      const agent1 = await createAgent(testIdentity1);
      const agent2 = await createAgent(testIdentity2);

      const params = [
        "canisterId",
        { methodName: "bar" } as QueryFields,
      ] as const;

      expect(mockAgent.query).not.toBeCalled();
      await agent1.query(...params);

      expect(mockAgent.query).toBeCalledTimes(1);
      expect(mockAgent.query).toBeCalledWith(...params, testIdentity1);
      expect(mockAgent.query).not.toBeCalledWith(...params, testIdentity2);

      await agent2.query(...params);

      expect(mockAgent.query).toBeCalledTimes(2);
      expect(mockAgent.query).toBeCalledWith(...params, testIdentity2);
    });
  });

  describe("with agent log", () => {
    let mockAgent: Mocked<HttpAgent>;
    let logSubscriber: ObserveFunction<AgentLog> | undefined;

    const invalidSignatureMessage =
      "Error while making call: Server returned an error:\n Code: 400 (Bad Request)\n  Body: Invalid signature: Invalid basic signature: EcdsaP256 signature could not be verified: public key 04219a05346288ccd0a293a341790087152e8cf332219b6f66a69ebac3383a78e2aa8c14a7a944190ca1a0040e353f18056e9ec7fcb128860f4318c207d589c429, signature 9b9facce1f719d6dc177243df0a196f04c794b2d46b9b01c7723f3f58bf348addb3af491331af8785e25b1c2cd93afd4db627da3ec4183c566dec5fca0713341, error: verification failed\n";
    const response = {
      ok: false,
      status: 400,
      statusText: "Bad Request",
      headers: [
        ["content-length", "396"] as [string, string],
        ["content-type", "text/plain; charset=utf-8"] as [string, string],
      ],
    };
    const requestId =
      "436fdf3d349c375f1018f8fa6612bed1988cc000ccdb26e5c0f292a75994cea1";
    const senderPubkey =
      "303c300c060a2b0601040183b8430102032c000a000000000000000b01013c658db985648bbc2f58bc796f82cc94e8695f790fa7f676788b37513116d68a";
    const senderSig =
      "9b9facce1f719d6dc177243df0a196f04c794b2d46b9b01c7723f3f58bf348addb3af491331af8785e25b1c2cd93afd4db627da3ec4183c566dec5fca0713341";
    const ingressExpiry = "1738765560000000000";

    const invalidSignatureError = new AgentCallError(
      invalidSignatureMessage,
      response,
      requestId,
      senderPubkey,
      senderSig,
      ingressExpiry
    );
    const invalidSignatureLogEntry: AgentLog = {
      message: invalidSignatureMessage,
      level: "error",
      error: invalidSignatureError,
    };

    beforeEach(() => {
      vi.useFakeTimers();
      vi.spyOn(console, "warn").mockReturnValue();

      logSubscriber = undefined;

      mockAgent = createMockAgent();
      vi.mocked(mockAgent.log.subscribe).mockImplementation((func) => {
        logSubscriber = func;
      });

      utilsCreateAgentSpy.mockResolvedValue(mockAgent);
    });

    it("subscribes to invalid signature errors", async () => {
      expect(logSubscriber).toBe(undefined);
      expect(mockAgent.log.subscribe).toBeCalledTimes(0);

      await createAgent(createIdentity(testPrincipal1));

      expect(mockAgent.log.subscribe).toBeCalledTimes(1);
      expect(logSubscriber).not.toBe(undefined);

      expect(localStorage.getItem("invalidSignatureDebugInfo")).toBe(null);
      expect(console.warn).toBeCalledTimes(0);

      logSubscriber(invalidSignatureLogEntry);

      const expectedDebugInfo = JSON.stringify({
        requestId,
        senderPubkey,
        senderSig,
        ingressExpiry,
        debugInfoRecordedTimestamp: new Date().toISOString(),
      });

      expect(localStorage.getItem("invalidSignatureDebugInfo")).toBe(
        expectedDebugInfo
      );

      expect(console.warn).toBeCalledWith(
        "Found invalid signature debug info:",
        expectedDebugInfo
      );
      expect(console.warn).toBeCalledTimes(1);
    });

    it("ignores other errors", async () => {
      expect(logSubscriber).toBe(undefined);
      expect(mockAgent.log.subscribe).toBeCalledTimes(0);

      await createAgent(createIdentity(testPrincipal1));

      expect(mockAgent.log.subscribe).toBeCalledTimes(1);
      expect(logSubscriber).not.toBe(undefined);

      expect(localStorage.getItem("invalidSignatureDebugInfo")).toBe(null);
      expect(console.warn).toBeCalledTimes(0);

      logSubscriber({
        ...invalidSignatureLogEntry,
        message: "Some other error",
      });

      expect(localStorage.getItem("invalidSignatureDebugInfo")).toBe(null);
      expect(console.warn).toBeCalledTimes(0);
    });

    it("ignores non-error entries", async () => {
      expect(logSubscriber).toBe(undefined);
      expect(mockAgent.log.subscribe).toBeCalledTimes(0);

      await createAgent(createIdentity(testPrincipal1));

      expect(mockAgent.log.subscribe).toBeCalledTimes(1);
      expect(logSubscriber).not.toBe(undefined);

      expect(localStorage.getItem("invalidSignatureDebugInfo")).toBe(null);
      expect(console.warn).toBeCalledTimes(0);

      logSubscriber({
        ...invalidSignatureLogEntry,
        level: "info",
      });

      expect(localStorage.getItem("invalidSignatureDebugInfo")).toBe(null);
      expect(console.warn).toBeCalledTimes(0);
    });

    it("keeps only the last invalid signature debug info", async () => {
      expect(logSubscriber).toBe(undefined);
      expect(mockAgent.log.subscribe).toBeCalledTimes(0);

      await createAgent(createIdentity(testPrincipal1));

      expect(mockAgent.log.subscribe).toBeCalledTimes(1);
      expect(logSubscriber).not.toBe(undefined);

      expect(localStorage.getItem("invalidSignatureDebugInfo")).toBe(null);
      expect(console.warn).toBeCalledTimes(0);

      logSubscriber(invalidSignatureLogEntry);

      const expectedDebugInfo = JSON.stringify({
        requestId,
        senderPubkey,
        senderSig,
        ingressExpiry,
        debugInfoRecordedTimestamp: new Date().toISOString(),
      });

      expect(localStorage.getItem("invalidSignatureDebugInfo")).toBe(
        expectedDebugInfo
      );

      advanceTime(300000);

      const newRequestId = requestId + "new";
      const newSenderPubkey = senderPubkey + "new";
      const newSenderSig = senderSig + "new";
      const newIngressExpiry = ingressExpiry + "new";

      const newInvalidSignatureError = new AgentCallError(
        invalidSignatureMessage,
        response,
        newRequestId,
        newSenderPubkey,
        newSenderSig,
        newIngressExpiry
      );

      const newInvalidSignatureLogEntry: AgentLog = {
        message: invalidSignatureMessage,
        level: "error",
        error: newInvalidSignatureError,
      };

      logSubscriber(newInvalidSignatureLogEntry);

      const newExpectedDebugInfo = JSON.stringify({
        requestId: newRequestId,
        senderPubkey: newSenderPubkey,
        senderSig: newSenderSig,
        ingressExpiry: newIngressExpiry,
        debugInfoRecordedTimestamp: new Date().toISOString(),
      });

      expect(localStorage.getItem("invalidSignatureDebugInfo")).toBe(
        newExpectedDebugInfo
      );
    });
  });
});
