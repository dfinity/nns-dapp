import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import * as importedSnsApi from "$lib/api/imported-sns.api";
import { getImportedSns } from "$lib/services/imported-sns.services";
import { ImportedSnsError } from "$lib/types/imported-sns.errors";
import { toCachedSnsDto } from "$lib/utils/imported-sns.utils";
import { nativeNervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { snsNervousSystemParametersMock } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { topicInfoMock } from "$tests/mocks/sns-topics.mock";
import {
  IcrcMetadataResponseEntries,
  type IcrcTokenMetadataResponse,
} from "@icp-sdk/canisters/ledger/icrc";
import type { SnsGovernanceDid } from "@icp-sdk/canisters/sns";
import { AnonymousIdentity } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";

describe("imported-sns.services", () => {
  const root = principal(10);
  const governance = principal(11);
  const ledger = principal(12);
  const swap = principal(13);
  const index = principal(14);
  const developer = principal(20);
  const stranger = principal(21);

  const metadata: SnsGovernanceDid.GetMetadataResponse = {
    url: ["https://example.com"],
    logo: [],
    name: ["Test SNS"],
    description: ["An SNS for tests"],
  };
  const functions: SnsGovernanceDid.ListNervousSystemFunctionsResponse = {
    reserved_ids: BigUint64Array.from([]),
    functions: [nativeNervousSystemFunctionMock],
  };
  const topics: SnsGovernanceDid.ListTopicsResponse = {
    topics: [[topicInfoMock]],
    uncategorized_functions: [[]],
  };
  const tokenMetadata: IcrcTokenMetadataResponse = [
    [IcrcMetadataResponseEntries.DECIMALS, { Nat: 8n }],
    [IcrcMetadataResponseEntries.NAME, { Text: "Test Token" }],
    [IcrcMetadataResponseEntries.SYMBOL, { Text: "TST" }],
    [IcrcMetadataResponseEntries.FEE, { Nat: 10_000n }],
  ];

  let controllers: Principal[][];

  const querySnsCanisterIdsSpy = () =>
    vi.spyOn(importedSnsApi, "querySnsCanisterIds");
  const queryMintingAccountSpy = () =>
    vi.spyOn(icrcLedgerApi, "queryIcrcMintingAccount");
  const queryModeSpy = () => vi.spyOn(importedSnsApi, "querySnsGovernanceMode");
  const queryTopicsSpy = () => vi.spyOn(importedSnsApi, "querySnsTopics");

  beforeEach(() => {
    // Governance, root, ledger and index, in the order of the service.
    controllers = [[root], [governance], [root], [root, developer]];

    querySnsCanisterIdsSpy().mockResolvedValue({
      root: [root],
      governance: [governance],
      ledger: [ledger],
      swap: [swap],
      index: [index],
      dapps: [],
      archives: [],
      extensions: [],
    });
    vi.spyOn(importedSnsApi, "queryCanistersControllers").mockImplementation(
      async () => controllers
    );
    queryMintingAccountSpy().mockResolvedValue({ owner: governance });
    queryModeSpy().mockResolvedValue({ mode: [1] });
    vi.spyOn(importedSnsApi, "querySnsGovernanceData").mockResolvedValue({
      metadata,
      functions,
      parameters: snsNervousSystemParametersMock,
    });
    queryTopicsSpy().mockResolvedValue(topics);
    vi.spyOn(importedSnsApi, "querySnsLedgerData").mockResolvedValue({
      metadata: tokenMetadata,
      fee: 10_000n,
      totalSupply: 1_000_000n,
    });
  });

  const expectError = async (reason: ImportedSnsError["reason"]) => {
    const call = getImportedSns(root);

    await expect(call).rejects.toThrow(ImportedSnsError);
    await expect(call).rejects.toMatchObject({ reason });
  };

  it("should return the SNS in the format of the aggregator", async () => {
    const dto = await getImportedSns(root);

    expect(dto).toEqual(
      toCachedSnsDto({
        canisterIds: {
          root,
          governance,
          ledger,
          swap,
          index,
          dapps: [],
          archives: [],
        },
        metadata,
        functions,
        parameters: snsNervousSystemParametersMock,
        topics,
        tokenMetadata,
        fee: 10_000n,
        totalSupply: 1_000_000n,
      })
    );
  });

  it("should query with the anonymous identity", async () => {
    await getImportedSns(root);

    expect(querySnsCanisterIdsSpy()).toHaveBeenCalledWith({
      identity: expect.any(AnonymousIdentity),
      rootCanisterId: root,
      certified: false,
    });
  });

  it("should check the controllers of governance, root, ledger and index", async () => {
    await getImportedSns(root);

    expect(importedSnsApi.queryCanistersControllers).toHaveBeenCalledWith({
      identity: expect.any(AnonymousIdentity),
      canisterIds: [governance, root, ledger, index],
    });
  });

  it("should accept the SNS if older governance has no topics", async () => {
    queryTopicsSpy().mockRejectedValue(new Error("no list_topics"));

    const dto = await getImportedSns(root);

    expect(dto.topics).toBeUndefined();
  });

  it.each(["governance", "ledger", "swap", "index"] as const)(
    "should reject the SNS if root does not list the %s canister",
    async (canister) => {
      querySnsCanisterIdsSpy().mockResolvedValue({
        root: [root],
        governance: [governance],
        ledger: [ledger],
        swap: [swap],
        index: [index],
        dapps: [],
        archives: [],
        extensions: [],
        [canister]: [],
      });

      await expectError("missing-canisters");
    }
  );

  it.each([
    ["root does not control governance", 0, [stranger]],
    ["governance does not control root", 1, [stranger]],
    ["root does not control the ledger", 2, [stranger]],
    ["root does not control the index", 3, [developer]],
  ])("should reject the SNS if %s", async (_, position, newControllers) => {
    controllers[position] = newControllers;

    await expectError("controllers");
  });

  it("should reject the SNS if the ledger mints to another canister", async () => {
    queryMintingAccountSpy().mockResolvedValue({ owner: stranger });

    await expectError("minting-account");
  });

  it("should reject the SNS if the ledger has no minting account", async () => {
    queryMintingAccountSpy().mockResolvedValue(undefined);

    await expectError("minting-account");
  });

  it("should reject the SNS if governance is in PreInitializationSwap mode", async () => {
    queryModeSpy().mockResolvedValue({ mode: [2] });

    await expectError("governance-mode");
  });

  it("should reject the SNS if governance has no mode", async () => {
    queryModeSpy().mockResolvedValue({ mode: [] });

    await expectError("governance-mode");
  });

  it("should not load the SNS data if a check fails", async () => {
    queryModeSpy().mockResolvedValue({ mode: [2] });

    await expectError("governance-mode");

    expect(importedSnsApi.querySnsGovernanceData).not.toHaveBeenCalled();
    expect(importedSnsApi.querySnsLedgerData).not.toHaveBeenCalled();
  });
});
