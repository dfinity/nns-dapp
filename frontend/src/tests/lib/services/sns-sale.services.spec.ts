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
import * as accountsServices from "$lib/services/accounts.services";
import {
  initiateSnsSaleParticipation,
  loadOpenTicket,
  newSaleTicket,
  participateInSnsSale,
  restoreSnsSaleParticipation,
} from "$lib/services/sns-sale.services";
import { authStore } from "$lib/stores/auth.store";
import * as busyStore from "$lib/stores/busy.store";
import { snsTicketsStore } from "$lib/stores/sns-tickets.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import { nanoSecondsToDateTime } from "$lib/utils/date.utils";
import { formatToken } from "$lib/utils/token.utils";
import { DEFAULT_MAX_POLLING_ATTEMPTS } from "$lib/utils/utils";
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
  SnsSwapGetOpenTicketError,
  SnsSwapLifecycle,
  SnsSwapNewTicketError,
} from "@dfinity/sns";
import { waitFor } from "@testing-library/svelte";
import mock from "jest-mock-extended/lib/Mock";
import { get } from "svelte/store";
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

  const sendICPSpy = jest.spyOn(ledgerApi, "sendICP");

  const spyOnNotifyParticipation = jest.fn();
  const spyOnToastsShow = jest.spyOn(toastsStore, "toastsShow");
  const spyOnToastsSuccess = jest.spyOn(toastsStore, "toastsSuccess");
  const spyOnToastsError = jest.spyOn(toastsStore, "toastsError");
  const testRootCanisterId = rootCanisterIdMock;
  const testSnsTicket = snsTicketMock({
    rootCanisterId: testRootCanisterId,
    owner: mockPrincipal,
  });
  const testTicket = testSnsTicket.ticket;
  const spyOnGetOpenTicketApi = jest.fn();
  const spyOnNewSaleTicketApi = jest.fn();
  const spyOnNotifyPaymentFailureApi = jest.fn();
  const ticketFromStore = (rootCanisterId = testRootCanisterId) =>
    get(snsTicketsStore)[rootCanisterId.toText()];

  beforeEach(() => {
    spyOnToastsShow.mockClear();
    spyOnToastsError.mockClear();
    spyOnToastsSuccess.mockClear();
    jest.clearAllMocks();

    snsTicketsStore.reset();

    spyOnNewSaleTicketApi.mockResolvedValue(testSnsTicket.ticket);
    spyOnNotifyPaymentFailureApi.mockResolvedValue(undefined);
    jest.spyOn(console, "error").mockReturnValue();
    snsQueryStore.reset();

    jest.spyOn(accountsServices, "syncAccounts").mockResolvedValue();

    jest.spyOn(snsProjectsStore, "subscribe").mockImplementation(
      mockProjectSubscribe([
        {
          ...mockSnsFullProject,
          rootCanisterId: testSnsTicket.rootCanisterId,
        },
      ])
    );

    sendICPSpy.mockResolvedValue(13n);

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
        getOpenTicket: spyOnGetOpenTicketApi,
        newSaleTicket: spyOnNewSaleTicketApi,
        notifyPaymentFailure: spyOnNotifyPaymentFailureApi,
      })
    );

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
        snsTicketsStore.enablePolling(testSnsTicket.rootCanisterId);
        const now = Date.now();
        jest.useFakeTimers().setSystemTime(now);
      });
      it("should call api and load ticket in the store", async () => {
        spyOnGetOpenTicketApi.mockResolvedValue(testSnsTicket.ticket);
        await loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          certified: true,
        });

        expect(spyOnGetOpenTicketApi).toBeCalledTimes(1);
        expect(ticketFromStore(testSnsTicket.rootCanisterId).ticket).toEqual(
          testTicket
        );
      });

      it("should retry until gets an open ticket", async () => {
        // Success in the fourth attempt
        const retriesUntilSuccess = 4;
        spyOnGetOpenTicketApi
          .mockRejectedValueOnce(new Error("network error"))
          .mockRejectedValueOnce(new Error("network error"))
          .mockRejectedValueOnce(new Error("network error"))
          .mockResolvedValue(testSnsTicket.ticket);
        loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          certified: true,
        });

        let counter = 0;
        let retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;
        const extraRetries = 4;
        while (counter < retriesUntilSuccess + extraRetries) {
          expect(spyOnGetOpenTicketApi).toBeCalledTimes(
            Math.min(counter, retriesUntilSuccess)
          );
          counter += 1;
          jest.advanceTimersByTime(retryDelay);
          retryDelay *= 2;

          await waitFor(() =>
            expect(spyOnGetOpenTicketApi).toBeCalledTimes(
              Math.min(counter, retriesUntilSuccess)
            )
          );
        }
        expect(counter).toBe(retriesUntilSuccess + extraRetries);

        await waitFor(() =>
          expect(ticketFromStore(testSnsTicket.rootCanisterId).ticket).toEqual(
            testTicket
          )
        );
        expect(spyOnGetOpenTicketApi).toBeCalledTimes(retriesUntilSuccess);
      });

      it("should stop retrying after max attempts and set ticket to null", async () => {
        const maxAttempts = 10;
        spyOnGetOpenTicketApi.mockRejectedValue(new Error("network error"));
        loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          certified: true,
          maxAttempts,
        });

        let counter = 0;
        let retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;
        while (counter <= maxAttempts) {
          expect(spyOnGetOpenTicketApi).toBeCalledTimes(counter);
          counter += 1;
          jest.advanceTimersByTime(retryDelay);
          retryDelay *= 2;

          await waitFor(() =>
            expect(spyOnGetOpenTicketApi).toBeCalledTimes(
              Math.min(counter, maxAttempts)
            )
          );
        }

        expect(counter).toBe(maxAttempts + 1);
        await waitFor(() =>
          expect(
            ticketFromStore(testSnsTicket.rootCanisterId).ticket
          ).toBeNull()
        );
      });

      it("should call api once if error is known", async () => {
        spyOnGetOpenTicketApi.mockRejectedValue(
          new SnsSwapGetOpenTicketError(GetOpenTicketErrorType.TYPE_SALE_CLOSED)
        );

        await loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          certified: true,
        });

        expect(spyOnGetOpenTicketApi).toBeCalledTimes(1);
      });

      it("should set store to `null` on closed error", async () => {
        spyOnGetOpenTicketApi.mockRejectedValue(
          new SnsSwapGetOpenTicketError(GetOpenTicketErrorType.TYPE_SALE_CLOSED)
        );

        await loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          certified: true,
        });

        expect(
          ticketFromStore(testSnsTicket.rootCanisterId)?.ticket
        ).toBeNull();
      });

      it("should show error on closed", async () => {
        spyOnGetOpenTicketApi.mockRejectedValue(
          new SnsSwapGetOpenTicketError(GetOpenTicketErrorType.TYPE_SALE_CLOSED)
        );

        await loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          certified: true,
        });

        expect(spyOnToastsError).toBeCalledWith(
          expect.objectContaining({
            labelKey: "error__sns.sns_sale_closed",
          })
        );
      });

      it("should set store to `null` on unspecified type error", async () => {
        spyOnGetOpenTicketApi.mockRejectedValue(
          new SnsSwapGetOpenTicketError(GetOpenTicketErrorType.TYPE_UNSPECIFIED)
        );

        await loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          certified: true,
        });

        expect(
          ticketFromStore(testSnsTicket.rootCanisterId)?.ticket
        ).toBeNull();
      });

      it("should show error on unspecified type error", async () => {
        spyOnGetOpenTicketApi.mockRejectedValue(
          new SnsSwapGetOpenTicketError(GetOpenTicketErrorType.TYPE_UNSPECIFIED)
        );

        await loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          certified: true,
        });

        expect(spyOnToastsError).toBeCalledWith(
          expect.objectContaining({
            labelKey: "error__sns.sns_sale_final_error",
          })
        );
      });

      it("should set store to `null` on not open error", async () => {
        spyOnGetOpenTicketApi.mockRejectedValue(
          new SnsSwapGetOpenTicketError(
            GetOpenTicketErrorType.TYPE_SALE_NOT_OPEN
          )
        );

        await loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          certified: true,
        });

        expect(
          ticketFromStore(testSnsTicket.rootCanisterId)?.ticket
        ).toBeNull();
      });

      it("should show error on not open error", async () => {
        spyOnGetOpenTicketApi.mockRejectedValue(
          new SnsSwapGetOpenTicketError(
            GetOpenTicketErrorType.TYPE_SALE_NOT_OPEN
          )
        );

        await loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          certified: true,
        });

        expect(spyOnToastsError).toBeCalledWith(
          expect.objectContaining({
            labelKey: "error__sns.sns_sale_not_open",
          })
        );
      });
    });

    describe("when disabling polling", () => {
      it("should stop retrying", async () => {
        snsTicketsStore.enablePolling(testSnsTicket.rootCanisterId);
        spyOnGetOpenTicketApi.mockRejectedValue(new Error("network error"));
        loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          certified: true,
        });

        let counter = 0;
        let retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;
        const retriesBeforeStopPolling = 4;
        // We loop until 10 advancing time, but the polling should stop after `retriesBeforeStopPolling` + 1
        while (counter < DEFAULT_MAX_POLLING_ATTEMPTS) {
          expect(spyOnGetOpenTicketApi).toBeCalledTimes(
            Math.min(counter, retriesBeforeStopPolling + 1)
          );
          counter += 1;
          jest.advanceTimersByTime(retryDelay);
          retryDelay *= 2;

          await waitFor(() =>
            expect(spyOnGetOpenTicketApi).toBeCalledTimes(
              Math.min(counter, retriesBeforeStopPolling + 1)
            )
          );

          if (counter === retriesBeforeStopPolling) {
            snsTicketsStore.disablePolling(testSnsTicket.rootCanisterId);
          }
        }
        expect(counter).toBe(DEFAULT_MAX_POLLING_ATTEMPTS);

        await waitFor(() =>
          expect(spyOnGetOpenTicketApi).toBeCalledTimes(
            retriesBeforeStopPolling + 1
          )
        );
      });
    });
  });

  describe("newSaleTicket", () => {
    beforeEach(() => {
      jest.clearAllTimers();
      const now = Date.now();
      jest.useFakeTimers().setSystemTime(now);
    });
    it("should call newSaleTicket api", async () => {
      await newSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
    });

    it("should add new ticket to the store", async () => {
      await newSaleTicket({
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

      await newSaleTicket({
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

    it("should reuse the ticket from the ticket-exist error", async () => {
      spyOnNewSaleTicketApi.mockRejectedValue(
        new SnsSwapNewTicketError({
          errorType: NewSaleTicketResponseErrorType.TYPE_TICKET_EXISTS,
          existingTicket: testSnsTicket.ticket,
        })
      );

      await newSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(spyOnToastsError).not.toBeCalled();
      expect(spyOnToastsShow).toBeCalledWith(
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

      await newSaleTicket({
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

      await newSaleTicket({
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

      await newSaleTicket({
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
      const retriesUntilSuccess = 4;
      spyOnNewSaleTicketApi
        .mockRejectedValueOnce(new Error("connection error"))
        .mockRejectedValueOnce(new Error("connection error"))
        .mockRejectedValueOnce(new Error("connection error"))
        .mockResolvedValue(testSnsTicket.ticket);

      newSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      let counter = 0;
      let retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;
      const extraRetries = 4;
      while (counter < retriesUntilSuccess + extraRetries) {
        expect(spyOnNewSaleTicketApi).toBeCalledTimes(
          Math.min(counter, extraRetries)
        );
        counter += 1;
        jest.advanceTimersByTime(retryDelay);
        retryDelay *= 2;

        await waitFor(() =>
          expect(spyOnNewSaleTicketApi).toBeCalledTimes(
            Math.min(counter, extraRetries)
          )
        );
      }
      expect(counter).toBe(retriesUntilSuccess + extraRetries);
      expect(spyOnNewSaleTicketApi).toBeCalledTimes(retriesUntilSuccess);
    });

    it("should retry unknown errors until known error", async () => {
      // Known error on the 4th try
      const retriesUntilKnownError = 4;
      spyOnNewSaleTicketApi
        .mockRejectedValueOnce(new Error("connection error"))
        .mockRejectedValueOnce(new Error("connection error"))
        .mockRejectedValueOnce(new Error("connection error"))
        .mockRejectedValue(
          new SnsSwapNewTicketError({
            errorType: NewSaleTicketResponseErrorType.TYPE_UNSPECIFIED,
          })
        );

      newSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      let counter = 0;
      let retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;
      const extraRetries = 4;
      while (counter < retriesUntilKnownError + extraRetries) {
        expect(spyOnNewSaleTicketApi).toBeCalledTimes(
          Math.min(counter, extraRetries)
        );
        counter += 1;
        jest.advanceTimersByTime(retryDelay);
        retryDelay *= 2;

        await waitFor(() =>
          expect(spyOnNewSaleTicketApi).toBeCalledTimes(
            Math.min(counter, extraRetries)
          )
        );
      }
      expect(counter).toBe(retriesUntilKnownError + extraRetries);
      expect(spyOnNewSaleTicketApi).toBeCalledTimes(retriesUntilKnownError);
    });
  });

  describe("restoreSnsSaleParticipation", () => {
    it("should perform successful participation flow if open ticket", async () => {
      spyOnGetOpenTicketApi.mockResolvedValue(testSnsTicket.ticket);
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const updateProgressSpy = jest.fn().mockResolvedValue(undefined);

      await restoreSnsSaleParticipation({
        rootCanisterId: rootCanisterIdMock,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: updateProgressSpy,
      });

      expect(sendICPSpy).toBeCalledTimes(1);
      expect(postprocessSpy).toBeCalledTimes(1);

      // All steps called
      expect(updateProgressSpy).toBeCalledTimes(4);

      // null after ready
      expect(ticketFromStore().ticket).toEqual(null);
      // no errors
      expect(spyOnToastsError).not.toBeCalled();
    });

    it("should not start flow if no open tickeet", async () => {
      spyOnGetOpenTicketApi.mockResolvedValue(undefined);
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const updateProgressSpy = jest.fn().mockResolvedValue(undefined);
      const startBusySpy = jest
        .spyOn(busyStore, "startBusy")
        .mockImplementation(jest.fn());

      await restoreSnsSaleParticipation({
        rootCanisterId: rootCanisterIdMock,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: updateProgressSpy,
      });

      expect(startBusySpy).not.toBeCalled();
      expect(sendICPSpy).not.toBeCalled();
      expect(postprocessSpy).not.toBeCalled();
      expect(updateProgressSpy).not.toBeCalled();
      expect(ticketFromStore().ticket).toEqual(null);
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
      expect(sendICPSpy).toBeCalledTimes(1);
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
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: testTicket,
      });
      const spyOnSyncAccounts = jest.spyOn(accountsServices, "syncAccounts");
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const upgradeProgressSpy = jest.fn().mockResolvedValue(undefined);

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: upgradeProgressSpy,
      });

      expect(sendICPSpy).toBeCalledTimes(1);
      expect(spyOnNotifyParticipation).toBeCalledTimes(1);
      expect(spyOnNotifyPaymentFailureApi).not.toBeCalled();
      expect(spyOnSyncAccounts).toBeCalledTimes(1);
      expect(ticketFromStore().ticket).toEqual(null);
      expect(postprocessSpy).toBeCalledTimes(1);

      // All steps called
      expect(upgradeProgressSpy).toBeCalledTimes(4);
    });

    it("should poll refresh_buyer_tokens until successful", async () => {
      // Success on the fourth try
      const retriesUntilSuccess = 4;
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: testTicket,
      });
      spyOnNotifyParticipation
        .mockRejectedValueOnce(
          new Error("Error calling method 'account_balance_pb'...")
        )
        .mockRejectedValueOnce(
          new Error("Error calling method 'account_balance_pb'...")
        )
        .mockRejectedValueOnce(
          new Error("Error calling method 'account_balance_pb'...")
        )
        .mockResolvedValue({
          icp_accepted_participation_e8s: 666n,
        });
      jest.spyOn(accountsServices, "syncAccounts");
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const upgradeProgressSpy = jest.fn().mockResolvedValue(undefined);

      participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: upgradeProgressSpy,
      });

      let counter = 0;
      let retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;
      // We add a few more times but it should not trigger more calls
      const extraRetries = 4;
      while (counter < retriesUntilSuccess + extraRetries) {
        expect(spyOnNotifyParticipation).toBeCalledTimes(
          Math.min(counter, retriesUntilSuccess)
        );
        counter += 1;
        jest.advanceTimersByTime(retryDelay);
        retryDelay *= 2;

        await waitFor(() =>
          expect(spyOnNotifyParticipation).toBeCalledTimes(
            Math.min(counter, retriesUntilSuccess)
          )
        );
      }
      expect(counter).toBe(retriesUntilSuccess + extraRetries);

      await waitFor(() => expect(ticketFromStore().ticket).toEqual(null));

      expect(sendICPSpy).toBeCalledTimes(1);
      expect(spyOnNotifyParticipation).toBeCalledTimes(retriesUntilSuccess);
      expect(spyOnNotifyPaymentFailureApi).not.toBeCalled();
      expect(postprocessSpy).toBeCalledTimes(1);

      // All steps called
      expect(upgradeProgressSpy).toBeCalledTimes(4);
    });

    it("should show error if known error is thrown", async () => {
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: testTicket,
      });
      spyOnNotifyParticipation.mockRejectedValue(
        new Error(
          "The token amount can only be refreshed when the canister is in the OPEN state"
        )
      );
      jest.spyOn(accountsServices, "syncAccounts");
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const updateProgressSpy = jest.fn().mockResolvedValue(undefined);

      participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: updateProgressSpy,
      });

      let counter = 0;
      let retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;
      const retriesBeforeSuccess = 4;
      const expectedRetries = 1;
      while (counter < retriesBeforeSuccess) {
        expect(spyOnNotifyParticipation).toBeCalledTimes(
          Math.min(expectedRetries, counter)
        );
        counter += 1;
        jest.advanceTimersByTime(retryDelay);
        retryDelay *= 2;

        await waitFor(() =>
          expect(spyOnNotifyParticipation).toBeCalledTimes(
            Math.min(expectedRetries, counter)
          )
        );
      }
      expect(counter).toBe(retriesBeforeSuccess);
      expect(sendICPSpy).toBeCalledTimes(1);
      expect(spyOnNotifyParticipation).toBeCalledTimes(expectedRetries);
      expect(spyOnNotifyPaymentFailureApi).not.toBeCalled();
      expect(postprocessSpy).not.toBeCalled();

      // Initialization and transfer steps
      expect(updateProgressSpy).toBeCalledTimes(2);
    });

    it("should do nothing if there is no ticket (important for auto retry feature)", async () => {
      snsTicketsStore.setNoTicket(rootCanisterIdMock);
      const spyOnSyncAccounts = jest.spyOn(accountsServices, "syncAccounts");
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const updateProgressSpy = jest.fn().mockResolvedValue(undefined);

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: updateProgressSpy,
      });

      expect(sendICPSpy).not.toBeCalled();
      expect(spyOnNotifyParticipation).not.toBeCalled();
      expect(spyOnNotifyPaymentFailureApi).not.toBeCalled();
      expect(spyOnSyncAccounts).not.toBeCalled();
      expect(postprocessSpy).not.toBeCalled();
      expect(updateProgressSpy).not.toBeCalled();
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
        userCommitment: 0n,
        postprocess: jest.fn().mockResolvedValue(undefined),
        updateProgress: jest.fn().mockResolvedValue(undefined),
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
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: testTicket,
      });
      jest.spyOn(accountsServices, "syncAccounts");
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);
      const updateProgressSpy = jest.fn().mockResolvedValue(undefined);

      // Success on the fourth try
      const retriesUntilSuccess = 4;
      sendICPSpy
        .mockRejectedValueOnce(new Error("Connection error"))
        .mockRejectedValueOnce(
          new TxCreatedInFutureError("Created in future error")
        )
        .mockRejectedValueOnce(new Error("Connection error"))
        .mockResolvedValue(13n);

      participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: updateProgressSpy,
      });

      let counter = 0;
      let retryDelay = SALE_PARTICIPATION_RETRY_SECONDS * 1000;
      // We add a few more times but it should not trigger more calls
      const extraRetries = 4;
      while (counter < retriesUntilSuccess + extraRetries) {
        expect(sendICPSpy).toBeCalledTimes(
          Math.min(counter, retriesUntilSuccess)
        );
        counter += 1;
        jest.advanceTimersByTime(retryDelay);
        retryDelay *= 2;

        await waitFor(() =>
          expect(sendICPSpy).toBeCalledTimes(
            Math.min(counter, retriesUntilSuccess)
          )
        );
      }
      expect(counter).toBe(retriesUntilSuccess + extraRetries);

      await waitFor(() => expect(ticketFromStore().ticket).toEqual(null));

      expect(sendICPSpy).toBeCalledTimes(retriesUntilSuccess);
      expect(postprocessSpy).toBeCalledTimes(1);
      // All steps completed
      expect(updateProgressSpy).toBeCalledTimes(4);
    });

    it("should display transfer api unknown errors", async () => {
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: testTicket,
      });
      sendICPSpy.mockRejectedValue(new TransferError("test"));

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        userCommitment: 0n,
        postprocess: jest.fn().mockResolvedValue(undefined),
        updateProgress: jest.fn().mockResolvedValue(undefined),
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
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: testTicket,
      });
      sendICPSpy.mockRejectedValue(new InsufficientFundsError(0n));

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        userCommitment: 0n,
        postprocess: jest.fn().mockResolvedValue(undefined),
        updateProgress: jest.fn().mockResolvedValue(undefined),
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
        snsTicketsStore.setTicket({
          rootCanisterId: rootCanisterIdMock,
          ticket: testTicket,
        });
        sendICPSpy.mockRejectedValue(new TxTooOldError(0));

        await participateInSnsSale({
          rootCanisterId: testRootCanisterId,
          userCommitment: 0n,
          postprocess: jest.fn().mockResolvedValue(undefined),
          updateProgress: jest.fn().mockResolvedValue(undefined),
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
        sendICPSpy.mockRejectedValue(new TxTooOldError(0));

        await participateInSnsSale({
          rootCanisterId: testRootCanisterId,
          userCommitment: 0n,
          postprocess: jest.fn().mockResolvedValue(undefined),
          updateProgress: jest.fn().mockResolvedValue(undefined),
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
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: testTicket,
      });
      sendICPSpy.mockRejectedValue(new TxDuplicateError(0n));

      expect(spyOnToastsError).not.toBeCalled();

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        userCommitment: 0n,
        postprocess: jest.fn().mockResolvedValue(undefined),
        updateProgress: jest.fn().mockResolvedValue(undefined),
      });

      expect(spyOnNotifyParticipation).toBeCalled();
      expect(spyOnToastsError).not.toBeCalled();
      expect(ticketFromStore().ticket).toEqual(null);
    });

    it("should display a waring when current_committed ≠ ticket.amount", async () => {
      spyOnNotifyParticipation.mockResolvedValue({
        icp_accepted_participation_e8s: 100n,
      });
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: {
          ...testTicket,
          amount_icp_e8s: 1n,
        },
      });
      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        userCommitment: 0n,
        postprocess: jest.fn().mockResolvedValue(undefined),
        updateProgress: jest.fn().mockResolvedValue(undefined),
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
      spyOnNotifyParticipation.mockResolvedValue({
        icp_accepted_participation_e8s: 1n,
      });
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: {
          ...testTicket,
          amount_icp_e8s: 1n,
        },
      });
      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        userCommitment: 0n,
        postprocess: jest.fn().mockResolvedValue(undefined),
        updateProgress: jest.fn().mockResolvedValue(undefined),
      });

      expect(spyOnToastsShow).not.toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_committed_not_equal_to_amount",
        })
      );
    });

    it("should not display a waring when current_committed = ticket.amount for increase participation", async () => {
      spyOnNotifyParticipation.mockResolvedValue({
        icp_accepted_participation_e8s: 10n,
      });
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: {
          ...testTicket,
          amount_icp_e8s: 3n,
        },
      });
      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        userCommitment: 7n,
        postprocess: jest.fn().mockResolvedValue(undefined),
        updateProgress: jest.fn().mockResolvedValue(undefined),
      });

      expect(spyOnToastsShow).not.toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_committed_not_equal_to_amount",
        })
      );
    });
  });
});
