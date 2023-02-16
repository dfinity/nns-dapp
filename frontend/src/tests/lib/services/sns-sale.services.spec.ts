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
import * as toastsStore from "$lib/stores/toasts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import type { HttpAgent, Identity } from "@dfinity/agent";
import {
  ICPToken,
  LedgerCanister,
  TokenAmount,
  type SnsWasmCanisterOptions,
} from "@dfinity/nns";
import {
  GetOpenTicketErrorType,
  NewSaleTicketResponseErrorType,
  SnsSwapGetOpenTicketError,
  SnsSwapLifecycle,
  SnsSwapNewTicketError,
} from "@dfinity/sns";
import mock from "jest-mock-extended/lib/Mock";
import { nanoSecondsToDateTime } from "../../../lib/utils/date.utils";
import { formatToken } from "../../../lib/utils/token.utils";
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
import * as projectsUtils from "$lib/utils/projects.utils";



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
  const testTicket = snsTicketMock({
    rootCanisterId: rootCanisterIdMock,
    owner: mockPrincipal,
  });
  const spyOnGetOpenTicketApi = jest.fn();
  const spyOnNewSaleTicketApi = jest.fn();
  // const spyOnValidParticipation = jest.spyOn(projectsUtils, "validParticipation");

  beforeEach(() => {
    spyOnToastsShow.mockClear();
    spyOnToastsError.mockClear();
    jest.clearAllMocks();

    spyOnGetOpenTicketApi.mockResolvedValue(testTicket.ticket);
    spyOnNewSaleTicketApi.mockResolvedValue(testTicket.ticket);
    jest.spyOn(console, "error").mockReturnValue();
    snsQueryStore.reset();

    jest.spyOn(snsProjectsStore, "subscribe").mockImplementation(
      mockProjectSubscribe([
        {
          ...mockSnsFullProject,
          rootCanisterId: testTicket.rootCanisterId,
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
        getOpenTicket: spyOnGetOpenTicketApi,
        newSaleTicket: spyOnNewSaleTicketApi,
      })
    );



    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  describe("getOpenTicket", () => {
    it("should return a ticket", async () => {
      const result = await getOpenTicket({
        rootCanisterId: testTicket.rootCanisterId,
        certified: true,
      });

      expect(spyOnGetOpenTicketApi).toBeCalled();
      expect(result).toEqual(testTicket);
    });

    it("should display already closed error", async () => {
      spyOnGetOpenTicketApi.mockRejectedValue(
        new SnsSwapGetOpenTicketError(GetOpenTicketErrorType.TYPE_SALE_CLOSED)
      );

      const result = await getOpenTicket({
        rootCanisterId: testTicket.rootCanisterId,
        certified: true,
      });

      expect(result).toBeUndefined();
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_closed",
        })
      );
    });

    it("should display unexpected error on not_closed error", async () => {
      spyOnGetOpenTicketApi.mockRejectedValue(
        new SnsSwapGetOpenTicketError(GetOpenTicketErrorType.TYPE_UNSPECIFIED)
      );

      spyOnGetOpenTicketApi.mockRejectedValue({
        errorType: GetOpenTicketErrorType.TYPE_SALE_NOT_OPEN,
      });

      const result = await getOpenTicket({
        rootCanisterId: testTicket.rootCanisterId,
        certified: true,
      });

      expect(result).toBeUndefined();
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_unexpected_error",
        })
      );
    });
  });

  describe("newSaleTicket", () => {
    it("should create newSaleTicket", async () => {
      const result = await newSaleTicket({
        rootCanisterId: testTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(result).toEqual(testTicket);
    });

    it("should display sale-closed error", async () => {
      spyOnNewSaleTicketApi.mockRejectedValue(
        new SnsSwapNewTicketError({
          errorType: NewSaleTicketResponseErrorType.TYPE_SALE_CLOSED,
        })
      );

      const result = await newSaleTicket({
        rootCanisterId: testTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_closed",
        })
      );
      expect(result).toBeUndefined();
    });

    it("should reuse the ticket from the ticket-exist error", async () => {
      spyOnNewSaleTicketApi.mockRejectedValue(
        new SnsSwapNewTicketError({
          errorType: NewSaleTicketResponseErrorType.TYPE_TICKET_EXISTS,
          existingTicket: testTicket.ticket,
        })
      );

      const result = await newSaleTicket({
        rootCanisterId: testTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(spyOnToastsShow).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_proceed_with_existing_ticket",
          substitutions: {
            $time: nanoSecondsToDateTime(testTicket.ticket.creation_time),
          },
        })
      );
      expect(result).toEqual(testTicket);
    });

    it("should display invalid user amount error", async () => {
      const min_amount_icp_e8s_included = 123n;
      const max_amount_icp_e8s_included = 321n;
      spyOnNewSaleTicketApi.mockRejectedValue(
        new SnsSwapNewTicketError({
          errorType: NewSaleTicketResponseErrorType.TYPE_INVALID_USER_AMOUNT,
          invalidUserAmount: {
            min_amount_icp_e8s_included,
            max_amount_icp_e8s_included,
          },
        })
      );

      const result = await newSaleTicket({
        rootCanisterId: testTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_invalid_amount",
          substitutions: {
            $min: formatToken({ value: min_amount_icp_e8s_included }),
            $max: formatToken({ value: max_amount_icp_e8s_included }),
          },
        })
      );
      expect(result).toBeUndefined();
    });

    it("should display invalid sub-account error", async () => {
      spyOnNewSaleTicketApi.mockRejectedValue(
        new SnsSwapNewTicketError({
          errorType: NewSaleTicketResponseErrorType.TYPE_INVALID_SUBACCOUNT,
        })
      );

      const result = await newSaleTicket({
        rootCanisterId: testTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_invalid_subaccount",
        })
      );
      expect(result).toBeUndefined();
    });

    it("should display retry later error", async () => {
      spyOnNewSaleTicketApi.mockRejectedValue(
        new SnsSwapNewTicketError({
          errorType: NewSaleTicketResponseErrorType.TYPE_UNSPECIFIED,
        })
      );

      const result = await newSaleTicket({
        rootCanisterId: testTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_try_later",
        })
      );
      expect(result).toBeUndefined();
    });

    it("should display unknown error for all other error types", async () => {
      spyOnNewSaleTicketApi.mockRejectedValue(
        new SnsSwapNewTicketError({
          errorType: "dummy type" as unknown as NewSaleTicketResponseErrorType,
        })
      );

      const result = await newSaleTicket({
        rootCanisterId: testTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_unexpected_error",
        })
      );
      expect(result).toBeUndefined();
    });
  });

  describe("initiateSnsSwapParticipation", () => {
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

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(spyOnNewSaleTicketApi).toBeCalledWith(
        expect.objectContaining({
          amount_icp_e8s: 100000000n,
        })
      );
      expect(result).toEqual(testTicket);
    });

    it("should handle errors", async () => {
      // remove the sns-project
      jest.spyOn(snsProjectsStore, "subscribe").mockImplementation(
        mockProjectSubscribe([
        ])
      );

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

      expect(spyOnNewSaleTicketApi).not.toBeCalled();
      expect(spyOnToastsError).toBeCalled();
      expect(result).toBeUndefined();
    });
  });

  it("should participateInSnsSwap", async () => {
    const result = await participateInSnsSwap({
      ticket: testTicket,
    });

    expect(spyOnNotifyParticipation).toBeCalled();
    expect(result).toEqual({ success: true, retry: false });
  });
});
