/**
 * @jest-environment jsdom
 */

import * as agent from "$lib/api/agent.api";
import {
  getOpenTicket,
  newSaleTicket,
  notifyParticipation,
  notifyPaymentFailure,
  queryFinalizationStatus,
} from "$lib/api/sns-sale.api";
import {
  importInitSnsWrapper,
  importSnsWasmCanister,
} from "$lib/proxy/api.import.proxy";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  deployedSnsMock,
  governanceCanisterIdMock,
  ledgerCanisterIdMock,
  rootCanisterIdMock,
  swapCanisterIdMock,
} from "$tests/mocks/sns.api.mock";
import { snsTicketMock } from "$tests/mocks/sns.mock";
import type { HttpAgent } from "@dfinity/agent";
import type { SnsWasmCanisterOptions } from "@dfinity/nns";
import {
  SnsSwapCanister,
  type SnsGetAutoFinalizationStatusResponse,
} from "@dfinity/sns";
import { mock } from "jest-mock-extended";

jest.mock("$lib/proxy/api.import.proxy");

describe("sns-sale.api", () => {
  const ticket = snsTicketMock({
    rootCanisterId: rootCanisterIdMock,
    owner: mockPrincipal,
  });

  const getOpenTicketSpy = jest.fn().mockResolvedValue(ticket.ticket);
  const newSaleTicketSpy = jest.fn().mockResolvedValue(ticket.ticket);
  const notifyPaymentFailureSpy = jest.fn().mockResolvedValue(ticket.ticket);
  const finalizationStatusSpy = jest.fn();
  const participationResponse = {
    icp_accepted_participation_e8s: 666n,
  };
  const notifyParticipationSpy = jest
    .fn()
    .mockResolvedValue(participationResponse);

  beforeEach(() => {
    jest.clearAllMocks();
    (importSnsWasmCanister as jest.Mock).mockResolvedValue({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      create: (options: SnsWasmCanisterOptions) => ({
        listSnses: () => Promise.resolve(deployedSnsMock),
      }),
    });

    (importInitSnsWrapper as jest.Mock).mockResolvedValue(() =>
      Promise.resolve({
        canisterIds: {
          rootCanisterId: rootCanisterIdMock,
          ledgerCanisterId: ledgerCanisterIdMock,
          governanceCanisterId: governanceCanisterIdMock,
          swapCanisterId: swapCanisterIdMock,
        },
        getOpenTicket: getOpenTicketSpy,
        newSaleTicket: newSaleTicketSpy,
        notifyPaymentFailure: notifyPaymentFailureSpy,
        notifyParticipation: notifyParticipationSpy,
        getFinalizationStatus: finalizationStatusSpy,
      })
    );
    jest.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  it("should query open ticket", async () => {
    const apiTicket = snsTicketMock({
      rootCanisterId: principal(1),
      owner: principal(2),
    }).ticket;
    const snsSwapCanister = mock<SnsSwapCanister>();
    snsSwapCanister.getOpenTicket.mockResolvedValue(apiTicket);
    jest
      .spyOn(SnsSwapCanister, "create")
      .mockImplementation((): SnsSwapCanister => snsSwapCanister);
    const result = await getOpenTicket({
      identity: mockIdentity,
      swapCanisterId: swapCanisterIdMock,
      certified: true,
    });

    expect(result).not.toBeNull();
    expect(result).toEqual(apiTicket);
  });

  it("should create new sale ticket", async () => {
    const result = await newSaleTicket({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      amount_icp_e8s: 123n,
    });

    expect(result).not.toBeNull();
    expect(result).toEqual(ticket.ticket);
  });

  it("should notify payment failure", async () => {
    const result = await notifyPaymentFailure({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
    });

    expect(result).not.toBeNull();
    expect(result).toEqual(ticket.ticket);
  });

  it("should notify participation", async () => {
    const confirmationText = "I really agree. Pinky swear!";

    const result = await notifyParticipation({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      buyer: mockPrincipal,
      confirmationText,
    });

    expect(result).not.toBeNull();
    expect(result).toEqual(participationResponse);
    expect(notifyParticipationSpy).toHaveBeenCalledWith({
      buyer: mockPrincipal.toText(),
      confirmation_text: [confirmationText],
    });
  });

  describe("queryFinalizationStatus", () => {
    beforeEach(() => {
      expect(finalizationStatusSpy).toBeCalledTimes(0);
    });

    it("should return the finalization status", async () => {
      const response: SnsGetAutoFinalizationStatusResponse = {
        auto_finalize_swap_response: [],
        has_auto_finalize_been_attempted: [false],
        is_auto_finalize_enabled: [false],
      };
      finalizationStatusSpy.mockResolvedValue(response);

      const result = await queryFinalizationStatus({
        identity: mockIdentity,
        rootCanisterId: rootCanisterIdMock,
        certified: false,
      });

      expect(result).toEqual(response);
      expect(finalizationStatusSpy).toBeCalledTimes(1);
      expect(finalizationStatusSpy).toBeCalledWith({});
    });

    it("should return undefined if method is not supported", async () => {
      const errorMessage = `Error message example: "Call was rejected:
       Request ID: 3a6ef904b35fd19721c95c3df2b0b00b8abefba7f0ad188f5c472809b772c914
       Reject code: 3
       Reject text: Canister 75ffu-oaaaa-aaaaa-aabbq-cai has no update method 'get_auto_finalization_status'"`;
      finalizationStatusSpy.mockRejectedValue(new Error(errorMessage));

      const result = await queryFinalizationStatus({
        identity: mockIdentity,
        rootCanisterId: rootCanisterIdMock,
        certified: false,
      });

      expect(result).toBeUndefined();
      expect(finalizationStatusSpy).toBeCalledTimes(1);
      expect(finalizationStatusSpy).toBeCalledWith({});
    });

    it("should raise error if api call fails", async () => {
      const errorMessage = `Any other message`;
      const error = new Error(errorMessage);
      finalizationStatusSpy.mockRejectedValue(error);

      const call = () =>
        queryFinalizationStatus({
          identity: mockIdentity,
          rootCanisterId: rootCanisterIdMock,
          certified: false,
        });

      await expect(call).rejects.toThrow(error);
      expect(finalizationStatusSpy).toBeCalledTimes(1);
      expect(finalizationStatusSpy).toBeCalledWith({});
    });
  });
});
