import * as api from "$lib/api/proposals.api";
import {
  ProposalPayloadNotFoundError,
  ProposalPayloadTooLargeError,
} from "$lib/canisters/nns-dapp/nns-dapp.errors";
import { getCurrentIdentity } from "$lib/services/auth.services";
import {
  listNextProposals,
  listProposals,
  loadProposal,
  loadProposalPayload,
} from "$lib/services/public/proposals.services";
import {
  proposalPayloadsStore,
  proposalsFiltersStore,
  proposalsStore,
} from "$lib/stores/proposals.store";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockProposals } from "$tests/mocks/proposals.store.mock";
import { toastsStore } from "@dfinity/gix-components";
import type { ProposalInfo } from "@dfinity/nns";
import { get } from "svelte/store";

describe("proposals-services", () => {
  beforeEach(() => {
    toastsStore.reset();
    proposalsStore.setProposalsForTesting({ proposals: [], certified: true });
    proposalPayloadsStore.reset();
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockRestore();
  });

  describe("logged in user", () => {
    beforeEach(() => {
      resetIdentity();
    });

    describe("list", () => {
      let spyQueryProposals;

      beforeEach(() => {
        spyQueryProposals = vi
          .spyOn(api, "queryProposals")
          .mockResolvedValue(mockProposals);
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
        expect(get(proposalsStore)).toEqual({
          proposals: [],
          certified: true,
        });
        await listProposals({
          loadFinished: () => {
            // do nothing here
          },
        });
        expect(get(proposalsStore)).toEqual({
          proposals: mockProposals,
          certified: true,
        });
      });

      it("should push new proposals to the list", async () => {
        proposalsStore.setProposalsForTesting({
          proposals: [mockProposals[0]],
          certified: true,
        });
        spyQueryProposals.mockResolvedValue([mockProposals[1]]);

        expect(get(proposalsStore)).toEqual({
          proposals: [mockProposals[0]],
          certified: true,
        });
        await listNextProposals({
          beforeProposal: mockProposals[mockProposals.length - 1].id,
          loadFinished: () => {
            // do nothing here
          },
        });
        expect(get(proposalsStore)).toEqual({
          proposals: mockProposals,
          certified: true,
        });
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
        vi.spyOn(console, "error").mockReturnValue(undefined);
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

      it("show no error message from api on uncertified error", async () => {
        const errorMessage = "Error message from api.";
        vi.spyOn(api, "queryProposals").mockImplementation(
          async ({ certified }) => {
            if (!certified) {
              throw new Error(errorMessage);
            }
            return mockProposals;
          }
        );
        await listProposals({
          loadFinished: () => {
            // do nothing here
          },
        });

        expect(get(toastsStore)).toEqual([]);
      });
    });

    describe("load", () => {
      const spyQueryProposal = vi.spyOn(api, "queryProposal");

      beforeEach(() => {
        spyQueryProposal.mockResolvedValue({ ...mockProposals[0], id: 666n });
        proposalsStore.setProposalsForTesting({
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
      let spyQueryProposal;

      beforeEach(() => {
        spyQueryProposal = vi
          .spyOn(api, "queryProposal")
          .mockRejectedValue(new Error("test-message"));
        vi.spyOn(console, "error").mockReturnValue();
      });

      it("should show one error message in details", async () => {
        const setProposalSpy = vi.fn();
        expect(get(toastsStore)).toEqual([]);

        await loadProposal({
          proposalId: 0n,
          setProposal: setProposalSpy,
        });
        expect(get(toastsStore)).toMatchObject([
          {
            level: "error",
            text: 'An error occurred while loading the proposal. id: "0". test-message',
          },
        ]);

        // `queryProposal` gave an error twice (query + update) but it should
        // result only in a single toast message.
        expect(spyQueryProposal).toBeCalledTimes(2);
        expect(setProposalSpy).not.toBeCalled();
      });
    });

    describe("empty list", () => {
      beforeEach(() => {
        vi.spyOn(api, "queryProposals").mockResolvedValue([]);
      });

      it("should not push empty proposals to the list", async () => {
        proposalsStore.setProposalsForTesting({
          proposals: mockProposals,
          certified: true,
        });
        expect(get(proposalsStore)).toEqual({
          proposals: mockProposals,
          certified: true,
        });
        await listNextProposals({
          beforeProposal: mockProposals[mockProposals.length - 1].id,
          loadFinished: () => {
            // do nothing here
          },
        });
        expect(get(proposalsStore)).toEqual({
          proposals: mockProposals,
          certified: true,
        });
      });

      it("should call callback with pagination over", async () => {
        const spyCallback = vi.fn();

        await listNextProposals({
          beforeProposal: mockProposals[mockProposals.length - 1].id,
          loadFinished: spyCallback,
        });

        expect(spyCallback).toHaveBeenCalledTimes(2);
        expect(spyCallback).toHaveBeenCalledWith({
          paginationOver: true,
          certified: true,
        });
        expect(spyCallback).toHaveBeenCalledWith({
          paginationOver: true,
          certified: false,
        });
      });
    });
  });

  describe("no identity", () => {
    beforeEach(() => {
      vi.spyOn(console, "error").mockReturnValue();
      setNoIdentity();
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
        .mockResolvedValue({ ...mockProposals[0], id: 666n });
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
      setNoIdentity();
      spyQueryProposals = vi
        .spyOn(api, "queryProposals")
        .mockResolvedValue(mockProposals);
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
    const mockProposalPayload = { data: "test" };

    beforeEach(() => {
      vi.spyOn(console, "error").mockReturnValue();
      spyQueryProposalPayload.mockResolvedValue(mockProposalPayload);
    });

    it("should call queryProposalPayload", async () => {
      expect(spyQueryProposalPayload).not.toBeCalled();
      await loadProposalPayload({ proposalId: 0n });
      expect(spyQueryProposalPayload).toBeCalledTimes(1);
    });

    it("should update proposalPayloadsStore", async () => {
      expect(get(proposalPayloadsStore)).toEqual(new Map());
      await loadProposalPayload({ proposalId: 0n });

      expect(get(proposalPayloadsStore)).toEqual(
        new Map([[0n, mockProposalPayload]])
      );
    });

    it("should update proposalPayloadsStore with null if the payload was not found", async () => {
      proposalPayloadsStore.reset();

      vi.spyOn(api, "queryProposalPayload").mockRejectedValue(
        new ProposalPayloadNotFoundError()
      );

      await loadProposalPayload({ proposalId: 0n });

      expect(get(proposalPayloadsStore).get(0n)).toBeNull();
    });

    it("should update proposalPayloadsStore with null if the payload was not found", async () => {
      proposalPayloadsStore.reset();

      vi.spyOn(api, "queryProposalPayload").mockRejectedValue(
        new ProposalPayloadTooLargeError()
      );

      await loadProposalPayload({ proposalId: 0n });

      expect(get(proposalPayloadsStore).get(0n)).toEqual({
        error: "Payload too large",
      });
    });
  });
});
