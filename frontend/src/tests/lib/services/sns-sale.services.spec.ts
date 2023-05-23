/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/ledger.api";
import { SALE_PARTICIPATION_RETRY_SECONDS } from "$lib/constants/sns.constants";
import { snsProjectsStore } from "$lib/derived/sns/sns-projects.derived";
import {
  importInitSnsWrapper,
  importSnsWasmCanister,
} from "$lib/proxy/api.import.proxy";
import {
  cancelPollGetOpenTicket,
  initiateSnsSaleParticipation,
  loadNewSaleTicket,
  loadOpenTicket,
  participateInSnsSale,
  restoreSnsSaleParticipation,
} from "$lib/services/sns-sale.services";
import { accountsStore } from "$lib/stores/accounts.store";
import { authStore } from "$lib/stores/auth.store";
import * as busyStore from "$lib/stores/busy.store";
import { snsTicketsStore } from "$lib/stores/sns-tickets.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import { nanoSecondsToDateTime } from "$lib/utils/date.utils";
import { formatToken } from "$lib/utils/token.utils";
import {
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/accounts.store.mock";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
  mockPrincipal,
} from "$tests/mocks/auth.store.mock";
import {
  createSummary,
  mockProjectSubscribe,
  mockQueryMetadataResponse,
  mockQueryTokenResponse,
  mockSnsFullProject,
  mockSnsToken,
  mockSwap,
} from "$tests/mocks/sns-projects.mock";
import {
  deployedSnsMock,
  governanceCanisterIdMock,
  ledgerCanisterIdMock,
  swapCanisterIdMock,
} from "$tests/mocks/sns.api.mock";
import { snsTicketMock } from "$tests/mocks/sns.mock";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import type { HttpAgent, Identity } from "@dfinity/agent";
import {
  ICPToken,
  InsufficientFundsError,
  TokenAmount,
  TransferError,
  TxCreatedInFutureError,
  TxDuplicateError,
  TxTooOldError,
  type SnsWasmCanisterOptions,
} from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import {
  GetOpenTicketErrorType,
  NewSaleTicketResponseErrorType,
  SnsSwapCanister,
  SnsSwapGetOpenTicketError,
  SnsSwapNewTicketError,
} from "@dfinity/sns";
import { arrayOfNumberToUint8Array, toNullable } from "@dfinity/utils";
import mock from "jest-mock-extended/lib/Mock";
import { get } from "svelte/store";

jest.mock("$lib/proxy/api.import.proxy");
jest.mock("$lib/api/agent.api", () => {
  return {
    createAgent: () => Promise.resolve(mock<HttpAgent>()),
  };
});

jest.mock("$lib/constants/sns.constants", () => ({
  SALE_PARTICIPATION_RETRY_SECONDS: 1,
}));

jest.mock("$lib/api/ledger.api");

const identity: Identity | undefined = mockIdentity;
const rootCanisterIdMock = identity.getPrincipal();

const setUpMockSnsProjectStore = ({
  rootCanisterId,
  confirmationText,
}: {
  rootCanisterId: Principal;
  confirmationText?: string | undefined;
}) => {
  jest.spyOn(snsProjectsStore, "subscribe").mockImplementation(
    mockProjectSubscribe([
      {
        ...mockSnsFullProject,
        summary: createSummary({
          confirmationText,
        }),
        rootCanisterId,
      },
    ])
  );
};

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

  const spyOnSendICP = jest.spyOn(ledgerApi, "sendICP");
  const newBalanceE8s = 100_000_000n;
  const spyOnQueryBalance = jest.spyOn(ledgerApi, "queryAccountBalance");
  const spyOnNotifyParticipation = jest.fn();
  const spyOnToastsShow = jest.spyOn(toastsStore, "toastsShow");
  const spyOnToastsSuccess = jest.spyOn(toastsStore, "toastsSuccess");
  const spyOnToastsError = jest.spyOn(toastsStore, "toastsError");
  const spyOnToastsHide = jest.spyOn(toastsStore, "toastsHide");
  const testRootCanisterId = rootCanisterIdMock;
  const swapCanisterId = swapCanisterIdMock;
  const testSnsTicket = snsTicketMock({
    rootCanisterId: testRootCanisterId,
    owner: mockPrincipal,
  });
  const testTicket = testSnsTicket.ticket;
  const snsSwapCanister = mock<SnsSwapCanister>();
  const spyOnNewSaleTicketApi = jest.fn();
  const spyOnNotifyPaymentFailureApi = jest.fn();
  const ticketFromStore = (rootCanisterId = testRootCanisterId) =>
    get(snsTicketsStore)[rootCanisterId.toText()];

  beforeEach(() => {
    // Make sure there are no open polling timers
    cancelPollGetOpenTicket();
    spyOnSendICP.mockReset();
    spyOnSendICP.mockReset();
    spyOnNotifyParticipation.mockReset();
    spyOnToastsShow.mockReset();
    spyOnToastsSuccess.mockReset();
    spyOnToastsError.mockReset();
    snsSwapCanister.getOpenTicket.mockReset();
    spyOnNewSaleTicketApi.mockReset();
    spyOnNotifyPaymentFailureApi.mockReset();

    jest.useFakeTimers();
    jest.clearAllMocks();

    snsTicketsStore.reset();
    accountsStore.resetForTesting();

    spyOnNewSaleTicketApi.mockResolvedValue(testSnsTicket.ticket);
    spyOnNotifyPaymentFailureApi.mockResolvedValue(undefined);
    jest.spyOn(console, "error").mockReturnValue();
    snsQueryStore.reset();
    spyOnQueryBalance.mockResolvedValue(newBalanceE8s);

    setUpMockSnsProjectStore({ rootCanisterId: testSnsTicket.rootCanisterId });

    spyOnSendICP.mockResolvedValue(13n);

    const fee = mockSnsToken.fee;
    transactionsFeesStore.setFee({
      rootCanisterId: rootCanisterIdMock,
      fee,
      certified: true,
    });

    (importSnsWasmCanister as jest.Mock).mockResolvedValue({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      create: (options: SnsWasmCanisterOptions) => ({
        listSnses: () => Promise.resolve(deployedSnsMock),
      }),
    });

    spyOnNotifyParticipation.mockResolvedValue({
      icp_accepted_participation_e8s: 666n,
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
        newSaleTicket: spyOnNewSaleTicketApi,
        notifyPaymentFailure: spyOnNotifyPaymentFailureApi,
      })
    );

    // `getOpenTicket` is mocked from the SnsSwapCanister not the wrapper
    jest
      .spyOn(SnsSwapCanister, "create")
      .mockImplementation((): SnsSwapCanister => snsSwapCanister);

    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  describe("loadOpenTicket", () => {
    beforeEach(() => {
      snsTicketsStore.reset();
    });

    describe("when polling is enabled", () => {
      beforeEach(() => {
        jest.clearAllTimers();
        const now = Date.now();
        jest.useFakeTimers().setSystemTime(now);
      });

      it("should call api and load ticket in the store", async () => {
        snsSwapCanister.getOpenTicket.mockResolvedValue(testSnsTicket.ticket);
        await loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          swapCanisterId: swapCanisterIdMock,
          certified: true,
        });

        expect(snsSwapCanister.getOpenTicket).toBeCalledTimes(1);
        expect(ticketFromStore(testSnsTicket.rootCanisterId).ticket).toEqual(
          testTicket
        );
      });

      it("should retry until gets an open ticket", async () => {
        // Success in the fourth attempt
        const callsUntilSuccess = 4;
        snsSwapCanister.getOpenTicket
          .mockRejectedValueOnce(new Error("network error"))
          .mockRejectedValueOnce(new Error("network error"))
          .mockRejectedValueOnce(new Error("network error"))
          .mockResolvedValue(testSnsTicket.ticket);
        loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          swapCanisterId: swapCanisterIdMock,
          certified: true,
        });

        await runResolvedPromises();
        let expectedCalls = 1;
        expect(snsSwapCanister.getOpenTicket).toBeCalledTimes(expectedCalls);

        let retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;
        while (expectedCalls < callsUntilSuccess) {
          await advanceTime(retryDelay);
          retryDelay *= 2;
          expectedCalls += 1;
          expect(snsSwapCanister.getOpenTicket).toBeCalledTimes(expectedCalls);
        }

        // Even after waiting a long time there shouldn't be more calls.
        await advanceTime(99 * retryDelay);
        expect(snsSwapCanister.getOpenTicket).toBeCalledTimes(expectedCalls);

        expect(ticketFromStore(testSnsTicket.rootCanisterId).ticket).toEqual(
          testTicket
        );
      });

      it("should stop retrying after max attempts and set ticket to null", async () => {
        const maxAttempts = 10;
        snsSwapCanister.getOpenTicket.mockRejectedValue(
          new Error("network error")
        );
        loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          swapCanisterId: swapCanisterIdMock,
          certified: true,
          maxAttempts,
        });

        await runResolvedPromises();
        let expectedCalls = 1;
        expect(snsSwapCanister.getOpenTicket).toBeCalledTimes(expectedCalls);

        let retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;
        while (expectedCalls < maxAttempts) {
          await advanceTime(retryDelay);
          retryDelay *= 2;
          expectedCalls += 1;
          expect(snsSwapCanister.getOpenTicket).toBeCalledTimes(expectedCalls);
        }

        // Even after waiting a long time, there shouldn't be more calls.
        await advanceTime(99 * retryDelay);
        expect(snsSwapCanister.getOpenTicket).toBeCalledTimes(expectedCalls);

        expect(ticketFromStore(testSnsTicket.rootCanisterId).ticket).toBeNull();
      });

      it("should call api once if error is known", async () => {
        snsSwapCanister.getOpenTicket.mockRejectedValue(
          new SnsSwapGetOpenTicketError(GetOpenTicketErrorType.TYPE_SALE_CLOSED)
        );

        await loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          swapCanisterId: swapCanisterIdMock,
          certified: true,
        });

        expect(snsSwapCanister.getOpenTicket).toBeCalledTimes(1);
      });

      it("should set store to `null` on closed error", async () => {
        snsSwapCanister.getOpenTicket.mockRejectedValue(
          new SnsSwapGetOpenTicketError(GetOpenTicketErrorType.TYPE_SALE_CLOSED)
        );

        await loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          swapCanisterId: swapCanisterIdMock,
          certified: true,
        });

        expect(
          ticketFromStore(testSnsTicket.rootCanisterId)?.ticket
        ).toBeNull();
      });

      it("should show error on closed", async () => {
        snsSwapCanister.getOpenTicket.mockRejectedValue(
          new SnsSwapGetOpenTicketError(GetOpenTicketErrorType.TYPE_SALE_CLOSED)
        );

        await loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          swapCanisterId: swapCanisterIdMock,
          certified: true,
        });

        expect(spyOnToastsError).toBeCalledWith(
          expect.objectContaining({
            labelKey: "error__sns.sns_sale_closed",
          })
        );
      });

      it("should set store to `null` on unspecified type error", async () => {
        snsSwapCanister.getOpenTicket.mockRejectedValue(
          new SnsSwapGetOpenTicketError(GetOpenTicketErrorType.TYPE_UNSPECIFIED)
        );

        await loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          swapCanisterId: swapCanisterIdMock,
          certified: true,
        });

        expect(
          ticketFromStore(testSnsTicket.rootCanisterId)?.ticket
        ).toBeNull();
      });

      it("should show error on unspecified type error", async () => {
        snsSwapCanister.getOpenTicket.mockRejectedValue(
          new SnsSwapGetOpenTicketError(GetOpenTicketErrorType.TYPE_UNSPECIFIED)
        );

        await loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          swapCanisterId: swapCanisterIdMock,
          certified: true,
        });

        expect(spyOnToastsError).toBeCalledWith(
          expect.objectContaining({
            labelKey: "error__sns.sns_sale_final_error",
          })
        );
      });

      it("should set store to `null` on not open error", async () => {
        snsSwapCanister.getOpenTicket.mockRejectedValue(
          new SnsSwapGetOpenTicketError(
            GetOpenTicketErrorType.TYPE_SALE_NOT_OPEN
          )
        );

        await loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          swapCanisterId: swapCanisterIdMock,
          certified: true,
        });

        expect(
          ticketFromStore(testSnsTicket.rootCanisterId)?.ticket
        ).toBeNull();
      });

      it("should show error on not open error", async () => {
        snsSwapCanister.getOpenTicket.mockRejectedValue(
          new SnsSwapGetOpenTicketError(
            GetOpenTicketErrorType.TYPE_SALE_NOT_OPEN
          )
        );

        await loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          swapCanisterId: swapCanisterIdMock,
          certified: true,
        });

        expect(spyOnToastsError).toBeCalledWith(
          expect.objectContaining({
            labelKey: "error__sns.sns_sale_not_open",
          })
        );
      });

      it("should show 'high load' toast after 6 failures", async () => {
        const maxAttempts = 10;
        const expectFailuresBeforeToast = 6;
        snsSwapCanister.getOpenTicket.mockRejectedValue(
          new Error("network error")
        );
        loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          swapCanisterId: swapCanisterIdMock,
          certified: true,
          maxAttempts,
        });

        await runResolvedPromises();
        let expectedCalls = 1;
        expect(snsSwapCanister.getOpenTicket).toBeCalledTimes(expectedCalls);

        let retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;
        while (expectedCalls < expectFailuresBeforeToast) {
          await advanceTime(retryDelay);
          retryDelay *= 2;
          expectedCalls += 1;
          expect(snsSwapCanister.getOpenTicket).toBeCalledTimes(expectedCalls);

          if (expectedCalls < expectFailuresBeforeToast) {
            expect(spyOnToastsError).not.toBeCalled();
          }
        }
        expect(snsSwapCanister.getOpenTicket).toBeCalledTimes(
          expectFailuresBeforeToast
        );
        expect(spyOnToastsError).toBeCalledWith(
          expect.objectContaining({
            labelKey: "error.high_load_retrying",
          })
        );
      });
    });

    describe("when disabling polling", () => {
      beforeEach(() => {
        jest.clearAllTimers();
        const now = Date.now();
        jest.useFakeTimers().setSystemTime(now);
      });

      it("should stop retrying", async () => {
        snsSwapCanister.getOpenTicket.mockRejectedValue(
          new Error("network error")
        );
        loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          swapCanisterId: swapCanisterIdMock,
          certified: true,
          maxAttempts: 10,
        });

        await runResolvedPromises();
        let expectedCalls = 1;
        expect(snsSwapCanister.getOpenTicket).toBeCalledTimes(expectedCalls);

        let retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;
        const callsBeforeStopPolling = 4;

        while (expectedCalls < callsBeforeStopPolling) {
          await advanceTime(retryDelay);
          retryDelay *= 2;
          expectedCalls += 1;
          expect(snsSwapCanister.getOpenTicket).toBeCalledTimes(expectedCalls);
        }
        cancelPollGetOpenTicket();
        await advanceTime(retryDelay);
        retryDelay *= 2;

        // Even after waiting a long time, there shouldn't be more calls.
        await advanceTime(99 * retryDelay);
        expect(snsSwapCanister.getOpenTicket).toBeCalledTimes(expectedCalls);
      });

      it("should hide toast when stop retrying", async () => {
        snsSwapCanister.getOpenTicket.mockRejectedValue(
          new Error("network error")
        );
        loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          swapCanisterId: swapCanisterIdMock,
          certified: true,
          maxAttempts: 10,
        });

        await runResolvedPromises();
        let expectedCalls = 1;
        expect(snsSwapCanister.getOpenTicket).toBeCalledTimes(expectedCalls);

        let retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;
        const callsBeforeStopPolling = 4;

        while (expectedCalls < callsBeforeStopPolling) {
          await advanceTime(retryDelay);
          retryDelay *= 2;
          expectedCalls += 1;
          expect(snsSwapCanister.getOpenTicket).toBeCalledTimes(expectedCalls);
        }
        expect(spyOnToastsShow).toBeCalledTimes(1);
        expect(spyOnToastsHide).not.toBeCalled();
        cancelPollGetOpenTicket();

        await runResolvedPromises();
        expect(spyOnToastsHide).toBeCalledTimes(1);
      });
    });
  });

  describe("loadNewSaleTicket ", () => {
    beforeEach(() => {
      jest.clearAllTimers();
      const now = Date.now();
      jest.useFakeTimers().setSystemTime(now);
    });
    it("should call newSaleTicket  api", async () => {
      await loadNewSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalledTimes(1);
    });

    it("should add new ticket to the store", async () => {
      await loadNewSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(ticketFromStore()?.ticket).toEqual(testTicket);
    });

    it("should handle sale-closed error", async () => {
      spyOnNewSaleTicketApi.mockRejectedValue(
        new SnsSwapNewTicketError({
          errorType: NewSaleTicketResponseErrorType.TYPE_SALE_CLOSED,
        })
      );

      await loadNewSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_closed",
        })
      );
      expect(ticketFromStore()?.ticket).toEqual(null);
    });

    it("should handle sale-not-open error", async () => {
      spyOnNewSaleTicketApi.mockRejectedValue(
        new SnsSwapNewTicketError({
          errorType: NewSaleTicketResponseErrorType.TYPE_SALE_NOT_OPEN,
        })
      );

      await loadNewSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_not_open",
        })
      );
      expect(ticketFromStore()?.ticket).toEqual(null);
    });

    it("should reuse the ticket from the ticket-exist error", async () => {
      spyOnNewSaleTicketApi.mockRejectedValue(
        new SnsSwapNewTicketError({
          errorType: NewSaleTicketResponseErrorType.TYPE_TICKET_EXISTS,
          existingTicket: testSnsTicket.ticket,
        })
      );

      await loadNewSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(spyOnToastsError).toBeCalledTimes(1);
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_proceed_with_existing_ticket",
          substitutions: {
            $time: nanoSecondsToDateTime(testSnsTicket.ticket.creation_time),
          },
        })
      );
      expect(ticketFromStore()?.ticket).toEqual(testTicket);
    });

    it("should handle invalid user amount error", async () => {
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

      await loadNewSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
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
      expect(ticketFromStore()?.ticket).toEqual(null);
    });

    it("should handle invalid sub-account error", async () => {
      spyOnNewSaleTicketApi.mockRejectedValue(
        new SnsSwapNewTicketError({
          errorType: NewSaleTicketResponseErrorType.TYPE_INVALID_SUBACCOUNT,
        })
      );

      await loadNewSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_invalid_subaccount",
        })
      );
      expect(ticketFromStore()?.ticket).toEqual(null);
    });

    it("should handle retry later error", async () => {
      spyOnNewSaleTicketApi.mockRejectedValue(
        new SnsSwapNewTicketError({
          errorType: NewSaleTicketResponseErrorType.TYPE_UNSPECIFIED,
        })
      );

      await loadNewSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_try_later",
        })
      );
      expect(ticketFromStore()?.ticket).toEqual(null);
    });

    it("should retry unknown errors until successful", async () => {
      // Success on the 4th try
      const callsUntilSuccess = 4;
      spyOnNewSaleTicketApi
        .mockRejectedValueOnce(new Error("connection error"))
        .mockRejectedValueOnce(new Error("connection error"))
        .mockRejectedValueOnce(new Error("connection error"))
        .mockResolvedValue(testSnsTicket.ticket);

      loadNewSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      await runResolvedPromises();
      let expectedCalls = 1;
      expect(spyOnNewSaleTicketApi).toBeCalledTimes(expectedCalls);

      let retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;
      while (expectedCalls < callsUntilSuccess) {
        await advanceTime(retryDelay);
        retryDelay *= 2;
        expectedCalls += 1;
        expect(spyOnNewSaleTicketApi).toBeCalledTimes(expectedCalls);
      }
      // Even after waiting a long time there shouldn't be more calls.
      await advanceTime(99 * retryDelay);
      expect(spyOnNewSaleTicketApi).toBeCalledTimes(expectedCalls);
    });

    it("should retry unknown errors until known error", async () => {
      // Known error on the 4th try
      const callsUntilKnownError = 4;
      spyOnNewSaleTicketApi
        .mockRejectedValueOnce(new Error("connection error"))
        .mockRejectedValueOnce(new Error("connection error"))
        .mockRejectedValueOnce(new Error("connection error"))
        .mockRejectedValue(
          new SnsSwapNewTicketError({
            errorType: NewSaleTicketResponseErrorType.TYPE_UNSPECIFIED,
          })
        );

      loadNewSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      await runResolvedPromises();
      let expectedCalls = 1;
      expect(spyOnNewSaleTicketApi).toBeCalledTimes(expectedCalls);

      let retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;
      while (expectedCalls < callsUntilKnownError) {
        await advanceTime(retryDelay);
        retryDelay *= 2;
        expectedCalls += 1;
        expect(spyOnNewSaleTicketApi).toBeCalledTimes(expectedCalls);
      }
      // Even after waiting a long time there shouldn't be more calls.
      await advanceTime(99 * retryDelay);
      expect(spyOnNewSaleTicketApi).toBeCalledTimes(expectedCalls);
    });

    it("should show 'high load' toast after 6 failures", async () => {
      const expectFailuresBeforeToast = 6;
      spyOnNewSaleTicketApi.mockRejectedValue(new Error("network error"));
      loadNewSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      await runResolvedPromises();
      let expectedCalls = 1;
      expect(spyOnNewSaleTicketApi).toBeCalledTimes(expectedCalls);

      let retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;
      while (expectedCalls < expectFailuresBeforeToast) {
        await advanceTime(retryDelay);
        retryDelay *= 2;
        expectedCalls += 1;
        expect(spyOnNewSaleTicketApi).toBeCalledTimes(expectedCalls);

        if (expectedCalls < expectFailuresBeforeToast) {
          expect(spyOnToastsError).not.toBeCalled();
        }
      }
      expect(spyOnNewSaleTicketApi).toBeCalledTimes(expectFailuresBeforeToast);
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error.high_load_retrying",
        })
      );
    });
  });

  describe("restoreSnsSaleParticipation", () => {
    it("should perform successful participation flow if open ticket", async () => {
      snsSwapCanister.getOpenTicket.mockResolvedValue(testSnsTicket.ticket);
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const updateProgressSpy = jest.fn().mockResolvedValue(undefined);

      await restoreSnsSaleParticipation({
        rootCanisterId: rootCanisterIdMock,
        swapCanisterId: swapCanisterIdMock,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: updateProgressSpy,
      });

      expect(spyOnSendICP).toBeCalledTimes(1);
      expect(postprocessSpy).toBeCalledTimes(1);

      // All steps called
      expect(updateProgressSpy).toBeCalledTimes(4);

      // null after ready
      expect(ticketFromStore().ticket).toEqual(null);
      // no errors
      expect(spyOnToastsError).not.toBeCalled();
    });

    it("should not start flow if no open ticket", async () => {
      snsSwapCanister.getOpenTicket.mockResolvedValue(undefined);
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const updateProgressSpy = jest.fn().mockResolvedValue(undefined);
      const startBusySpy = jest
        .spyOn(busyStore, "startBusy")
        .mockImplementation(jest.fn());

      await restoreSnsSaleParticipation({
        rootCanisterId: rootCanisterIdMock,
        swapCanisterId: swapCanisterIdMock,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: updateProgressSpy,
      });

      expect(startBusySpy).not.toBeCalled();
      expect(spyOnSendICP).not.toBeCalled();
      expect(postprocessSpy).not.toBeCalled();
      expect(updateProgressSpy).not.toBeCalled();
      expect(ticketFromStore().ticket).toEqual(null);
    });

    it("should pass confirmation_text to notifyParticipation", async () => {
      const confirmationText = "I still agree";
      setUpMockSnsProjectStore({
        rootCanisterId: testSnsTicket.rootCanisterId,
        confirmationText,
      });

      snsSwapCanister.getOpenTicket.mockResolvedValue(testSnsTicket.ticket);
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const updateProgressSpy = jest.fn().mockResolvedValue(undefined);

      await restoreSnsSaleParticipation({
        rootCanisterId: rootCanisterIdMock,
        swapCanisterId: swapCanisterIdMock,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: updateProgressSpy,
      });

      expect(spyOnNotifyParticipation).toBeCalledTimes(1);
      expect(spyOnNotifyParticipation).toBeCalledWith(
        expect.objectContaining({
          confirmation_text: toNullable(confirmationText),
        })
      );
    });

    it("should pass empty confirmation_text when absent", async () => {
      const confirmationText = undefined;
      setUpMockSnsProjectStore({
        rootCanisterId: testSnsTicket.rootCanisterId,
        confirmationText,
      });

      snsSwapCanister.getOpenTicket.mockResolvedValue(testSnsTicket.ticket);
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const updateProgressSpy = jest.fn().mockResolvedValue(undefined);

      await restoreSnsSaleParticipation({
        rootCanisterId: rootCanisterIdMock,
        swapCanisterId: swapCanisterIdMock,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: updateProgressSpy,
      });

      expect(spyOnNotifyParticipation).toBeCalledTimes(1);
      expect(spyOnNotifyParticipation).toBeCalledWith(
        expect.objectContaining({
          confirmation_text: toNullable(confirmationText),
        })
      );
    });
  });

  describe("initiateSnsSaleParticipation", () => {
    it("should start successful participation flow", async () => {
      const account = {
        ...mockMainAccount,
        balance: TokenAmount.fromE8s({
          amount: BigInt(1_000_000_000_000),
          token: ICPToken,
        }),
      };
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const updateProgressSpy = jest.fn().mockResolvedValue(undefined);

      await initiateSnsSaleParticipation({
        rootCanisterId: rootCanisterIdMock,
        amount: TokenAmount.fromNumber({
          amount: 1,
          token: ICPToken,
        }),
        account,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: updateProgressSpy,
      });

      expect(spyOnNewSaleTicketApi).toBeCalledTimes(1);
      expect(spyOnNewSaleTicketApi).toBeCalledWith(
        expect.objectContaining({
          amount_icp_e8s: 100000000n,
        })
      );
      expect(spyOnSendICP).toBeCalledTimes(1);
      expect(postprocessSpy).toBeCalledTimes(1);
      // All step progress including done
      expect(updateProgressSpy).toBeCalledTimes(5);
      // null after ready
      expect(ticketFromStore().ticket).toEqual(null);
      expect(spyOnToastsSuccess).toBeCalledTimes(1);
      expect(spyOnToastsSuccess).toBeCalledWith(
        expect.objectContaining({
          labelKey: "sns_project_detail.participate_success",
        })
      );
      // no errors
      expect(spyOnToastsError).not.toBeCalled();
    });

    it("should handle errors", async () => {
      // remove the sns-project
      jest
        .spyOn(snsProjectsStore, "subscribe")
        .mockImplementation(mockProjectSubscribe([]));

      const account = {
        ...mockMainAccount,
        balance: TokenAmount.fromE8s({
          amount: BigInt(1_000_000_000_000),
          token: ICPToken,
        }),
      };

      await initiateSnsSaleParticipation({
        rootCanisterId: rootCanisterIdMock,
        amount: TokenAmount.fromNumber({
          amount: 1,
          token: ICPToken,
        }),
        account,
        userCommitment: 0n,
        postprocess: jest.fn().mockResolvedValue(undefined),
        updateProgress: jest.fn().mockResolvedValue(undefined),
      });

      expect(spyOnNewSaleTicketApi).not.toBeCalled();
      expect(spyOnToastsError).toBeCalled();
      // null after ready
      expect(ticketFromStore().ticket).toEqual(null);
    });
  });

  describe("participateInSnsSale", () => {
    beforeEach(() => {
      jest.clearAllTimers();
      const now = Date.now();
      jest.useFakeTimers().setSystemTime(now);
    });
    it("should call postprocess and APIs", async () => {
      accountsStore.setForTesting({
        main: mockMainAccount,
      });
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const upgradeProgressSpy = jest.fn().mockResolvedValue(undefined);

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: upgradeProgressSpy,
        ticket: testTicket,
      });

      expect(spyOnSendICP).toBeCalledTimes(1);
      expect(spyOnNotifyParticipation).toBeCalledTimes(1);
      expect(spyOnNotifyPaymentFailureApi).not.toBeCalled();
      expect(spyOnQueryBalance).toBeCalledTimes(2);
      expect(ticketFromStore().ticket).toEqual(null);
      expect(postprocessSpy).toBeCalledTimes(1);

      // All steps called
      expect(upgradeProgressSpy).toBeCalledTimes(4);
    });

    it("should update account's balance in the store", async () => {
      accountsStore.setForTesting({
        main: mockMainAccount,
      });
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const upgradeProgressSpy = jest.fn().mockResolvedValue(undefined);

      expect(get(accountsStore).main.balance.toE8s()).not.toEqual(
        newBalanceE8s
      );

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: upgradeProgressSpy,
        ticket: testTicket,
      });

      expect(get(accountsStore).main.balance.toE8s()).toEqual(newBalanceE8s);
    });

    it("should update subaccounts's balance in the store", async () => {
      const snsTicket = snsTicketMock({
        rootCanisterId: rootCanisterIdMock,
        owner: mockIdentity.getPrincipal(),
        subaccount: arrayOfNumberToUint8Array(mockSubAccount.subAccount),
      });
      accountsStore.setForTesting({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
      });
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const upgradeProgressSpy = jest.fn().mockResolvedValue(undefined);

      expect(get(accountsStore).main.balance.toE8s()).not.toEqual(
        newBalanceE8s
      );

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: upgradeProgressSpy,
        ticket: snsTicket.ticket,
      });

      expect(get(accountsStore).subAccounts[0].balance.toE8s()).toEqual(
        newBalanceE8s
      );
    });

    it("should poll refresh_buyer_tokens until successful", async () => {
      // Success on the fourth try
      const callsUntilSuccess = 4;
      const accountBalanceError = new Error(
        "Error calling method 'account_balance_pb'..."
      );
      spyOnNotifyParticipation
        .mockRejectedValueOnce(accountBalanceError)
        .mockRejectedValueOnce(accountBalanceError)
        .mockRejectedValueOnce(accountBalanceError)
        .mockResolvedValue({
          icp_accepted_participation_e8s: 666n,
        });
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const upgradeProgressSpy = jest.fn().mockResolvedValue(undefined);

      participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: upgradeProgressSpy,
        ticket: testTicket,
      });

      await runResolvedPromises();
      let expectedCalls = 1;
      expect(spyOnNotifyParticipation).toBeCalledTimes(expectedCalls);

      let retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;
      while (expectedCalls < callsUntilSuccess) {
        await advanceTime(retryDelay);
        retryDelay *= 2;
        expectedCalls += 1;
        expect(spyOnNotifyParticipation).toBeCalledTimes(expectedCalls);
      }

      // Even after waiting a long time there shouldn't be more calls.
      await advanceTime(99 * retryDelay);
      expect(spyOnNotifyParticipation).toBeCalledTimes(expectedCalls);

      expect(ticketFromStore().ticket).toEqual(null);

      expect(spyOnSendICP).toBeCalledTimes(1);
      expect(spyOnNotifyPaymentFailureApi).not.toBeCalled();
      expect(postprocessSpy).toBeCalledTimes(1);

      // All steps called
      expect(upgradeProgressSpy).toBeCalledTimes(4);
    });

    it("should pass confirmation_text to notifyParticipation", async () => {
      const confirmationText = "I agree";
      setUpMockSnsProjectStore({
        rootCanisterId: testSnsTicket.rootCanisterId,
        confirmationText,
      });

      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const upgradeProgressSpy = jest.fn().mockResolvedValue(undefined);

      participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: upgradeProgressSpy,
        ticket: testTicket,
      });

      await runResolvedPromises();
      expect(spyOnNotifyParticipation).toBeCalledTimes(1);
      expect(spyOnNotifyParticipation).toBeCalledWith(
        expect.objectContaining({
          confirmation_text: toNullable(confirmationText),
        })
      );
    });

    it("should pass empty confirmation_text when absent", async () => {
      const confirmationText = undefined;
      setUpMockSnsProjectStore({
        rootCanisterId: testSnsTicket.rootCanisterId,
        confirmationText,
      });

      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const upgradeProgressSpy = jest.fn().mockResolvedValue(undefined);

      participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: upgradeProgressSpy,
        ticket: testTicket,
      });

      await runResolvedPromises();
      expect(spyOnNotifyParticipation).toBeCalledTimes(1);
      expect(spyOnNotifyParticipation).toBeCalledWith(
        expect.objectContaining({
          confirmation_text: toNullable(confirmationText),
        })
      );
    });

    it("should show error if known error is thrown", async () => {
      spyOnNotifyParticipation.mockRejectedValue(
        new Error(
          "The token amount can only be refreshed when the canister is in the OPEN state"
        )
      );
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const updateProgressSpy = jest.fn().mockResolvedValue(undefined);

      participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: updateProgressSpy,
        ticket: testTicket,
      });

      await runResolvedPromises();
      expect(spyOnNotifyParticipation).toBeCalledTimes(1);

      const retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;

      // Even after waiting a long time there shouldn't be more calls.
      await advanceTime(99 * retryDelay);
      expect(spyOnNotifyParticipation).toBeCalledTimes(1);

      expect(spyOnSendICP).toBeCalledTimes(1);
      expect(spyOnNotifyPaymentFailureApi).not.toBeCalled();
      expect(postprocessSpy).not.toBeCalled();

      // Initialization and transfer steps
      expect(updateProgressSpy).toBeCalledTimes(2);
    });

    it("should display an error in case the ticket principal not equals to the current identity", async () => {
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: testTicket,
      });
      // corrupt the current identity principal
      jest.spyOn(authStore, "subscribe").mockImplementation((run) => {
        run({
          identity: {
            ...mockIdentity,
            getPrincipal: () => Principal.fromText("aaaaa-aa"),
          },
        });
        return () => undefined;
      });

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: jest.fn().mockResolvedValue(undefined),
        updateProgress: jest.fn().mockResolvedValue(undefined),
        ticket: testTicket,
      });

      expect(spyOnNotifyParticipation).not.toBeCalled();
      expect(spyOnNotifyPaymentFailureApi).not.toBeCalled();
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_unexpected_error",
        })
      );
      // do not enable the UI
      expect(ticketFromStore().ticket).not.toEqual(null);
    });

    it("should poll transfer during unknown issues or TxCreatedInFutureError", async () => {
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const updateProgressSpy = jest.fn().mockResolvedValue(undefined);

      // Success on the fourth try
      const callsUntilSuccess = 4;
      spyOnSendICP
        .mockRejectedValueOnce(new Error("Connection error"))
        .mockRejectedValueOnce(
          new TxCreatedInFutureError("Created in future error")
        )
        .mockRejectedValueOnce(new Error("Connection error"))
        .mockResolvedValue(13n);

      participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: updateProgressSpy,
        ticket: testTicket,
      });

      await runResolvedPromises();
      let expectedCalls = 1;
      expect(spyOnSendICP).toBeCalledTimes(expectedCalls);

      let retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;
      while (expectedCalls < callsUntilSuccess) {
        await advanceTime(retryDelay);
        retryDelay *= 2;
        expectedCalls += 1;
        expect(spyOnSendICP).toBeCalledTimes(expectedCalls);
      }
      // Even after waiting a long time there shouldn't be more calls.
      await advanceTime(99 * retryDelay);
      expect(spyOnSendICP).toBeCalledTimes(callsUntilSuccess);

      expect(ticketFromStore().ticket).toBeNull();
      expect(postprocessSpy).toBeCalledTimes(1);
      // All steps completed
      expect(updateProgressSpy).toBeCalledTimes(4);
    });

    it("should display transfer api unknown errors", async () => {
      spyOnSendICP.mockRejectedValue(new TransferError("test"));

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: jest.fn().mockResolvedValue(undefined),
        updateProgress: jest.fn().mockResolvedValue(undefined),
        ticket: testTicket,
      });

      expect(spyOnNotifyParticipation).not.toBeCalled();
      expect(spyOnNotifyPaymentFailureApi).not.toBeCalled();
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_unexpected_error",
        })
      );
      expect(ticketFromStore().ticket).toEqual(null);
    });

    it("should display InsufficientFundsError errors", async () => {
      spyOnSendICP.mockRejectedValue(new InsufficientFundsError(0n));

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: jest.fn().mockResolvedValue(undefined),
        updateProgress: jest.fn().mockResolvedValue(undefined),
        ticket: testTicket,
      });

      expect(spyOnNotifyParticipation).not.toBeCalled();
      expect(spyOnNotifyPaymentFailureApi).toBeCalledTimes(1);
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.ledger_insufficient_funds",
        })
      );
      expect(ticketFromStore().ticket).toEqual(null);
      expect(spyOnToastsSuccess).not.toBeCalled();
    });

    describe("TooOldError", () => {
      it("should succeed when no errors on notify participation", async () => {
        spyOnSendICP.mockRejectedValue(new TxTooOldError(0));

        await participateInSnsSale({
          rootCanisterId: testRootCanisterId,
          swapCanisterId,
          userCommitment: 0n,
          postprocess: jest.fn().mockResolvedValue(undefined),
          updateProgress: jest.fn().mockResolvedValue(undefined),
          ticket: testTicket,
        });

        expect(spyOnNotifyParticipation).toBeCalledTimes(1);
        expect(spyOnNotifyPaymentFailureApi).not.toBeCalled();
        expect(spyOnToastsError).not.toBeCalled();
        expect(spyOnToastsSuccess).toBeCalledTimes(1);
        expect(spyOnToastsSuccess).toBeCalledWith(
          expect.objectContaining({
            labelKey: "sns_project_detail.participate_success",
          })
        );
        // to enable the button/increase_participation
        expect(ticketFromStore().ticket).toEqual(null);
      });

      it("should handle refresh_buyer_tokens internal errors and manually remove the ticket", async () => {
        snsTicketsStore.setTicket({
          rootCanisterId: rootCanisterIdMock,
          ticket: testTicket,
        });
        spyOnNotifyParticipation.mockRejectedValue(
          new Error(
            "The token amount can only be refreshed when the canister is in the OPEN state"
          )
        );
        spyOnSendICP.mockRejectedValue(new TxTooOldError(0));

        await participateInSnsSale({
          rootCanisterId: testRootCanisterId,
          swapCanisterId,
          userCommitment: 0n,
          postprocess: jest.fn().mockResolvedValue(undefined),
          updateProgress: jest.fn().mockResolvedValue(undefined),
          ticket: testTicket,
        });

        expect(spyOnNotifyParticipation).toBeCalledTimes(1);
        expect(spyOnNotifyPaymentFailureApi).toBeCalledTimes(1);
        expect(spyOnToastsError).toBeCalledTimes(1);
        expect(spyOnToastsError).toBeCalledWith(
          expect.objectContaining({
            labelKey: "error__sns.sns_sale_unexpected_and_refresh",
          })
        );
        expect(spyOnToastsSuccess).not.toBeCalled();
        // the button/increase_participation should not be enabled
        expect(ticketFromStore().ticket).not.toBeNull();
      });
    });

    it("should ignore Duplicate error", async () => {
      spyOnSendICP.mockRejectedValue(new TxDuplicateError(0n));

      expect(spyOnToastsError).not.toBeCalled();

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: jest.fn().mockResolvedValue(undefined),
        updateProgress: jest.fn().mockResolvedValue(undefined),
        ticket: testTicket,
      });

      expect(spyOnNotifyParticipation).toBeCalled();
      expect(spyOnToastsError).not.toBeCalled();
      expect(ticketFromStore().ticket).toEqual(null);
    });

    it("should display a waring when current_committed ≠ ticket.amount", async () => {
      const ticket = {
        ...testTicket,
        amount_icp_e8s: 1n,
      };
      spyOnNotifyParticipation.mockResolvedValue({
        icp_accepted_participation_e8s: 100n,
      });
      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: jest.fn().mockResolvedValue(undefined),
        updateProgress: jest.fn().mockResolvedValue(undefined),
        ticket,
      });

      expect(spyOnToastsShow).toBeCalledWith(
        expect.objectContaining({
          level: "warn",
          labelKey: "error__sns.sns_sale_committed_not_equal_to_amount",
        })
      );
      expect(ticketFromStore().ticket).toEqual(null);
    });

    it("should not display a waring when current_committed = ticket.amount", async () => {
      const ticket = {
        ...testTicket,
        amount_icp_e8s: 1n,
      };
      spyOnNotifyParticipation.mockResolvedValue({
        icp_accepted_participation_e8s: 1n,
      });
      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: jest.fn().mockResolvedValue(undefined),
        updateProgress: jest.fn().mockResolvedValue(undefined),
        ticket,
      });

      expect(spyOnToastsShow).not.toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_committed_not_equal_to_amount",
        })
      );
    });

    it("should not display a waring when current_committed = ticket.amount for increase participation", async () => {
      const ticket = {
        ...testTicket,
        amount_icp_e8s: 3n,
      };
      spyOnNotifyParticipation.mockResolvedValue({
        icp_accepted_participation_e8s: 10n,
      });
      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 7n,
        postprocess: jest.fn().mockResolvedValue(undefined),
        updateProgress: jest.fn().mockResolvedValue(undefined),
        ticket,
      });

      expect(spyOnToastsShow).not.toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_committed_not_equal_to_amount",
        })
      );
    });

    it("should show 'high load' toast after 6 failures", async () => {
      const expectFailuresBeforeToast = 6;
      spyOnNotifyParticipation.mockRejectedValue(new Error("network error"));
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const upgradeProgressSpy = jest.fn().mockResolvedValue(undefined);
      participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: upgradeProgressSpy,
        ticket: testTicket,
      });

      await runResolvedPromises();
      let expectedCalls = 1;
      expect(spyOnNotifyParticipation).toBeCalledTimes(expectedCalls);

      let retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;
      while (expectedCalls < expectFailuresBeforeToast) {
        await advanceTime(retryDelay);
        retryDelay *= 2;
        expectedCalls += 1;
        expect(spyOnNotifyParticipation).toBeCalledTimes(expectedCalls);

        if (expectedCalls < expectFailuresBeforeToast) {
          expect(spyOnToastsError).not.toBeCalled();
        }
      }
      expect(spyOnNotifyParticipation).toBeCalledTimes(
        expectFailuresBeforeToast
      );
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error.high_load_retrying",
        })
      );
    });

    it("transfer should show 'high load' toast after 6 failures", async () => {
      const expectFailuresBeforeToast = 6;
      spyOnSendICP.mockRejectedValue(new Error("network error"));
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const upgradeProgressSpy = jest.fn().mockResolvedValue(undefined);
      participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: upgradeProgressSpy,
        ticket: testTicket,
      });

      await runResolvedPromises();
      let expectedCalls = 1;
      expect(spyOnSendICP).toBeCalledTimes(expectedCalls);

      let retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;
      while (expectedCalls < expectFailuresBeforeToast) {
        await advanceTime(retryDelay);
        retryDelay *= 2;
        expectedCalls += 1;
        expect(spyOnSendICP).toBeCalledTimes(expectedCalls);

        if (expectedCalls < expectFailuresBeforeToast) {
          expect(spyOnToastsError).not.toBeCalled();
        }
      }
      expect(spyOnSendICP).toBeCalledTimes(expectFailuresBeforeToast);
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error.high_load_retrying",
        })
      );
    });
  });
});
