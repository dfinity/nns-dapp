/**
 * @jest-environment jsdom
 */

import * as api from "$lib/api/sns-governance.api";
import { DEFAULT_SNS_PROPOSALS_PAGE_SIZE } from "$lib/constants/sns-proposals.constants";
import {
  loadSnsProposal,
  loadSnsProposals,
} from "$lib/services/$public/sns-proposals.services";
import { authStore } from "$lib/stores/auth.store";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import * as toastsFunctions from "$lib/stores/toasts.store";
import { AnonymousIdentity } from "@dfinity/agent";
import type { SnsProposalData } from "@dfinity/sns";
import { SnsGovernanceError } from "@dfinity/sns";
import { fromDefinedNullable } from "@dfinity/utils";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import {
  authStoreMock,
  mockIdentity,
  mockPrincipal,
  mutableMockAuthStoreSubscribe,
} from "../../../mocks/auth.store.mock";
import { mockSnsProposal } from "../../../mocks/sns-proposals.mock";

describe("sns-proposals services", () => {
  const proposal1: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: BigInt(1) }],
  };
  const proposal2: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: BigInt(2) }],
  };
  const proposal3: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: BigInt(3) }],
  };
  const proposals = [proposal1, proposal2, proposal3];
  describe("loadSnsProposals", () => {
    const queryProposalsSpy = jest
      .spyOn(api, "queryProposals")
      .mockResolvedValue(proposals);

    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mutableMockAuthStoreSubscribe);

    describe("not logged in", () => {
      afterEach(() => {
        snsProposalsStore.reset();
        jest.clearAllMocks();
      });

      beforeAll(() => {
        authStoreMock.next({
          identity: undefined,
        });
      });

      it("should call queryProposals with the default params", async () => {
        await loadSnsProposals({
          rootCanisterId: mockPrincipal,
        });
        expect(queryProposalsSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            params: {
              limit: DEFAULT_SNS_PROPOSALS_PAGE_SIZE,
              beforeProposal: undefined,
            },
            identity: new AnonymousIdentity(),
            rootCanisterId: mockPrincipal,
          })
        );
      });

      it("should call queryProposals with the last proposal id params", async () => {
        const proposalId = { id: BigInt(1) };
        await loadSnsProposals({
          rootCanisterId: mockPrincipal,
          beforeProposalId: proposalId,
        });
        expect(queryProposalsSpy).toHaveBeenCalledWith({
          params: {
            limit: DEFAULT_SNS_PROPOSALS_PAGE_SIZE,
            beforeProposal: proposalId,
          },
          identity: new AnonymousIdentity(),
          certified: false,
          rootCanisterId: mockPrincipal,
        });
      });

      it("should load the proposals in the store", async () => {
        await loadSnsProposals({
          rootCanisterId: mockPrincipal,
        });
        await waitFor(() => {
          const storeData = get(snsProposalsStore);
          return expect(storeData[mockPrincipal.toText()]?.proposals).toEqual(
            proposals
          );
        });
      });

      it("set completed to true if response has less than page size", async () => {
        await loadSnsProposals({
          rootCanisterId: mockPrincipal,
        });
        await waitFor(() => {
          const storeData = get(snsProposalsStore);
          return expect(storeData[mockPrincipal.toText()]?.completed).toEqual(
            true
          );
        });
      });
    });

    describe("logged in", () => {
      it("should call queryProposals with user's identity", async () => {
        authStoreMock.next({
          identity: mockIdentity,
        });
        await loadSnsProposals({
          rootCanisterId: mockPrincipal,
        });
        expect(queryProposalsSpy).toHaveBeenCalledWith({
          params: {
            limit: DEFAULT_SNS_PROPOSALS_PAGE_SIZE,
            beforeProposal: undefined,
          },
          identity: mockIdentity,
          certified: false,
          rootCanisterId: mockPrincipal,
        });
      });
    });
  });

  describe("loadSnsProposal", () => {
    const proposalId = fromDefinedNullable(mockSnsProposal.id).id;

    describe("not logged in", () => {
      beforeEach(() => {
        authStoreMock.next({
          identity: undefined,
        });
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      it("should call queryProposal", async () => {
        const queryProposalSpy = jest
          .spyOn(api, "queryProposal")
          .mockResolvedValue(mockSnsProposal);

        await loadSnsProposal({
          rootCanisterId: mockPrincipal,
          proposalId,
          setProposal: jest.fn(),
        });

        await waitFor(() =>
          expect(queryProposalSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              proposalId,
              rootCanisterId: mockPrincipal,
              identity: new AnonymousIdentity(),
            })
          )
        );
      });

      it("should call setProposal", async () => {
        const setProposalSpy = jest.fn();
        await loadSnsProposal({
          rootCanisterId: mockPrincipal,
          proposalId,
          setProposal: setProposalSpy,
        });
        await waitFor(() =>
          expect(setProposalSpy).toHaveBeenCalledWith(mockSnsProposal)
        );
      });
    });

    describe("logged in", () => {
      authStoreMock.next({
        identity: mockIdentity,
      });

      it("should call queryProposals with user's identity", async () => {
        const queryProposalSpy = jest
          .spyOn(api, "queryProposal")
          .mockResolvedValue(mockSnsProposal);

        authStoreMock.next({
          identity: mockIdentity,
        });
        await loadSnsProposal({
          rootCanisterId: mockPrincipal,
          proposalId,
          setProposal: jest.fn(),
        });
        expect(queryProposalSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            proposalId,
            rootCanisterId: mockPrincipal,
            identity: mockIdentity,
            certified: false,
          })
        );
      });
    });

    describe("errors", () => {
      beforeEach(() => {
        jest.spyOn(api, "queryProposal").mockImplementation(() => {
          throw new SnsGovernanceError("test-message");
        });
        jest.spyOn(console, "error").mockImplementation(jest.fn);
      });
      afterEach(() => jest.clearAllMocks());

      it("should show error message in toast details", async () => {
        const toastsShow = jest.spyOn(toastsFunctions, "toastsShow");
        authStoreMock.next({
          identity: mockIdentity,
        });
        await loadSnsProposal({
          rootCanisterId: mockPrincipal,
          proposalId,
          setProposal: jest.fn(),
        });
        expect(toastsShow).toBeCalled();
        expect(toastsShow).toBeCalledWith(
          expect.objectContaining({
            labelKey: "error.proposal_not_found",
            detail: expect.stringContaining("test-message"),
          })
        );
      });
    });
  });
});
