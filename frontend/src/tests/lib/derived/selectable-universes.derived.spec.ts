import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { FEATURED_SNS_PROJECTS } from "$lib/constants/sns.constants";
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
import { Principal } from "@icp-sdk/core/principal";
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

    it("should return NNS followed by SNS projects ordered alphabetically on governance pages when metrics are equal", () => {
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

    it("should not sort by actionable proposal count on governance pages", () => {
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

      // Without metrics, projects fall back to alphabetical order
      // regardless of actionable proposal count
      expect(get(selectableUniversesStore).map(({ title }) => title)).toEqual([
        "Internet Computer",
        "Alfa",
        "Bravo",
        "Charlie",
      ]);
    });

    it("should sort featured SNS projects first on governance pages", () => {
      page.mock({
        routeId: AppPath.Proposals,
        data: { universe: OWN_CANISTER_ID.toText() },
      });

      const featuredCanisterId = Principal.fromText(FEATURED_SNS_PROJECTS[0]);
      const nonFeaturedCanisterId = principal(1);

      setSnsProjects([
        {
          rootCanisterId: nonFeaturedCanisterId,
          projectName: "Alfa Non-Featured",
        },
        {
          rootCanisterId: featuredCanisterId,
          projectName: "Zulu Featured",
        },
      ]);

      const titles = get(selectableUniversesStore).map(({ title }) => title);
      expect(titles).toEqual([
        "Internet Computer",
        "Zulu Featured",
        "Alfa Non-Featured",
      ]);
    });

    it("should sort SNS projects by proposal activity on governance pages", () => {
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
          projectName: "Low Activity",
          metrics: {
            num_recently_submitted_proposals: null,
            num_recently_executed_proposals: 10,
            last_ledger_block_timestamp: null,
            treasury_metrics: null,
            voting_power_metrics: null,
            genesis_timestamp_seconds: null,
          },
        },
        {
          rootCanisterId: rootCanisterId2,
          projectName: "No Activity",
        },
        {
          rootCanisterId: rootCanisterId3,
          projectName: "High Activity",
          metrics: {
            num_recently_submitted_proposals: null,
            num_recently_executed_proposals: 100,
            last_ledger_block_timestamp: null,
            treasury_metrics: null,
            voting_power_metrics: null,
            genesis_timestamp_seconds: null,
          },
        },
      ]);

      const titles = get(selectableUniversesStore).map(({ title }) => title);
      expect(titles).toEqual([
        "Internet Computer",
        "High Activity",
        "Low Activity",
        "No Activity",
      ]);
    });
  });
});
