import * as api from "$lib/api/proposals.api";
import {
  ProposalPayloadNotFoundError,
  ProposalPayloadTooLargeError,
} from "$lib/canisters/nns-dapp/nns-dapp.errors";
import {
  listNextProposals,
  listProposals,
  loadProposal,
  loadProposalPayload,
} from "$lib/services/public/proposals.services";
import { getCurrentIdentity } from "$lib/services/auth.services";
import { authStore } from "$lib/stores/auth.store";
import {
  proposalPayloadsStore,
  proposalsFiltersStore,
  proposalsStore,
} from "$lib/stores/proposals.store";
import * as toastsFunctions from "$lib/stores/toasts.store";
import {
  mockAuthStoreNoIdentitySubscribe,
  mockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import { mockProposals } from "$tests/mocks/proposals.store.mock";
import { toastsStore } from "@dfinity/gix-components";
import type { ProposalInfo } from "@dfinity/nns";
import { get } from "svelte/store";

describe("proposals-services", () => {
  beforeEach(() => {
    toastsStore.reset();
    proposalsStore.setProposals({ proposals: [], certified: true });
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockRestore();
  });

  describe("logged in user", () => {
    beforeEach(() => {
      vi.spyOn(authStore, "subscribe").mockImplementation(
        mockAuthStoreSubscribe
      );
    });

    describe("list", () => {
      const spySetProposals = vi.spyOn(proposalsStore, "setProposals");
      const spyPushProposals = vi.spyOn(proposalsStore, "pushProposals");
      let spyQueryProposals;

      beforeEach(() => {
        spyQueryProposals = vi
          .spyOn(api, "queryProposals")
          .mockImplementation(() => Promise.resolve(mockProposals));
      });

      it("should call the canister to list proposals", async () => {
        expect(spyQueryProposals).not.toHaveBeenCalled();
        await listProposals({
          loadFinished: () => {
            // do nothing here
          },
        });

        expect(spyQueryProposals).toHaveBeenCalled();

        const { proposals } = get(proposalsStore);
        expect(proposals).toEqual(mockProposals);
      });

      it("should call the canister to list the next proposals", async () => {
        expect(spyQueryProposals).not.toHaveBeenCalled();
        await listNextProposals({
          beforeProposal: mockProposals[mockProposals.length - 1].id,
          loadFinished: () => {
            // do nothing here
          },
        });

        expect(spyQueryProposals).toHaveBeenCalled();

        const { proposals } = get(proposalsStore);
        expect(proposals).toEqual(mockProposals);
      });

      it("should not clear the list proposals before query", async () => {
        expect(spySetProposals).not.toHaveBeenCalled();
        await listProposals({
          loadFinished: () => {
            // do nothing here
          },
        });
        expect(spySetProposals).toHaveBeenCalledTimes(2);
      });

      it("should push new proposals to the list", async () => {
        expect(spyPushProposals).not.toHaveBeenCalled();
        await listNextProposals({
          beforeProposal: mockProposals[mockProposals.length - 1].id,
          loadFinished: () => {
            // do nothing here
          },
        });
        expect(spyPushProposals).toHaveBeenCalledTimes(2);
      });

      it("should call callback when load finished", async () => {
        const spy = vi.fn();

        await listNextProposals({
          beforeProposal: mockProposals[mockProposals.length - 1].id,
          loadFinished: spy,
        });
        expect(spy).toHaveBeenCalledTimes(2);
      });
    });

    describe("list proposal fails", () => {
      beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);
      });

      it("show add toast error size too large", async () => {
        const message = `Call failed:
        Canister: rrkah-fqaaa-aaaaa-aaaaq-cai
        Method: list_proposals (query)
        "Status": "rejected"
        "Code": "CanisterError"
        "Message": "IC0504: Canister rrkah-fqaaa-aaaaa-aaaaq-cai violated contract: ic0.msg_reply_data_append: application payload size (3824349) cannot be larger than 3145728"`;
        vi.spyOn(api, "queryProposals").mockRejectedValue(new Error(message));
        await listProposals({
          loadFinished: () => {
            // do nothing here
          },
        });

        expect(get(toastsStore)[0]).toMatchObject({
          level: "error",
          text: "The current proposals response is too large. Please adjust proposal filters to get less results.",
        });
      });

      it("show error message from api", async () => {
        const errorMessage = "Error message from api.";
        vi.spyOn(api, "queryProposals").mockRejectedValue(
          new Error(errorMessage)
        );
        await listProposals({
          loadFinished: () => {
            // do nothing here
          },
        });

        expect(get(toastsStore)[0].text).toMatch(errorMessage);
        expect(get(toastsStore)[0]).toMatchObject({
          level: "error",
          text: "There was an unexpected issue while searching for the proposals. Error message from api.",
        });
      });
    });

    describe("load", () => {
      const spyQueryProposal = vi.spyOn(api, "queryProposal");

      beforeEach(() => {
        spyQueryProposal.mockImplementation(() =>
          Promise.resolve({ ...mockProposals[0], id: 666n })
        );
        proposalsStore.setProposals({
          proposals: mockProposals,
          certified: true,
        });
      });

      it("should call the canister to get proposalInfo", async () => {
        expect(spyQueryProposal).not.toBeCalled();
        let result;
        await loadProposal({
          proposalId: 666n,
          setProposal: (proposal: ProposalInfo) => (result = proposal),
        });
        expect(result?.id).toBe(666n);
        expect(spyQueryProposal).toBeCalledTimes(2);
      });
    });

    describe("error message in details", () => {
      beforeEach(() => {
        vi.spyOn(api, "queryProposal").mockImplementation(() => {
          throw new Error("test-message");
        });
        vi.spyOn(console, "error").mockReturnValue();
      });

      it("should show error message in details", async () => {
        const toastsShow = vi.spyOn(toastsFunctions, "toastsShow");
        expect(toastsShow).not.toBeCalled();

        await loadProposal({
          proposalId: 0n,
          setProposal: vi.fn,
        });
        expect(toastsShow).toBeCalledTimes(1);
        expect(toastsShow).toBeCalledWith({
          detail: 'id: "0". test-message',
          labelKey: "error.proposal_not_found",
          level: "error",
        });
      });
    });

    describe("empty list", () => {
      it("should not push empty proposals to the list", async () => {
        vi.spyOn(api, "queryProposals").mockImplementation(() =>
          Promise.resolve([])
        );

        const spy = vi.spyOn(proposalsStore, "pushProposals");
        await listNextProposals({
          beforeProposal: mockProposals[mockProposals.length - 1].id,
          loadFinished: () => {
            // do nothing here
          },
        });
        expect(spy).toHaveBeenCalledTimes(0);
        spy.mockClear();
      });

      it("should call callback with pagination over", async () => {
        vi.spyOn(api, "queryProposals").mockImplementation(() =>
          Promise.resolve([])
        );

        const spyCallback = vi.fn();

        await listNextProposals({
          beforeProposal: mockProposals[mockProposals.length - 1].id,
          loadFinished: spyCallback,
        });

        expect(spyCallback).toHaveBeenCalledTimes(2);
        expect(spyCallback).toHaveBeenLastCalledWith({
          paginationOver: true,
          certified: true,
        });
      });
    });
  });

  describe("no identity", () => {
    beforeEach(() => {
      vi.spyOn(console, "error").mockReturnValue();
      vi.spyOn(authStore, "subscribe").mockImplementation(
        mockAuthStoreNoIdentitySubscribe
      );
    });

    it("should use anonymous identity", () => {
      expect(getCurrentIdentity().getPrincipal().isAnonymous()).toEqual(true);
    });

    it("should list proposals if no identity", async () => {
      await expect(
        listProposals({
          loadFinished: () => {
            // do nothing here
          },
        })
      ).resolves;
    });

    it("should list next proposals if no identity", async () => {
      await expect(
        listNextProposals({
          beforeProposal: mockProposals[mockProposals.length - 1].id,
          loadFinished: () => {
            // do nothing here
          },
        })
      ).resolves;
    });

    it("should load proposal if no identity", async () => {
      const spyQueryProposal = vi
        .spyOn(api, "queryProposal")
        .mockImplementation(() =>
          Promise.resolve({ ...mockProposals[0], id: 666n })
        );
      expect(spyQueryProposal).not.toBeCalled();

      let result;
      await loadProposal({
        proposalId: 666n,
        setProposal: (proposal: ProposalInfo) => (result = proposal),
      });
      expect(result?.id).toBe(666n);
      expect(spyQueryProposal).toBeCalledTimes(1);
    });
  });

  describe("filter", () => {
    let spyQueryProposals;

    beforeEach(() => {
      vi.spyOn(authStore, "subscribe").mockImplementation(
        mockAuthStoreNoIdentitySubscribe
      );
      spyQueryProposals = vi
        .spyOn(api, "queryProposals")
        .mockImplementation(() => Promise.resolve(mockProposals));
    });

    it("should load proposals if filters are empty", async () => {
      proposalsFiltersStore.filterStatus([]);
      proposalsFiltersStore.filterTopics([]);
      expect(spyQueryProposals).not.toHaveBeenCalled();

      await listProposals({
        loadFinished: () => {
          // do nothing here
        },
      });

      expect(spyQueryProposals).toHaveBeenCalledTimes(1);

      const { proposals } = get(proposalsStore);
      expect(proposals).toEqual(mockProposals);

      proposalsFiltersStore.reset();
    });
  });

  describe("getProposalPayload", () => {
    const spyQueryProposalPayload = vi.spyOn(api, "queryProposalPayload");

    beforeEach(() => {
      vi.spyOn(console, "error").mockReturnValue();
      spyQueryProposalPayload.mockImplementation(() =>
        Promise.resolve({ data: "test" })
      );
    });

    it("should call queryProposalPayload", async () => {
      expect(spyQueryProposalPayload).not.toBeCalled();
      await loadProposalPayload({ proposalId: 0n });
      expect(spyQueryProposalPayload).toBeCalledTimes(1);
    });

    it("should update proposalPayloadsStore", async () => {
      const spyOnSetPayload = vi.spyOn(proposalPayloadsStore, "setPayload");
      expect(spyOnSetPayload).not.toBeCalled();
      await loadProposalPayload({ proposalId: 0n });

      expect(spyOnSetPayload).toBeCalledTimes(2);
      expect(spyOnSetPayload).toHaveBeenLastCalledWith({
        payload: { data: "test" },
        proposalId: 0n,
      });
    });

    it("should update proposalPayloadsStore with null if the payload was not found", async () => {
      proposalPayloadsStore.reset();

      vi.spyOn(api, "queryProposalPayload").mockImplementation(() => {
        throw new ProposalPayloadNotFoundError();
      });

      await loadProposalPayload({ proposalId: 0n });

      expect(get(proposalPayloadsStore).get(0n)).toBeNull();
    });

    it("should update proposalPayloadsStore with null if the payload was not found", async () => {
      proposalPayloadsStore.reset();

      vi.spyOn(api, "queryProposalPayload").mockImplementation(() => {
        throw new ProposalPayloadTooLargeError();
      });

      await loadProposalPayload({ proposalId: 0n });

      expect(get(proposalPayloadsStore).get(0n)).toEqual({
        error: "Payload too large",
      });
    });
  });
});
