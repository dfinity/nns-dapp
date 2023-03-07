/**
 * @jest-environment jsdom
 */

import {
  getOpenTicket,
  newSaleTicket,
  notifyParticipation,
  notifyPaymentFailure,
} from "$lib/api/sns-sale.api";
import {
  importInitSnsWrapper,
  importSnsWasmCanister,
} from "$lib/proxy/api.import.proxy";
import type { SnsWasmCanisterOptions } from "@dfinity/nns";
import { SnsSwapCanister } from "@dfinity/sns";
import { mock } from "jest-mock-extended";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import {
  deployedSnsMock,
  governanceCanisterIdMock,
  ledgerCanisterIdMock,
  rootCanisterIdMock,
  swapCanisterIdMock,
} from "$tests/mocks/sns.api.mock";
import { snsTicketMock } from "$tests/mocks/sns.mock";

jest.mock("$lib/proxy/api.import.proxy");

describe("sns-sale.api", () => {
  const ticket = snsTicketMock({
    rootCanisterId: rootCanisterIdMock,
    owner: mockPrincipal,
  });

  const getOpenTicketSpy = jest.fn().mockResolvedValue(ticket.ticket);
  const newSaleTicketSpy = jest.fn().mockResolvedValue(ticket.ticket);
  const notifyPaymentFailureSpy = jest.fn().mockResolvedValue(ticket.ticket);
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
      })
    );
  });

  it("should query open ticket", async () => {
    const snsSwapCanister = mock<SnsSwapCanister>();
    snsSwapCanister.getOpenTicket.mockResolvedValue(
      snsTicketMock({
        rootCanisterId: rootCanisterIdMock,
        owner: mockIdentity.getPrincipal(),
      }).ticket
    );
    jest
      .spyOn(SnsSwapCanister, "create")
      .mockImplementation((): SnsSwapCanister => snsSwapCanister);
    const result = await getOpenTicket({
      identity: mockIdentity,
      swapCanisterId: swapCanisterIdMock,
      certified: true,
    });

    expect(result).not.toBeNull();
    expect(result).toEqual(ticket.ticket);
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
    const result = await notifyParticipation({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      buyer: mockPrincipal,
    });

    expect(result).not.toBeNull();
    expect(result).toEqual(participationResponse);
  });
});
