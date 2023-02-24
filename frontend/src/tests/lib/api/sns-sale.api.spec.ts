/**
 * @jest-environment jsdom
 */

import {
  getOpenTicket,
  newSaleTicket,
  notifyParticipation,
} from "$lib/api/sns-sale.api";
import {
  importInitSnsWrapper,
  importSnsWasmCanister,
} from "$lib/proxy/api.import.proxy";
import type { SnsWasmCanisterOptions } from "@dfinity/nns";
import { notifyPaymentFailure } from "../../../lib/api/sns-sale.api";
import { mockIdentity, mockPrincipal } from "../../mocks/auth.store.mock";
import {
  deployedSnsMock,
  governanceCanisterIdMock,
  ledgerCanisterIdMock,
  rootCanisterIdMock,
  swapCanisterIdMock,
} from "../../mocks/sns.api.mock";
import { snsTicketMock } from "../../mocks/sns.mock";

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

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should query open ticket", async () => {
    const result = await getOpenTicket({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
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
