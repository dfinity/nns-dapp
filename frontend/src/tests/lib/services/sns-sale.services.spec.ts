/**
 * @jest-environment jsdom
 */

import { snsProjectsStore } from "$lib/derived/sns/sns-projects.derived";
import {
  importInitSnsWrapper,
  importSnsWasmCanister,
} from "$lib/proxy/api.import.proxy";
import {
  getOpenTicket,
  initiateSnsSwapParticipation,
  newSaleTicket,
  participateInSnsSwap,
} from "$lib/services/sns-sale.services";
import { authStore } from "$lib/stores/auth.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import type { HttpAgent, Identity } from "@dfinity/agent";
import {
  ICPToken,
  LedgerCanister,
  TokenAmount,
  type SnsWasmCanisterOptions,
} from "@dfinity/nns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import mock from "jest-mock-extended/lib/Mock";
import { mockMainAccount } from "../../mocks/accounts.store.mock";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
  mockIdentityErrorMsg,
  mockPrincipal,
} from "../../mocks/auth.store.mock";
import {
  mockProjectSubscribe,
  mockQueryMetadataResponse,
  mockQueryTokenResponse,
  mockSnsFullProject,
  mockSnsToken,
  mockSwap,
} from "../../mocks/sns-projects.mock";
import { snsResponsesForLifecycle } from "../../mocks/sns-response.mock";
import {
  deployedSnsMock,
  governanceCanisterIdMock,
  ledgerCanisterIdMock,
  swapCanisterIdMock,
} from "../../mocks/sns.api.mock";
import { snsTicketMock } from "../../mocks/sns.mock";

jest.mock("$lib/proxy/api.import.proxy");
jest.mock("$lib/api/agent.api", () => {
  return {
    createAgent: () => Promise.resolve(mock<HttpAgent>()),
  };
});

const identity: Identity | undefined = mockIdentity;
const rootCanisterIdMock = identity.getPrincipal();

describe("sns-api", () => {
  const mockQuerySwap = {
    swap: [mockSwap],
    derived: [
      {
        sns_tokens_per_icp: 1,
        buyer_total_icp_e8s: BigInt(1_000_000_000),
      },
    ],
  };

  const notifyParticipationSpy = jest.fn().mockResolvedValue(undefined);
  const ledgerCanisterMock = mock<LedgerCanister>();
  const ticket = snsTicketMock({
    rootCanisterId: rootCanisterIdMock,
    owner: mockPrincipal,
  });
  const getOpenTicketSpy = jest.fn().mockResolvedValue(ticket.ticket);
  const newSaleTicketSpy = jest.fn().mockResolvedValue(ticket.ticket);

  beforeEach(() => {
    snsQueryStore.reset();

    jest.spyOn(snsProjectsStore, "subscribe").mockImplementation(
      mockProjectSubscribe([
        {
          ...mockSnsFullProject,
          rootCanisterId: ticket.rootCanisterId,
        },
      ])
    );

    const ledgerMock = mock<LedgerCanister>();
    ledgerMock.accountBalance.mockResolvedValue(BigInt(100_000_000));
    jest.spyOn(LedgerCanister, "create").mockReturnValue(ledgerMock);

    snsQueryStore.setData(
      snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Open, SnsSwapLifecycle.Committed],
      })
    );

    const fee = mockSnsToken.fee;
    transactionsFeesStore.setFee({
      rootCanisterId: rootCanisterIdMock,
      fee,
      certified: true,
    });

    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation(() => ledgerCanisterMock);

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
        metadata: () =>
          Promise.resolve([mockQueryMetadataResponse, mockQueryTokenResponse]),
        swapState: () => Promise.resolve(mockQuerySwap),
        notifyParticipation: notifyParticipationSpy,
        getOpenTicket: getOpenTicketSpy,
        newSaleTicket: newSaleTicketSpy,
      })
    );

    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should getOpenTicket", async () => {
    const result = await getOpenTicket({
      rootCanisterId: ticket.rootCanisterId,
      certified: true,
    });

    expect(getOpenTicketSpy).toBeCalled();
    expect(result).toEqual(ticket);
  });

  it("should create newSaleTicket", async () => {
    const result = await newSaleTicket({
      rootCanisterId: ticket.rootCanisterId,
      amount_icp_e8s: 0n,
    });

    expect(newSaleTicketSpy).toBeCalled();
    expect(result).toEqual(ticket);
  });

  it("should initiate SnsSwapParticipation", async () => {
    const account = {
      ...mockMainAccount,
      balance: TokenAmount.fromE8s({
        amount: BigInt(1_000_000_000_000),
        token: ICPToken,
      }),
    };

    const result = await initiateSnsSwapParticipation({
      rootCanisterId: rootCanisterIdMock,
      amount: TokenAmount.fromNumber({
        amount: 1,
        token: ICPToken,
      }),
      account,
    });

    expect(newSaleTicketSpy).toBeCalled();
    expect(newSaleTicketSpy).toBeCalledWith(
      expect.objectContaining({
        amount_icp_e8s: 100000000n,
      })
    );
    expect(result).toEqual(ticket);
  });

  it("should participateInSnsSwap", async () => {
    const result = await participateInSnsSwap({
      ticket,
    });

    expect(notifyParticipationSpy).toBeCalled();
    expect(result).toEqual({ success: true });
  });
});
