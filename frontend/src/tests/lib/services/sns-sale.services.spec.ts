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
import {GetOpenTicketErrorType, SnsSwapGetOpenTicketError, SnsSwapLifecycle} from "@dfinity/sns";
import mock from "jest-mock-extended/lib/Mock";
import { mockMainAccount } from "../../mocks/accounts.store.mock";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
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
import * as toastsStore from "$lib/stores/toasts.store";

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

  const spyOnNotifyParticipation = jest.fn().mockResolvedValue(undefined);
  const spyOnToastsShow = jest.spyOn(toastsStore, "toastsShow");
  const spyOnToastsError = jest.spyOn(toastsStore, "toastsError");
  const ledgerCanisterMock = mock<LedgerCanister>();
  const ticket = snsTicketMock({
    rootCanisterId: rootCanisterIdMock,
    owner: mockPrincipal,
  });
  const getOpenTicketSpy = jest.fn().mockResolvedValue(ticket.ticket);
  const newSaleTicketSpy = jest.fn().mockResolvedValue(ticket.ticket);

  beforeEach(() => {
    spyOnToastsShow.mockClear();
    spyOnToastsError.mockClear();
    jest.clearAllMocks();

    jest.spyOn(console, "error").mockReturnValue();
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
        notifyParticipation: spyOnNotifyParticipation,
        getOpenTicket: getOpenTicketSpy,
        newSaleTicket: newSaleTicketSpy,
      })
    );

    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  describe('getOpenTicket', () => {
    it("should return a ticket", async () => {
      const result = await getOpenTicket({
        rootCanisterId: ticket.rootCanisterId,
        certified: true,
      });

      expect(getOpenTicketSpy).toBeCalled();
      expect(result).toEqual(ticket);
    });

    it("should display already closed error", async () => {
      getOpenTicketSpy.mockRejectedValue(new SnsSwapGetOpenTicketError(GetOpenTicketErrorType.TYPE_SALE_CLOSED));

      const result = await getOpenTicket({
        rootCanisterId: ticket.rootCanisterId,
        certified: true,
      });

      expect(result).toBeUndefined();
      expect(spyOnToastsError).toBeCalledWith(expect.objectContaining({
        labelKey: "error__sns.sns_sale_closed"
      }))
    });

    it("should display unexpected error on not_closed error", async () => {
      getOpenTicketSpy.mockRejectedValue(new SnsSwapGetOpenTicketError(GetOpenTicketErrorType.TYPE_UNSPECIFIED));

      getOpenTicketSpy.mockRejectedValue({
        errorType: GetOpenTicketErrorType.TYPE_SALE_NOT_OPEN,
      });

      const result = await getOpenTicket({
        rootCanisterId: ticket.rootCanisterId,
        certified: true,
      });

      expect(result).toBeUndefined();
      expect(spyOnToastsError).toBeCalledWith(expect.objectContaining({
        labelKey: "error__sns.sns_sale_unexpected_error"
      }))
    });
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

    expect(spyOnNotifyParticipation).toBeCalled();
    expect(result).toEqual({ success: true, retry: false });
  });
});
