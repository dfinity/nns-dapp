import {
  snsFiltersStore,
  snsSelectedFiltersStore,
} from "$lib/stores/sns-filters.store";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { Principal } from "@dfinity/principal";
import { SnsProposalDecisionStatus } from "@dfinity/sns";
import { get } from "svelte/store";

describe("sns-filters store", () => {
  describe("snsFiltersStore", () => {
    beforeEach(() => {
      snsFiltersStore.reset();
    });

    it("should setDecisionStatus in different projects", () => {
      const rootCanisterId = mockPrincipal;
      const rootCanisterId2 = Principal.fromText("pin7y-wyaaa-aaaaa-aacpa-cai");
      const decisionStatus = [
        {
          id: "1",
          name: "status-1",
          value: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
          checked: true,
        },
        {
          id: "2",
          name: "status-2",
          value: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED,
          checked: true,
        },
      ];
      snsFiltersStore.setDecisionStatus({ rootCanisterId, decisionStatus });

      const projectStore = get(snsFiltersStore)[rootCanisterId.toText()];
      expect(projectStore.decisionStatus).toEqual(decisionStatus);

      snsFiltersStore.setDecisionStatus({
        rootCanisterId: rootCanisterId2,
        decisionStatus,
      });
      const projectStore2 = get(snsFiltersStore)[rootCanisterId2.toText()];
      expect(projectStore2.decisionStatus).toEqual(decisionStatus);
    });

    it("setCheckDecisionStatus should check filters in different projects", () => {
      const rootCanisterId = mockPrincipal;
      const rootCanisterId2 = Principal.fromText("pin7y-wyaaa-aaaaa-aacpa-cai");
      const decisionStatus = [
        {
          id: "1",
          name: "status-1",
          value: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
          checked: false,
        },
        {
          id: "2",
          name: "status-2",
          value: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED,
          checked: false,
        },
      ];

      // Project rootCanisterId
      snsFiltersStore.setDecisionStatus({ rootCanisterId, decisionStatus });
      const projectStore = get(snsFiltersStore)[rootCanisterId.toText()];
      expect(
        projectStore.decisionStatus.filter(({ checked }) => checked).length
      ).toEqual(0);

      const statuses = decisionStatus.map(({ value }) => value);
      snsFiltersStore.setCheckDecisionStatus({
        rootCanisterId,
        checkedDecisionStatus: statuses,
      });
      const projectStore2 = get(snsFiltersStore)[rootCanisterId.toText()];
      expect(
        projectStore2.decisionStatus.filter(({ checked }) => checked).length
      ).toEqual(statuses.length);

      // Project rootCanisterId2
      snsFiltersStore.setDecisionStatus({
        rootCanisterId: rootCanisterId2,
        decisionStatus,
      });
      const projectStore3 = get(snsFiltersStore)[rootCanisterId2.toText()];
      expect(
        projectStore3.decisionStatus.filter(({ checked }) => checked).length
      ).toEqual(0);

      snsFiltersStore.setCheckDecisionStatus({
        rootCanisterId: rootCanisterId2,
        checkedDecisionStatus: [
          SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
        ],
      });
      const projectStore4 = get(snsFiltersStore)[rootCanisterId2.toText()];
      expect(
        projectStore4.decisionStatus.filter(({ checked }) => checked).length
      ).toEqual(1);

      // Project 1 has not changed
      const projectStore5 = get(snsFiltersStore)[rootCanisterId.toText()];
      expect(
        projectStore5.decisionStatus.filter(({ checked }) => checked).length
      ).toEqual(statuses.length);

      // Uncheck from Project 2
      snsFiltersStore.setCheckDecisionStatus({
        rootCanisterId,
        checkedDecisionStatus: [
          SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
        ],
      });
      const projectStore6 = get(snsFiltersStore)[rootCanisterId.toText()];
      expect(
        projectStore6.decisionStatus.filter(({ checked }) => checked).length
      ).toEqual(1);
    });
  });

  describe("snsSelectedFiltersStore", () => {
    beforeEach(() => {
      snsFiltersStore.reset();
    });
    it("should return the selected decision status filters", () => {
      const rootCanisterId = mockPrincipal;
      const decisionStatus = [
        {
          id: "1",
          name: "status-1",
          value: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
          checked: false,
        },
        {
          id: "2",
          name: "status-2",
          value: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED,
          checked: false,
        },
      ];

      // Project rootCanisterId
      snsFiltersStore.setDecisionStatus({ rootCanisterId, decisionStatus });

      expect(
        get(snsSelectedFiltersStore)[rootCanisterId.toText()]?.decisionStatus
      ).toHaveLength(0);

      snsFiltersStore.setCheckDecisionStatus({
        rootCanisterId,
        checkedDecisionStatus: [
          SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED,
        ],
      });

      expect(
        get(snsSelectedFiltersStore)[rootCanisterId.toText()]?.decisionStatus
      ).toHaveLength(1);
    });
  });
});
