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

    it("should sort NNS before SNS projects on the proposals page", () => {
      page.mock({
        routeId: AppPath.Proposals,
        data: { universe: OWN_CANISTER_ID.toText() },
      });

      setSnsProjects([{ projectName: "SNS Project" }]);

      const titles = get(selectableUniversesStore).map(({ title }) => title);
      expect(titles[0]).toBe("Internet Computer");
      expect(titles).toContain("SNS Project");
    });

    it("should sort SNS projects by actionable proposals, then featured, then launchpad rules, then alphabetically", () => {
      page.mock({
        routeId: AppPath.Proposals,
        data: { universe: OWN_CANISTER_ID.toText() },
      });

      const actionableId = principal(1);
      const featuredId = Principal.fromText(FEATURED_SNS_PROJECTS[0]);
      const activeId = principal(3);
      const idleZuluId = principal(4);
      const idleAlfaId = principal(5);

      setSnsProjects([
        { rootCanisterId: idleAlfaId, projectName: "Alfa Idle" },
        {
          rootCanisterId: activeId,
          projectName: "Active",
          metrics: {
            num_recently_submitted_proposals: null,
            num_recently_executed_proposals: 100,
            last_ledger_block_timestamp: null,
            treasury_metrics: null,
            voting_power_metrics: null,
            genesis_timestamp_seconds: null,
          },
        },
        { rootCanisterId: featuredId, projectName: "Featured" },
        { rootCanisterId: idleZuluId, projectName: "Zulu Idle" },
        { rootCanisterId: actionableId, projectName: "Actionable" },
      ]);

      actionableSnsProposalsStore.set({
        rootCanisterId: actionableId,
        proposals: [mockSnsProposal],
      });

      const titles = get(selectableUniversesStore).map(({ title }) => title);
      expect(titles).toEqual([
        "Internet Computer",
        "Actionable",
        "Featured",
        "Active",
        "Alfa Idle",
        "Zulu Idle",
      ]);
    });
  });
});
