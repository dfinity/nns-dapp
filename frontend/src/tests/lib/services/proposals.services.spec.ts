/**
 * @jest-environment jsdom
 */

import type { ProposalInfo } from "@dfinity/nns";
import { get } from "svelte/store";
import * as api from "../../../lib/api/proposals.api";
import {
  ProposalPayloadNotFoundError,
  ProposalPayloadTooLargeError,
} from "../../../lib/canisters/nns-dapp/nns-dapp.errors";
import { DEFAULT_PROPOSALS_FILTERS } from "../../../lib/constants/proposals.constants";
import {
  listNextProposals,
  listProposals,
  loadProposal,
  loadProposalPayload,
  routePathProposalId,
} from "../../../lib/services/proposals.services";
import {
  proposalPayloadsStore,
  proposalsFiltersStore,
  proposalsStore,
} from "../../../lib/stores/proposals.store";
import { toastsStore } from "../../../lib/stores/toasts.store";
import type { ToastMsg } from "../../../lib/types/toast";
import {
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "../../mocks/auth.store.mock";
import { mockProposalInfo } from "../../mocks/proposal.mock";
import { mockProposals } from "../../mocks/proposals.store.mock";

describe("proposals-services", () => {
  const firstErrorMessage = () => {
    const messages = get(toastsStore);
    const error = messages.find(({ level }) => level === "error");

    return error as ToastMsg;
  };

  describe("list", () => {
    const spySetProposals = jest.spyOn(proposalsStore, "setProposals");
    const spyPushProposals = jest.spyOn(proposalsStore, "pushProposals");
    let spyQueryProposals;

    beforeAll(() => {
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

    it("should call the canister to list proposals", async () => {
      await listProposals();

      expect(spyQueryProposals).toHaveBeenCalled();

      const { proposals } = get(proposalsStore);
      expect(proposals).toEqual(mockProposals);
    });

    it("should call the canister to list the next proposals", async () => {
      await listNextProposals({
        beforeProposal: mockProposals[mockProposals.length - 1].id,
      });

      expect(spyQueryProposals).toHaveBeenCalled();

      const { proposals } = get(proposalsStore);
      expect(proposals).toEqual(mockProposals);
    });

    it("should not clear the list proposals before query", async () => {
      await listProposals();
      expect(spySetProposals).toHaveBeenCalledTimes(2);
    });

    it("should push new proposals to the list", async () => {
      await listNextProposals({
        beforeProposal: mockProposals[mockProposals.length - 1].id,
      });
      expect(spyPushProposals).toHaveBeenCalledTimes(2);
    });
  });

  describe("load", () => {
    const spyQueryProposal = jest
      .spyOn(api, "queryProposal")
      .mockImplementation(() =>
        Promise.resolve({ ...mockProposals[0], id: BigInt(666) })
      );

    beforeAll(() =>
      proposalsStore.setProposals({ proposals: mockProposals, certified: true })
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
      const spyToastError = jest.spyOn(toastsStore, "show");

      await loadProposal({
        proposalId: BigInt(0),
        setProposal: jest.fn,
      });
      expect(spyToastError).toBeCalled();
      expect(spyToastError).toBeCalledWith({
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
      });
      expect(spy).toHaveBeenCalledTimes(0);
      spy.mockClear();
    });
  });

  describe("details", () => {
    beforeAll(() => {
      // Avoid to print errors during test
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });
    afterAll(() => jest.clearAllMocks());
    it("should get proposalId from valid path", () => {
      let result = routePathProposalId("/#/proposal/123");
      expect(result?.proposalId).toEqual(BigInt(123));
      result = routePathProposalId("/#/proposal/0");
      expect(result?.proposalId).toEqual(BigInt(0));
    });

    it("should not get proposalId from invalid path", () => {
      expect(routePathProposalId("/#/proposal/")).toBeUndefined();
      expect(routePathProposalId("/#/proposal/1.5")).toBeUndefined();
      expect(routePathProposalId("/#/proposal/123n")).toBeUndefined();
    });
  });

  describe("errors", () => {
    const proposalId = BigInt(0);
    const proposalInfo: ProposalInfo = { ...mockProposalInfo, id: proposalId };

    beforeAll(() => {
      jest.clearAllMocks();
      jest.spyOn(console, "error").mockImplementation(jest.fn);
      setNoIdentity();
    });

    afterAll(() => {
      jest.clearAllMocks();

      resetIdentity();
    });

    it("should not list proposals if no identity", async () => {
      const call = async () => await listProposals();

      await expect(call).rejects.toThrow(Error(mockIdentityErrorMsg));
    });

    it("should not list next proposals if no identity", async () => {
      const call = async () =>
        await listNextProposals({
          beforeProposal: mockProposals[mockProposals.length - 1].id,
        });

      await expect(call).rejects.toThrow(Error(mockIdentityErrorMsg));
    });

    it("should not load proposal if no identity", (done) => {
      loadProposal({
        proposalId: mockProposals[0].id as bigint,
        setProposal: jest.fn(),
        handleError: () => done(),
      });
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

    it("should not call the canister if empty filter", async () => {
      proposalsFiltersStore.filterStatus([]);

      await listProposals();

      expect(spyQueryProposals).not.toHaveBeenCalled();

      proposalsFiltersStore.filterStatus(DEFAULT_PROPOSALS_FILTERS.status);
    });

    it("should reset the proposal store if empty filter", async () => {
      proposalsFiltersStore.filterStatus([]);

      await listProposals();

      const { proposals } = get(proposalsStore);
      expect(proposals).toEqual([]);

      proposalsFiltersStore.filterStatus(DEFAULT_PROPOSALS_FILTERS.status);
    });
  });

  describe("getProposalPayload", () => {
    const spyQueryProposalPayload = jest
      .spyOn(api, "queryProposalPayload")
      .mockImplementation(() => Promise.resolve({ data: "test" }));

    afterEach(() => jest.clearAllMocks());

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
