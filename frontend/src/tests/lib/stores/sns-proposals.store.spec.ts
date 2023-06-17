import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { Principal } from "@dfinity/principal";
import type { SnsProposalData } from "@dfinity/sns";
import { get } from "svelte/store";

describe("SNS Proposals stores", () => {
  const snsProposal1: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: BigInt(2) }],
  };
  const snsProposal2: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: BigInt(2) }],
  };
  const snsProposal3: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: BigInt(3) }],
  };
  describe("snsProposalsStore", () => {
    afterEach(() => snsProposalsStore.reset());
    it("should set proposals for a project", () => {
      const proposals: SnsProposalData[] = [
        snsProposal1,
        snsProposal2,
        snsProposal3,
      ];
      snsProposalsStore.setProposals({
        rootCanisterId: mockPrincipal,
        proposals,
        certified: true,
        completed: true,
      });

      const proposalsInStore = get(snsProposalsStore);
      expect(proposalsInStore[mockPrincipal.toText()].proposals).toEqual(
        proposals
      );
    });

    it("should add proposals for another project", () => {
      const proposals: SnsProposalData[] = [snsProposal1, snsProposal2];
      snsProposalsStore.setProposals({
        rootCanisterId: mockPrincipal,
        proposals,
        certified: true,
        completed: false,
      });
      const proposals2: SnsProposalData[] = [snsProposal3];
      const principal2 = Principal.fromText("aaaaa-aa");
      snsProposalsStore.setProposals({
        rootCanisterId: principal2,
        proposals: proposals2,
        certified: true,
        completed: false,
      });
      const proposalsInStore = get(snsProposalsStore);
      expect(proposalsInStore[mockPrincipal.toText()].proposals).toEqual(
        proposals
      );
      expect(proposalsInStore[principal2.toText()].proposals).toEqual(
        proposals2
      );
    });

    it("should add proposals to a project with proposals", () => {
      const proposals: SnsProposalData[] = [snsProposal1, snsProposal2];
      snsProposalsStore.setProposals({
        rootCanisterId: mockPrincipal,
        proposals,
        certified: true,
        completed: false,
      });
      const proposals2: SnsProposalData[] = [snsProposal3];
      snsProposalsStore.addProposals({
        rootCanisterId: mockPrincipal,
        proposals: proposals2,
        certified: true,
        completed: true,
      });

      const proposalsInStore = get(snsProposalsStore);
      expect(proposalsInStore[mockPrincipal.toText()].proposals.length).toEqual(
        3
      );
    });

    it("should add proposals to a project without proposals using `addProposals`", () => {
      const proposals: SnsProposalData[] = [snsProposal1, snsProposal2];
      snsProposalsStore.addProposals({
        rootCanisterId: mockPrincipal,
        proposals,
        certified: true,
        completed: false,
      });
      const proposals2: SnsProposalData[] = [snsProposal3];
      snsProposalsStore.addProposals({
        rootCanisterId: mockPrincipal,
        proposals: proposals2,
        certified: true,
        completed: true,
      });

      const proposalsInStore = get(snsProposalsStore);
      expect(proposalsInStore[mockPrincipal.toText()].proposals.length).toEqual(
        3
      );
    });
  });
});
