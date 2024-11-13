import * as agent from "$lib/api/agent.api";
import {
  getOpenTicket,
  newSaleTicket,
  notifyParticipation,
  notifyPaymentFailure,
  queryFinalizationStatus,
} from "$lib/api/sns-sale.api";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  governanceCanisterIdMock,
  ledgerCanisterIdMock,
  rootCanisterIdMock,
  swapCanisterIdMock,
} from "$tests/mocks/sns.api.mock";
import { snsTicketMock } from "$tests/mocks/sns.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import type { SnsWrapper } from "@dfinity/sns";
import * as dfinitySns from "@dfinity/sns";
import {
  SnsSwapCanister,
  UnsupportedMethodError,
  type SnsGetAutoFinalizationStatusResponse,
} from "@dfinity/sns";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/proxy/api.import.proxy");

describe("sns-sale.api", () => {
  const ticket = snsTicketMock({
    rootCanisterId: rootCanisterIdMock,
    owner: mockPrincipal,
  });

  const getOpenTicketSpy = vi.fn();
  const newSaleTicketSpy = vi.fn();
  const notifyPaymentFailureSpy = vi.fn();
  const finalizationStatusSpy = vi.fn();
  const participationResponse = {
    icp_accepted_participation_e8s: 666n,
  };
  const notifyParticipationSpy = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();

    getOpenTicketSpy.mockResolvedValue(ticket.ticket);
    newSaleTicketSpy.mockResolvedValue(ticket.ticket);
    notifyPaymentFailureSpy.mockResolvedValue(ticket.ticket);
    notifyParticipationSpy.mockResolvedValue(participationResponse);

    const canisterIds = {
      rootCanisterId: rootCanisterIdMock,
      ledgerCanisterId: ledgerCanisterIdMock,
      governanceCanisterId: governanceCanisterIdMock,
      swapCanisterId: swapCanisterIdMock,
    };

    setSnsProjects([canisterIds]);

    vi.spyOn(dfinitySns, "SnsWrapper").mockReturnValue({
      canisterIds,
      getOpenTicket: getOpenTicketSpy,
      newSaleTicket: newSaleTicketSpy,
      notifyPaymentFailure: notifyPaymentFailureSpy,
      notifyParticipation: notifyParticipationSpy,
      getFinalizationStatus: finalizationStatusSpy,
    } as unknown as SnsWrapper);

    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  it("should query open ticket", async () => {
    const apiTicket = snsTicketMock({
      rootCanisterId: principal(1),
      owner: principal(2),
    }).ticket;
    const snsSwapCanister = mock<SnsSwapCanister>();
    snsSwapCanister.getOpenTicket.mockResolvedValue(apiTicket);
    vi.spyOn(SnsSwapCanister, "create").mockImplementation(
      (): SnsSwapCanister => snsSwapCanister
    );
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
    it("should return the finalization status", async () => {
      const response: SnsGetAutoFinalizationStatusResponse = {
        auto_finalize_swap_response: [],
        has_auto_finalize_been_attempted: [false],
        is_auto_finalize_enabled: [false],
      };
      finalizationStatusSpy.mockResolvedValue(response);

      expect(finalizationStatusSpy).toBeCalledTimes(0);
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
      finalizationStatusSpy.mockRejectedValue(
        new UnsupportedMethodError("get_auto_finalization_status")
      );

      expect(finalizationStatusSpy).toBeCalledTimes(0);
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

      expect(finalizationStatusSpy).toBeCalledTimes(0);
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
