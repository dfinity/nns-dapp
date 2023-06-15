/**
 * @jest-environment jsdom
 */

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
} from "$lib/services/$public/proposals.services";
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
  resetIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockProposals } from "$tests/mocks/proposals.store.mock";
import type { ProposalInfo } from "@dfinity/nns";
import { get } from "svelte/store";

describe("proposals-services", () => {
  describe("logged in user", () => {
    describe("list", () => {
      const spySetProposals = jest.spyOn(proposalsStore, "setProposals");
      const spyPushProposals = jest.spyOn(proposalsStore, "pushProposals");
      let spyQueryProposals;

      beforeAll(() => {
        spyQueryProposals = jest
          .spyOn(api, "queryProposals")
          .mockImplementation(() => Promise.resolve(mockProposals));
        jest
          .spyOn(authStore, "subscribe")
          .mockImplementation(mockAuthStoreSubscribe);
      });

      afterEach(() => {
        proposalsStore.setProposals({ proposals: [], certified: true });

        spySetProposals.mockClear();
        spyPushProposals.mockClear();
      });

      afterAll(() => jest.clearAllMocks());

      it("should call the canister to list proposals", async () => {
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
        await listProposals({
          loadFinished: () => {
            // do nothing here
          },
        });
        expect(spySetProposals).toHaveBeenCalledTimes(2);
      });

      it("should push new proposals to the list", async () => {
        await listNextProposals({
          beforeProposal: mockProposals[mockProposals.length - 1].id,
          loadFinished: () => {
            // do nothing here
          },
        });
        expect(spyPushProposals).toHaveBeenCalledTimes(2);
      });

      it("should call callback when load finished", async () => {
        const spy = jest.fn();

        await listNextProposals({
          beforeProposal: mockProposals[mockProposals.length - 1].id,
          loadFinished: spy,
        });
        expect(spy).toHaveBeenCalledTimes(2);
      });
    });

    describe("load", () => {
      const spyQueryProposal = jest
        .spyOn(api, "queryProposal")
        .mockImplementation(() =>
          Promise.resolve({ ...mockProposals[0], id: BigInt(666) })
        );

      beforeAll(() =>
        proposalsStore.setProposals({
          proposals: mockProposals,
          certified: true,
        })
      );

      afterEach(() => jest.clearAllMocks());

      it("should call the canister to get proposalInfo", async () => {
        let result;
        await loadProposal({
          proposalId: BigInt(666),
          setProposal: (proposal: ProposalInfo) => (result = proposal),
        });
        expect(result?.id).toBe(BigInt(666));
        expect(spyQueryProposal).toBeCalledTimes(2);
      });
    });

    describe("error message in details", () => {
      beforeEach(() => {
        jest.spyOn(api, "queryProposal").mockImplementation(() => {
          throw new Error("test-message");
        });
        jest.spyOn(console, "error").mockImplementation(jest.fn);
      });
      afterEach(() => jest.clearAllMocks());

      it("should show error message in details", async () => {
        const toastsShow = jest.spyOn(toastsFunctions, "toastsShow");

        await loadProposal({
          proposalId: BigInt(0),
          setProposal: jest.fn,
        });
        expect(toastsShow).toBeCalled();
        expect(toastsShow).toBeCalledWith({
          detail: 'id: "0". test-message',
          labelKey: "error.proposal_not_found",
          level: "error",
        });
      });
    });

    describe("empty list", () => {
      afterAll(() =>
        proposalsStore.setProposals({ proposals: [], certified: true })
      );

      it("should not push empty proposals to the list", async () => {
        jest
          .spyOn(api, "queryProposals")
          .mockImplementation(() => Promise.resolve([]));

        const spy = jest.spyOn(proposalsStore, "pushProposals");
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
        jest
          .spyOn(api, "queryProposals")
          .mockImplementation(() => Promise.resolve([]));

        const spyCallback = jest.fn();

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
      resetIdentity();
      jest.clearAllMocks();
      jest.spyOn(console, "error").mockImplementation(jest.fn);
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreNoIdentitySubscribe);
    });

    it("should use anonymous identity", () => {
      expect(getCurrentIdentity().getPrincipal().isAnonymous()).toEqual(true);
    });

    it("should list proposals if no identity", async () => {
      const call = async () =>
        await listProposals({
          loadFinished: () => {
            // do nothing here
          },
        });

      await expect(call).resolves;
    });

    it("should list next proposals if no identity", async () => {
      const call = async () =>
        await listNextProposals({
          beforeProposal: mockProposals[mockProposals.length - 1].id,
          loadFinished: () => {
            // do nothing here
          },
        });

      await expect(call).resolves;
    });

    it("should load proposal if no identity", async () => {
      const spyQueryProposal = jest
        .spyOn(api, "queryProposal")
        .mockImplementation(() =>
          Promise.resolve({ ...mockProposals[0], id: BigInt(666) })
        );

      let result;
      await loadProposal({
        proposalId: BigInt(666),
        setProposal: (proposal: ProposalInfo) => (result = proposal),
      });
      expect(result?.id).toBe(BigInt(666));
      expect(spyQueryProposal).toBeCalledTimes(1);
    });
  });

  describe("filter", () => {
    const spySetProposals = jest.spyOn(proposalsStore, "setProposals");
    const spyPushProposals = jest.spyOn(proposalsStore, "pushProposals");
    let spyQueryProposals;

    beforeAll(() => {
      jest.clearAllMocks();

      spyQueryProposals = jest
        .spyOn(api, "queryProposals")
        .mockImplementation(() => Promise.resolve(mockProposals));
    });

    afterEach(() => {
      proposalsStore.setProposals({ proposals: [], certified: true });

      spySetProposals.mockClear();
      spyPushProposals.mockClear();
    });

    afterAll(() => jest.clearAllMocks());

    it("should load proposals if filters are empty", async () => {
      proposalsFiltersStore.filterStatus([]);
      proposalsFiltersStore.filterRewards([]);
      proposalsFiltersStore.filterTopics([]);

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
    const spyQueryProposalPayload = jest
      .spyOn(api, "queryProposalPayload")
      .mockImplementation(() => Promise.resolve({ data: "test" }));

    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(console, "error").mockImplementation(jest.fn);
    });

    it("should call queryProposalPayload", async () => {
      await loadProposalPayload({ proposalId: BigInt(0) });
      expect(spyQueryProposalPayload).toBeCalledTimes(1);
    });

    it("should update proposalPayloadsStore", async () => {
      const spyOnSetPayload = jest.spyOn(proposalPayloadsStore, "setPayload");
      await loadProposalPayload({ proposalId: BigInt(0) });

      expect(spyOnSetPayload).toBeCalledTimes(2);
      expect(spyOnSetPayload).toHaveBeenLastCalledWith({
        payload: { data: "test" },
        proposalId: BigInt(0),
      });
    });

    it("should update proposalPayloadsStore with null if the payload was not found", async () => {
      proposalPayloadsStore.reset();

      jest.spyOn(api, "queryProposalPayload").mockImplementation(() => {
        throw new ProposalPayloadNotFoundError();
      });

      await loadProposalPayload({ proposalId: BigInt(0) });

      expect(get(proposalPayloadsStore).get(BigInt(0))).toBeNull();
    });

    it("should update proposalPayloadsStore with null if the payload was not found", async () => {
      proposalPayloadsStore.reset();

      jest.spyOn(api, "queryProposalPayload").mockImplementation(() => {
        throw new ProposalPayloadTooLargeError();
      });

      await loadProposalPayload({ proposalId: BigInt(0) });

      expect(get(proposalPayloadsStore).get(BigInt(0))).toEqual({
        error: "Payload too large",
      });
    });
  });
});
