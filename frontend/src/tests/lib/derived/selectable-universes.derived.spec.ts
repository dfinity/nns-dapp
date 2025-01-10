import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { page } from "$mocks/$app/stores";
import { principal } from "$tests/mocks/sns-projects.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import {
  resetCkETHCanisters,
  setCkETHCanisters,
} from "$tests/utils/cketh.test-utils";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { get } from "svelte/store";

describe("selectable universes derived stores", () => {
  beforeEach(() => {
    resetCkETHCanisters();

    page.mock({
      routeId: AppPath.Accounts,
      data: { universe: OWN_CANISTER_ID.toText() },
    });
  });

  it("should return Nns, ckBTC and ckTESTBTC (flag for test is true) per default", () => {
    const store = get(selectableUniversesStore);
    expect(store.map(({ title }) => title)).toEqual([
      "Internet Computer",
      "ckBTC",
      "ckTESTBTC",
    ]);
  });

  it("should return CkETH in Accounts page", () => {
    setCkETHCanisters();
    const store = get(selectableUniversesStore);
    expect(store.map(({ title }) => title)).toEqual([
      "Internet Computer",
      "ckBTC",
      "ckETH",
      "ckTESTBTC",
    ]);
  });

  it("should not return ckBTC or ckETH if path is not Account", () => {
    page.mock({
      routeId: AppPath.Neurons,
      data: { universe: OWN_CANISTER_ID.toText() },
    });

    const store = get(selectableUniversesStore);
    expect(store.map(({ title }) => title)).toEqual(["Internet Computer"]);
  });

  describe("with projects", () => {
    it("should return Nns, ckBTC, ckTESTBTC (flag for test is true) and another project", () => {
      setSnsProjects([
        {
          projectName: "SNS Project",
        },
      ]);
      const store = get(selectableUniversesStore);
      expect(store.length).toEqual(4);
      expect(store.map(({ title }) => title)).toEqual([
        "Internet Computer",
        "ckBTC",
        "ckTESTBTC",
        "SNS Project",
      ]);
    });

    it("should return NNS followed by SNS projects ordered alphabetically", () => {
      page.mock({
        routeId: AppPath.Proposals,
        data: { universe: OWN_CANISTER_ID.toText() },
      });

      const rootCanisterId1 = principal(1);
      const rootCanisterId2 = principal(2);
      const rootCanisterId3 = principal(3);

      setSnsProjects([
        {
          rootCanisterId: rootCanisterId1,
          projectName: "Bravo",
        },
        {
          rootCanisterId: rootCanisterId2,
          projectName: "Alfa",
        },
        {
          rootCanisterId: rootCanisterId3,
          projectName: "Charlie",
        },
      ]);

      expect(get(selectableUniversesStore).map(({ title }) => title)).toEqual([
        "Internet Computer",
        "Alfa",
        "Bravo",
        "Charlie",
      ]);
    });

    it("should return NNS followed by SNS projects in reverse order of actionable proposals", () => {
      page.mock({
        routeId: AppPath.Proposals,
        data: { universe: OWN_CANISTER_ID.toText() },
      });

      const rootCanisterIdA = principal(1);
      const rootCanisterIdB = principal(2);
      const rootCanisterIdC = principal(3);

      setSnsProjects([
        {
          rootCanisterId: rootCanisterIdB,
          projectName: "Bravo",
        },
        {
          rootCanisterId: rootCanisterIdA,
          projectName: "Alfa",
        },
        {
          rootCanisterId: rootCanisterIdC,
          projectName: "Charlie",
        },
      ]);

      actionableSnsProposalsStore.set({
        rootCanisterId: rootCanisterIdC,
        proposals: [mockSnsProposal, mockSnsProposal],
      });

      actionableSnsProposalsStore.set({
        rootCanisterId: rootCanisterIdB,
        proposals: [mockSnsProposal],
      });

      expect(get(selectableUniversesStore).map(({ title }) => title)).toEqual([
        "Internet Computer",
        "Charlie",
        "Bravo",
        "Alfa",
      ]);
    });
  });
});
