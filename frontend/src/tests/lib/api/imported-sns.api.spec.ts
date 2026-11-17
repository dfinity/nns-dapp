import * as agentApi from "$lib/api/agent.api";
import {
  queryCanistersControllers,
  querySnsCanisterIds,
  querySnsGovernanceData,
  querySnsGovernanceMode,
  querySnsLedgerData,
  querySnsTopics,
} from "$lib/api/imported-sns.api";
import { nativeNervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { snsNervousSystemParametersMock } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { topicInfoMock } from "$tests/mocks/sns-topics.mock";
import { IcrcLedgerCanister } from "@icp-sdk/canisters/ledger/icrc";
import { SnsGovernanceCanister, SnsRootCanister } from "@icp-sdk/canisters/sns";
import {
  Actor,
  AnonymousIdentity,
  CanisterStatus,
  type HttpAgent,
} from "@icp-sdk/core/agent";
import { mock } from "vitest-mock-extended";

vi.mock("@icp-sdk/core/agent", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@icp-sdk/core/agent")>()),
  CanisterStatus: { request: vi.fn() },
}));

describe("imported-sns.api", () => {
  const identity = new AnonymousIdentity();
  const root = principal(10);
  const governance = principal(11);
  const ledger = principal(12);

  beforeEach(() => {
    vi.spyOn(agentApi, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  describe("querySnsCanisterIds", () => {
    it("should list the canisters of the root canister", async () => {
      const rootMock = mock<SnsRootCanister>();
      const response = {
        root: [root],
        governance: [governance],
        ledger: [ledger],
        swap: [],
        index: [],
        dapps: [],
        archives: [],
        extensions: [],
      } as Awaited<ReturnType<SnsRootCanister["listSnsCanisters"]>>;
      rootMock.listSnsCanisters.mockResolvedValue(response);
      const createSpy = vi
        .spyOn(SnsRootCanister, "create")
        .mockReturnValue(rootMock);

      const result = await querySnsCanisterIds({
        identity,
        rootCanisterId: root,
        certified: false,
      });

      expect(result).toBe(response);
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({ canisterId: root })
      );
      expect(rootMock.listSnsCanisters).toHaveBeenCalledWith({
        certified: false,
      });
    });
  });

  describe("queryCanistersControllers", () => {
    it("should read the controllers of each canister in order", async () => {
      vi.mocked(CanisterStatus.request).mockImplementation(
        async ({ canisterId }) =>
          new Map([
            [
              "controllers",
              canisterId.toText() === root.toText() ? [governance] : [root],
            ],
          ])
      );

      const result = await queryCanistersControllers({
        identity,
        canisterIds: [governance, root, ledger],
      });

      expect(result).toEqual([[root], [governance], [root]]);
      expect(CanisterStatus.request).toHaveBeenCalledTimes(3);
      expect(CanisterStatus.request).toHaveBeenCalledWith(
        expect.objectContaining({
          canisterId: governance,
          paths: ["controllers"],
        })
      );
    });
  });

  describe("querySnsGovernanceMode", () => {
    it("should call get_mode on the governance canister", async () => {
      const getMode = vi.fn().mockResolvedValue({ mode: [1] });
      const createActorSpy = vi
        .spyOn(Actor, "createActor")
        .mockReturnValue({ get_mode: getMode } as unknown as ReturnType<
          typeof Actor.createActor
        >);

      const result = await querySnsGovernanceMode({
        identity,
        governanceCanisterId: governance,
      });

      expect(result).toEqual({ mode: [1] });
      expect(getMode).toHaveBeenCalledWith({});
      expect(createActorSpy).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ canisterId: governance })
      );
    });
  });

  describe("querySnsGovernanceData", () => {
    it("should get the metadata, functions and parameters", async () => {
      const governanceMock = mock<SnsGovernanceCanister>();
      const metadata = {
        url: ["https://example.com"],
        logo: [],
        name: ["Test SNS"],
        description: ["An SNS for tests"],
      } as Awaited<ReturnType<SnsGovernanceCanister["metadata"]>>;
      const functions = {
        reserved_ids: BigUint64Array.from([]),
        functions: [nativeNervousSystemFunctionMock],
      };
      governanceMock.metadata.mockResolvedValue(metadata);
      governanceMock.listNervousSystemFunctions.mockResolvedValue(functions);
      governanceMock.nervousSystemParameters.mockResolvedValue(
        snsNervousSystemParametersMock
      );
      vi.spyOn(SnsGovernanceCanister, "create").mockReturnValue(governanceMock);

      const result = await querySnsGovernanceData({
        identity,
        governanceCanisterId: governance,
        certified: false,
      });

      expect(result).toEqual({
        metadata,
        functions,
        parameters: snsNervousSystemParametersMock,
      });
      expect(governanceMock.metadata).toHaveBeenCalledWith({
        certified: false,
      });
    });
  });

  describe("querySnsTopics", () => {
    it("should list the topics", async () => {
      const governanceMock = mock<SnsGovernanceCanister>();
      const topics = {
        topics: [[topicInfoMock]],
        uncategorized_functions: [[]],
      } as Awaited<ReturnType<SnsGovernanceCanister["listTopics"]>>;
      governanceMock.listTopics.mockResolvedValue(topics);
      vi.spyOn(SnsGovernanceCanister, "create").mockReturnValue(governanceMock);

      const result = await querySnsTopics({
        identity,
        governanceCanisterId: governance,
        certified: false,
      });

      expect(result).toBe(topics);
      expect(governanceMock.listTopics).toHaveBeenCalledWith({
        certified: false,
      });
    });
  });

  describe("querySnsLedgerData", () => {
    it("should get the metadata, fee and total supply", async () => {
      const ledgerMock = mock<IcrcLedgerCanister>();
      ledgerMock.metadata.mockResolvedValue([
        ["icrc1:symbol", { Text: "TST" }],
      ]);
      ledgerMock.transactionFee.mockResolvedValue(10_000n);
      ledgerMock.totalTokensSupply.mockResolvedValue(1_000_000n);
      vi.spyOn(IcrcLedgerCanister, "create").mockReturnValue(ledgerMock);

      const result = await querySnsLedgerData({
        identity,
        ledgerCanisterId: ledger,
        certified: false,
      });

      expect(result).toEqual({
        metadata: [["icrc1:symbol", { Text: "TST" }]],
        fee: 10_000n,
        totalSupply: 1_000_000n,
      });
    });
  });
});
