/**
 * @jest-environment jsdom
 */

import { getOpenTicket, newSaleTicket } from "$lib/api/sns-sale.api";
import {
  importInitSnsWrapper,
  importSnsWasmCanister,
} from "$lib/proxy/api.import.proxy";
import type { SnsWasmCanisterOptions } from "@dfinity/nns";
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
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should query open ticket", async () => {
    const response = await getOpenTicket({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      certified: true,
    });

    expect(response).not.toBeNull();
    expect(response).toEqual(ticket);
  });

  it("should create new sale ticket", async () => {
    const response = await newSaleTicket({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      amount_icp_e8s: 123n,
    });

    expect(response).not.toBeNull();
    expect(response).toEqual(ticket);
  });
});
