import { snsFiltesStore } from "$lib/stores/sns-filters.store";
import { Principal } from "@dfinity/principal";
import { SnsProposalDecisionStatus } from "@dfinity/sns";
import { get } from "svelte/store";
import { mockPrincipal } from "../../mocks/auth.store.mock";

describe("sns-filters store", () => {
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
    snsFiltesStore.setDecisionStatus({ rootCanisterId, decisionStatus });

    const projectStore = get(snsFiltesStore)[rootCanisterId.toText()];
    expect(projectStore.decisionStatus).toEqual(decisionStatus);

    snsFiltesStore.setDecisionStatus({
      rootCanisterId: rootCanisterId2,
      decisionStatus,
    });
    const projectStore2 = get(snsFiltesStore)[rootCanisterId2.toText()];
    expect(projectStore2.decisionStatus).toEqual(decisionStatus);
  });

  it("checkDecisionStatus should check filters in different projects", () => {
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
    snsFiltesStore.setDecisionStatus({ rootCanisterId, decisionStatus });
    const projectStore = get(snsFiltesStore)[rootCanisterId.toText()];
    expect(
      projectStore.decisionStatus.filter(({ checked }) => checked).length
    ).toEqual(0);

    const statuses = decisionStatus.map(({ value }) => value);
    snsFiltesStore.checkDecisionStatus({
      rootCanisterId,
      checkedDecisionStatus: statuses,
    });
    const projectStore2 = get(snsFiltesStore)[rootCanisterId2.toText()];
    expect(
      projectStore2.decisionStatus.filter(({ checked }) => checked).length
    ).toEqual(statuses.length);

    // Project rootCanisterId2
    snsFiltesStore.setDecisionStatus({
      rootCanisterId: rootCanisterId2,
      decisionStatus,
    });
    const projectStore3 = get(snsFiltesStore)[rootCanisterId2.toText()];
    expect(
      projectStore3.decisionStatus.filter(({ checked }) => checked).length
    ).toEqual(0);

    snsFiltesStore.checkDecisionStatus({
      rootCanisterId: rootCanisterId2,
      checkedDecisionStatus: [
        SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
      ],
    });
    const projectStore4 = get(snsFiltesStore)[rootCanisterId2.toText()];
    expect(
      projectStore4.decisionStatus.filter(({ checked }) => checked).length
    ).toEqual(1);

    // Project 1 has not changed
    const projectStore5 = get(snsFiltesStore)[rootCanisterId.toText()];
    expect(
      projectStore5.decisionStatus.filter(({ checked }) => checked).length
    ).toEqual(statuses.length);

    // Uncheck from Project 2
    snsFiltesStore.checkDecisionStatus({
      rootCanisterId,
      checkedDecisionStatus: [
        SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
      ],
    });
    const projectStore6 = get(snsFiltesStore)[rootCanisterId.toText()];
    expect(
      projectStore6.decisionStatus.filter(({ checked }) => checked).length
    ).toEqual(1);
  });
});
