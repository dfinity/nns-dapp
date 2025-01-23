import {
  snsFiltersStore,
  snsSelectedFiltersStore,
} from "$lib/stores/sns-filters.store";
import type { Filter, SnsProposalTypeFilterId } from "$lib/types/filters";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { Principal } from "@dfinity/principal";
import { SnsProposalDecisionStatus } from "@dfinity/sns";
import { get } from "svelte/store";

describe("sns-filters store", () => {
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
  const unCheckedDecisionStatus = decisionStatus.map((status) => ({
    ...status,
    checked: false,
  }));

  const types: Filter<SnsProposalTypeFilterId>[] = [
    {
      id: "1",
      name: "type-1",
      checked: false,
      value: "1",
    },
    {
      id: "2",
      name: "type-2",
      checked: false,
      value: "2",
    },
  ];
  const unCheckedTypes: Filter<SnsProposalTypeFilterId>[] = types.map(
    (type) => ({
      ...type,
      checked: false,
    })
  );

  describe("snsFiltersStore", () => {
    it("should setDecisionStatus in different projects", () => {
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

    it("should setTypes in different projects", () => {
      snsFiltersStore.setTypes({ rootCanisterId, types: [...types] });

      const projectStore = get(snsFiltersStore)[rootCanisterId.toText()];
      expect(projectStore.types).toEqual(types);

      snsFiltersStore.setTypes({
        rootCanisterId: rootCanisterId2,
        types: [...types],
      });
      const projectStore2 = get(snsFiltersStore)[rootCanisterId2.toText()];
      expect(projectStore2.types).toEqual(types);
    });

    it("setCheckDecisionStatus should check filters in different projects", () => {
      // Project rootCanisterId
      snsFiltersStore.setDecisionStatus({
        rootCanisterId,
        decisionStatus: unCheckedDecisionStatus,
      });
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
        decisionStatus: unCheckedDecisionStatus,
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

    it("setTypes should check filters in different projects", () => {
      // Project rootCanisterId
      snsFiltersStore.setTypes({
        rootCanisterId,
        types: unCheckedTypes,
      });
      const projectStore1 = get(snsFiltersStore)[rootCanisterId.toText()];
      expect(
        projectStore1.types.filter(({ checked }) => checked).length
      ).toEqual(0);

      const typeValues = types.map(({ value }) => value);
      // rootCanisterId: all checked
      snsFiltersStore.setCheckTypes({
        rootCanisterId,
        checkedTypes: typeValues,
      });
      const projectStore2 = get(snsFiltersStore)[rootCanisterId.toText()];
      expect(
        projectStore2.types.filter(({ checked }) => checked).length
      ).toEqual(typeValues.length);

      // Project rootCanisterId2
      snsFiltersStore.setTypes({
        rootCanisterId: rootCanisterId2,
        types: unCheckedTypes,
      });
      const projectStore3 = get(snsFiltersStore)[rootCanisterId2.toText()];
      expect(
        projectStore3.types.filter(({ checked }) => checked).length
      ).toEqual(0);

      // rootCanisterId2: 1 checked
      snsFiltersStore.setCheckTypes({
        rootCanisterId: rootCanisterId2,
        checkedTypes: [typeValues[0]],
      });
      const projectStore4 = get(snsFiltersStore)[rootCanisterId2.toText()];
      expect(
        projectStore4.types.filter(({ checked }) => checked).length
      ).toEqual(1);

      // Project 1 has not changed
      const projectStore5 = get(snsFiltersStore)[rootCanisterId.toText()];
      expect(
        projectStore5.types.filter(({ checked }) => checked).length
      ).toEqual(typeValues.length);

      // Uncheck from Project 2
      snsFiltersStore.setCheckTypes({
        rootCanisterId,
        checkedTypes: [typeValues[1]],
      });
      const projectStore6 = get(snsFiltersStore)[rootCanisterId.toText()];
      expect(
        projectStore6.types.filter(({ checked }) => checked).length
      ).toEqual(1);
    });
  });

  describe("snsSelectedFiltersStore", () => {
    it("should return the selected decision status filters", () => {
      // Project rootCanisterId
      snsFiltersStore.setDecisionStatus({
        rootCanisterId,
        decisionStatus: unCheckedDecisionStatus,
      });

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
