import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import * as importedSnsApi from "$lib/api/imported-sns.api";
import { MAX_IMPORTED_SNSES } from "$lib/constants/imported-snses.constants";
import * as actionableSnsProposalsServices from "$lib/services/actionable-sns-proposals.services";
import {
  getImportedSns,
  getSnsToImport,
  importSns,
  loadImportedSnses,
  removeImportedSns,
} from "$lib/services/imported-sns.services";
import {
  actionableSnsProposalsStore,
  failedActionableSnsesStore,
} from "$lib/stores/actionable-sns-proposals.store";
import {
  importedSnsesStore,
  loadedImportedSnsesStore,
} from "$lib/stores/imported-snses.store";
import { snsAggregatorIncludingAbortedProjectsStore } from "$lib/stores/sns-aggregator.store";
import { ImportedSnsError } from "$lib/types/imported-sns.errors";
import { toCachedSnsDto } from "$lib/utils/imported-sns.utils";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { aggregatorSnsMockWith } from "$tests/mocks/sns-aggregator.mock";
import { nativeNervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { snsNervousSystemParametersMock } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { topicInfoMock } from "$tests/mocks/sns-topics.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import {
  IcrcMetadataResponseEntries,
  type IcrcTokenMetadataResponse,
} from "@icp-sdk/canisters/ledger/icrc";
import type { SnsGovernanceDid } from "@icp-sdk/canisters/sns";
import {
  AgentError,
  AnonymousIdentity,
  ErrorKindEnum,
  ReplicaRejectCode,
  requestIdOf,
  UncertifiedRejectErrorCode,
} from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { get } from "svelte/store";

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

  const methodNotFoundError = (methodName: string) =>
    new AgentError(
      new UncertifiedRejectErrorCode(
        requestIdOf({}),
        ReplicaRejectCode.CanisterError,
        `Canister has no query method '${methodName}'`,
        "IC0536",
        []
      ),
      ErrorKindEnum.Unknown
    );

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
    queryTopicsSpy().mockRejectedValue(methodNotFoundError("list_topics"));

    const dto = await getImportedSns(root);

    expect(dto.topics).toBeUndefined();
  });

  it("should fail if the topics query fails for another reason", async () => {
    const networkError = new Error("Failed to fetch");
    queryTopicsSpy().mockRejectedValue(networkError);

    await expect(getImportedSns(root)).rejects.toBe(networkError);
  });

  it("should reject a canister that has no list_sns_canisters method", async () => {
    querySnsCanisterIdsSpy().mockRejectedValue(
      methodNotFoundError("list_sns_canisters")
    );

    await expectError("missing-canisters");
  });

  it("should fail if the canister IDs query fails for another reason", async () => {
    const networkError = new Error("Failed to fetch");
    querySnsCanisterIdsSpy().mockRejectedValue(networkError);

    await expect(getImportedSns(root)).rejects.toBe(networkError);
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

  it("should not query the ledger and governance if the controllers check fails", async () => {
    controllers[0] = [stranger];

    await expectError("controllers");

    expect(icrcLedgerApi.queryIcrcMintingAccount).not.toHaveBeenCalled();
    expect(importedSnsApi.querySnsGovernanceMode).not.toHaveBeenCalled();
  });

  it("should reject the SNS if the ledger mints to another canister", async () => {
    queryMintingAccountSpy().mockResolvedValue({ owner: stranger });

    await expectError("minting-account");
  });

  it("should accept a minting subaccount of zeros", async () => {
    queryMintingAccountSpy().mockResolvedValue({
      owner: governance,
      subaccount: new Uint8Array(32),
    });

    await expect(getImportedSns(root)).resolves.toBeDefined();
  });

  it("should reject the SNS if the ledger mints to a governance subaccount", async () => {
    const subaccount = new Uint8Array(32);
    subaccount[31] = 1;
    queryMintingAccountSpy().mockResolvedValue({
      owner: governance,
      subaccount,
    });

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

  describe("loadImportedSnses", () => {
    const failingRoot = principal(30);

    beforeEach(() => {
      vi.spyOn(console, "error").mockReturnValue();
      vi.spyOn(
        actionableSnsProposalsServices,
        "loadActionableProposalsForSns"
      ).mockResolvedValue();
    });

    it("should load each imported SNS", async () => {
      importedSnsesStore.add(root.toText());

      await loadImportedSnses();

      expect(get(loadedImportedSnsesStore)).toEqual({
        rootCanisterIds: [root.toText()],
        snses: [await getImportedSns(root)],
      });
      expect(get(toastsStore)).toEqual([]);
    });

    it("should share one load for the same list", async () => {
      importedSnsesStore.add(root.toText());

      await Promise.all([loadImportedSnses(), loadImportedSnses()]);
      await loadImportedSnses();

      expect(querySnsCanisterIdsSpy()).toHaveBeenCalledTimes(1);
    });

    it("should not repeat the error toast for the same list", async () => {
      importedSnsesStore.add("not-a-principal");

      await loadImportedSnses();
      await loadImportedSnses();

      expect(get(toastsStore)).toHaveLength(1);
    });

    it("should load again when the list changes", async () => {
      importedSnsesStore.add(root.toText());
      await loadImportedSnses();

      importedSnsesStore.add(failingRoot.toText());
      await loadImportedSnses();

      expect(querySnsCanisterIdsSpy()).toHaveBeenCalledTimes(3);
      expect(get(loadedImportedSnsesStore).rootCanisterIds).toEqual([
        root.toText(),
        failingRoot.toText(),
      ]);
    });

    it("should not publish the result of a load for an older list", async () => {
      let resolveOldLoad: () => void;
      const oldLoad = new Promise<void>((resolve) => {
        resolveOldLoad = resolve;
      });
      const canisterIds = {
        root: [root],
        governance: [governance],
        ledger: [ledger],
        swap: [swap],
        index: [index],
        dapps: [],
        archives: [],
        extensions: [],
      } as Awaited<ReturnType<typeof importedSnsApi.querySnsCanisterIds>>;
      querySnsCanisterIdsSpy()
        .mockImplementationOnce(async () => {
          await oldLoad;
          throw new Error("Old load failed");
        })
        .mockResolvedValue(canisterIds);

      importedSnsesStore.add(failingRoot.toText());
      const olderCall = loadImportedSnses();
      importedSnsesStore.remove(failingRoot.toText());
      importedSnsesStore.add(root.toText());
      await loadImportedSnses();
      resolveOldLoad();
      await olderCall;

      expect(get(loadedImportedSnsesStore).rootCanisterIds).toEqual([
        root.toText(),
      ]);
      expect(get(loadedImportedSnsesStore).snses).toHaveLength(1);
      expect(get(toastsStore)).toEqual([]);
    });

    it("should not publish an older load when the list returns to an earlier value", async () => {
      let rejectFirstLoad: () => void;
      const firstLoad = new Promise<void>((_, reject) => {
        rejectFirstLoad = () => reject(new Error("First load failed"));
      });
      querySnsCanisterIdsSpy().mockImplementationOnce(async () => {
        await firstLoad;
        throw new Error("unreachable");
      });

      // The list goes from A to A+B and back to A.
      importedSnsesStore.add(root.toText());
      const firstCall = loadImportedSnses();
      importedSnsesStore.add(failingRoot.toText());
      const secondCall = loadImportedSnses();
      importedSnsesStore.remove(failingRoot.toText());
      await loadImportedSnses();
      rejectFirstLoad();
      await Promise.all([firstCall, secondCall]);

      expect(get(loadedImportedSnsesStore).rootCanisterIds).toEqual([
        root.toText(),
      ]);
      expect(get(loadedImportedSnsesStore).snses).toHaveLength(1);
      expect(get(toastsStore)).toEqual([]);
    });

    it("should show an error and keep the other SNSes if one SNS fails", async () => {
      querySnsCanisterIdsSpy().mockImplementation(
        async ({ rootCanisterId }) => {
          if (rootCanisterId.toText() === failingRoot.toText()) {
            throw new Error("Canister not found");
          }
          return {
            root: [root],
            governance: [governance],
            ledger: [ledger],
            swap: [swap],
            index: [index],
            dapps: [],
            archives: [],
            extensions: [],
          };
        }
      );
      importedSnsesStore.add(failingRoot.toText());
      importedSnsesStore.add(root.toText());

      await loadImportedSnses();

      expect(
        get(loadedImportedSnsesStore).snses.map(
          ({ canister_ids }) => canister_ids.root_canister_id
        )
      ).toEqual([root.toText()]);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: `The imported SNS ${failingRoot.toText()} failed to load. Canister not found`,
        },
      ]);
    });

    it("should show an error for a root canister ID that is not valid", async () => {
      importedSnsesStore.add("not-a-principal");

      await loadImportedSnses();

      expect(get(loadedImportedSnsesStore).snses).toEqual([]);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: expect.stringContaining(
            "The imported SNS not-a-principal failed to load."
          ),
        },
      ]);
    });
  });

  describe("getSnsToImport", () => {
    const expectImportError = async (reason: ImportedSnsError["reason"]) => {
      const call = getSnsToImport(root);

      await expect(call).rejects.toThrow(ImportedSnsError);
      await expect(call).rejects.toMatchObject({ reason });
      expect(querySnsCanisterIdsSpy()).not.toHaveBeenCalled();
    };

    it("should return the SNS after the checks", async () => {
      snsAggregatorIncludingAbortedProjectsStore.setData([
        aggregatorSnsMockWith({ rootCanisterId: stranger.toText() }),
      ]);

      expect(await getSnsToImport(root)).toEqual(await getImportedSns(root));
    });

    it("should reject an SNS that the user already imported", async () => {
      importedSnsesStore.add(root.toText());

      await expectImportError("already-imported");
    });

    it("should reject an SNS that the aggregator lists", async () => {
      snsAggregatorIncludingAbortedProjectsStore.setData([
        aggregatorSnsMockWith({ rootCanisterId: root.toText() }),
      ]);

      await expectImportError("already-listed");
    });

    it("should reject the SNS if the list is full", async () => {
      for (let i = 0; i < MAX_IMPORTED_SNSES; i++) {
        importedSnsesStore.add(principal(100 + i).toText());
      }

      await expectImportError("limit");
    });

    it("should accept the SNS if the list has room for one more", async () => {
      for (let i = 0; i < MAX_IMPORTED_SNSES - 1; i++) {
        importedSnsesStore.add(principal(100 + i).toText());
      }

      await expect(getSnsToImport(root)).resolves.toBeDefined();
    });

    it("should run the checks of an imported SNS", async () => {
      controllers[0] = [stranger];

      await expect(getSnsToImport(root)).rejects.toMatchObject({
        reason: "controllers",
      });
    });
  });

  describe("importSns", () => {
    const loadActionableProposalsSpy = () =>
      vi.spyOn(actionableSnsProposalsServices, "loadActionableProposalsForSns");

    // The root canister IDs of the SNSes that fail to load.
    const failingRoots = new Set<string>();

    beforeEach(() => {
      vi.spyOn(console, "error").mockReturnValue();
      loadActionableProposalsSpy().mockResolvedValue();
      snsAggregatorIncludingAbortedProjectsStore.setData([]);
      // The app loads the imported SNSes at start.
      loadedImportedSnsesStore.set({ rootCanisterIds: [], snses: [] });
      failingRoots.clear();
      querySnsCanisterIdsSpy().mockImplementation(
        async ({ rootCanisterId }) => {
          if (failingRoots.has(rootCanisterId.toText())) {
            throw new Error("Failed to fetch");
          }
          return {
            root: [rootCanisterId],
            governance: [governance],
            ledger: [ledger],
            swap: [swap],
            index: [index],
            dapps: [],
            archives: [],
            extensions: [],
          };
        }
      );
      // Root controls governance, and governance controls each root.
      vi.spyOn(importedSnsApi, "queryCanistersControllers").mockImplementation(
        async ({ canisterIds: [, rootCanisterId] }) => [
          [rootCanisterId],
          [governance],
          [rootCanisterId],
          [rootCanisterId],
        ]
      );
    });

    it("should add the SNS to the list and load it", async () => {
      setNoIdentity();

      await importSns(root);

      expect(get(importedSnsesStore)).toEqual([root.toText()]);
      expect(get(loadedImportedSnsesStore)).toEqual({
        rootCanisterIds: [root.toText()],
        snses: [await getImportedSns(root)],
      });
    });

    it("should load the actionable proposals of the SNS if the user is signed in", async () => {
      resetIdentity();

      await importSns(root);

      expect(loadActionableProposalsSpy()).toHaveBeenCalledTimes(1);
      expect(loadActionableProposalsSpy()).toHaveBeenCalledWith(root);
    });

    it("should not load actionable proposals if the user is signed out", async () => {
      setNoIdentity();

      await importSns(root);

      expect(loadActionableProposalsSpy()).not.toHaveBeenCalled();
    });

    it("should not load actionable proposals if the SNS fails to load", async () => {
      resetIdentity();
      failingRoots.add(root.toText());

      await importSns(root);

      expect(get(importedSnsesStore)).toEqual([root.toText()]);
      expect(get(loadedImportedSnsesStore).snses).toEqual([]);
      expect(loadActionableProposalsSpy()).not.toHaveBeenCalled();
    });

    it("should load the SNS again after a failed load of the same list", async () => {
      setNoIdentity();
      failingRoots.add(root.toText());
      importedSnsesStore.add(root.toText());
      await loadImportedSnses();
      expect(get(loadedImportedSnsesStore).snses).toEqual([]);

      removeImportedSns(root);
      failingRoots.clear();
      await importSns(root);

      expect(get(loadedImportedSnsesStore).snses).toEqual([
        await getImportedSns(root),
      ]);
    });

    it("should remove the actionable proposals if the user removes the SNS while they load", async () => {
      resetIdentity();
      loadActionableProposalsSpy().mockImplementation(
        async (rootCanisterId) => {
          removeImportedSns(rootCanisterId);
          actionableSnsProposalsStore.set({ rootCanisterId, proposals: [] });
        }
      );

      await importSns(root);
      await runResolvedPromises();

      expect(loadActionableProposalsSpy()).toHaveBeenCalledTimes(1);
      expect(get(actionableSnsProposalsStore)).toEqual({});
    });

    it("should load the actionable proposals of another SNS that loads again", async () => {
      resetIdentity();
      failingRoots.add(stranger.toText());
      importedSnsesStore.add(stranger.toText());
      await loadImportedSnses();
      expect(loadActionableProposalsSpy()).not.toHaveBeenCalled();

      failingRoots.clear();
      await importSns(root);

      expect(loadActionableProposalsSpy()).toHaveBeenCalledTimes(2);
      expect(loadActionableProposalsSpy()).toHaveBeenCalledWith(stranger);
      expect(loadActionableProposalsSpy()).toHaveBeenCalledWith(root);
    });

    it("should load the actionable proposals again after a removal and a new import", async () => {
      resetIdentity();
      loadActionableProposalsSpy().mockImplementation(async (rootCanisterId) =>
        actionableSnsProposalsStore.set({ rootCanisterId, proposals: [] })
      );
      await importSns(root);
      await runResolvedPromises();
      removeImportedSns(root);
      expect(get(actionableSnsProposalsStore)).toEqual({});

      await importSns(root);
      await runResolvedPromises();

      expect(loadActionableProposalsSpy()).toHaveBeenCalledTimes(2);
      expect(Object.keys(get(actionableSnsProposalsStore))).toEqual([
        root.toText(),
      ]);
    });

    it("should not load the actionable proposals of an SNS that has them", async () => {
      resetIdentity();
      importedSnsesStore.add(stranger.toText());
      await loadImportedSnses();
      actionableSnsProposalsStore.set({
        rootCanisterId: stranger,
        proposals: [],
      });
      loadActionableProposalsSpy().mockClear();

      await importSns(root);

      expect(loadActionableProposalsSpy()).toHaveBeenCalledTimes(1);
      expect(loadActionableProposalsSpy()).toHaveBeenCalledWith(root);
    });

    it("should remove the actionable proposals of another SNS that fails to load again", async () => {
      resetIdentity();
      importedSnsesStore.add(stranger.toText());
      await loadImportedSnses();
      actionableSnsProposalsStore.set({
        rootCanisterId: stranger,
        proposals: [],
      });
      failedActionableSnsesStore.add(stranger.toText());

      failingRoots.add(stranger.toText());
      await importSns(root);

      expect(get(actionableSnsProposalsStore)).toEqual({});
      expect(get(failedActionableSnsesStore)).toEqual([]);
    });
  });

  describe("removeImportedSns", () => {
    it("should keep the actionable proposals if the aggregator lists the SNS", () => {
      setSnsProjects([{ rootCanisterId: root }]);
      importedSnsesStore.add(root.toText());
      actionableSnsProposalsStore.set({
        rootCanisterId: root,
        proposals: [],
      });

      removeImportedSns(root);

      expect(Object.keys(get(actionableSnsProposalsStore))).toEqual([
        root.toText(),
      ]);
    });

    it("should remove the SNS from the list", () => {
      importedSnsesStore.add(root.toText());
      importedSnsesStore.add(stranger.toText());

      removeImportedSns(root);

      expect(get(importedSnsesStore)).toEqual([stranger.toText()]);
    });

    it("should remove the actionable proposals of the SNS", () => {
      importedSnsesStore.add(root.toText());
      actionableSnsProposalsStore.set({
        rootCanisterId: root,
        proposals: [],
      });
      actionableSnsProposalsStore.set({
        rootCanisterId: stranger,
        proposals: [],
      });
      failedActionableSnsesStore.add(root.toText());

      removeImportedSns(root);

      expect(Object.keys(get(actionableSnsProposalsStore))).toEqual([
        stranger.toText(),
      ]);
      expect(get(failedActionableSnsesStore)).toEqual([]);
    });
  });
});
