import * as agentApi from "$lib/api/agent.api";
import * as ledgerApi from "$lib/api/icp-ledger.api";
import { SALE_PARTICIPATION_RETRY_SECONDS } from "$lib/constants/sns.constants";
import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
import { snsProjectsStore } from "$lib/derived/sns/sns-projects.derived";
import {
  cancelPollGetOpenTicket,
  initiateSnsSaleParticipation,
  loadNewSaleTicket,
  loadOpenTicket,
  participateInSnsSale,
  restoreSnsSaleParticipation,
} from "$lib/services/sns-sale.services";
import { authStore } from "$lib/stores/auth.store";
import * as busyStore from "$lib/stores/busy.store";
import { snsTicketsStore } from "$lib/stores/sns-tickets.store";
import { tokensStore } from "$lib/stores/tokens.store";
import {
  mockIdentity,
  mockPrincipal,
  resetIdentity,
} from "$tests/mocks/auth.store.mock";
import {
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
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
  governanceCanisterIdMock,
  ledgerCanisterIdMock,
  swapCanisterIdMock,
} from "$tests/mocks/sns.api.mock";
import { snsTicketMock } from "$tests/mocks/sns.mock";
import {
  resetAccountsForTesting,
  setAccountsForTesting,
} from "$tests/utils/accounts.test-utils";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import type { Agent, Identity } from "@dfinity/agent";
import { toastsStore } from "@dfinity/gix-components";
import {
  InsufficientFundsError,
  TransferError,
  TxCreatedInFutureError,
  TxDuplicateError,
  TxTooOldError,
} from "@dfinity/ledger-icp";
import { Principal } from "@dfinity/principal";
import type { SnsWrapper } from "@dfinity/sns";
import * as dfinitySns from "@dfinity/sns";
import {
  GetOpenTicketErrorType,
  NewSaleTicketResponseErrorType,
  SnsSwapCanister,
  SnsSwapGetOpenTicketError,
  SnsSwapNewTicketError,
} from "@dfinity/sns";
import {
  ICPToken,
  TokenAmount,
  arrayOfNumberToUint8Array,
  toNullable,
} from "@dfinity/utils";
import { get } from "svelte/store";
import { mock } from "vitest-mock-extended";

const identity: Identity | undefined = mockIdentity;
const rootCanisterIdMock = identity.getPrincipal();

const setUpMockSnsProjectStore = ({
  rootCanisterId,
  confirmationText,
}: {
  rootCanisterId: Principal;
  confirmationText?: string | undefined;
}) => {
  vi.spyOn(snsProjectsStore, "subscribe").mockImplementation(
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
        buyer_total_icp_e8s: 1_000_000_000n,
      },
    ],
  };

  let spyOnSendICP;
  const newBalanceE8s = 100_000_000n;
  let spyOnQueryBalance;
  const spyOnNotifyParticipation = vi.fn();
  const testRootCanisterId = rootCanisterIdMock;
  const swapCanisterId = swapCanisterIdMock;
  const testSnsTicket = snsTicketMock({
    rootCanisterId: testRootCanisterId,
    owner: mockPrincipal,
  });
  const testTicket = testSnsTicket.ticket;
  const snsSwapCanister = mock<SnsSwapCanister>();
  const spyOnNewSaleTicketApi = vi.fn();
  const spyOnNotifyPaymentFailureApi = vi.fn();
  const ticketFromStore = (rootCanisterId = testRootCanisterId) =>
    get(snsTicketsStore)[rootCanisterId.toText()];

  beforeEach(() => {
    // Make sure there are no open polling timers
    cancelPollGetOpenTicket();

    vi.useFakeTimers();

    snsTicketsStore.reset();
    resetAccountsForTesting();
    tokensStore.reset();

    vi.spyOn(agentApi, "createAgent").mockImplementation(async () =>
      mock<Agent>()
    );

    spyOnSendICP = vi.spyOn(ledgerApi, "sendICP");
    spyOnQueryBalance = vi.spyOn(ledgerApi, "queryAccountBalance");

    spyOnNewSaleTicketApi.mockResolvedValue(testSnsTicket.ticket);
    spyOnNotifyPaymentFailureApi.mockResolvedValue(undefined);
    vi.spyOn(console, "error").mockReturnValue();
    spyOnQueryBalance.mockResolvedValue(newBalanceE8s);

    setUpMockSnsProjectStore({ rootCanisterId: testSnsTicket.rootCanisterId });

    spyOnSendICP.mockResolvedValue(13n);

    tokensStore.setToken({
      canisterId: rootCanisterIdMock,
      token: mockSnsToken,
      certified: true,
    });

    spyOnNotifyParticipation.mockResolvedValue({
      icp_accepted_participation_e8s: 666n,
    });

    const canisterIds = {
      rootCanisterId: rootCanisterIdMock,
      ledgerCanisterId: ledgerCanisterIdMock,
      governanceCanisterId: governanceCanisterIdMock,
      swapCanisterId: swapCanisterIdMock,
    };

    setSnsProjects([canisterIds]);

    vi.spyOn(dfinitySns, "SnsWrapper").mockReturnValue({
      canisterIds,
      metadata: () =>
        Promise.resolve([mockQueryMetadataResponse, mockQueryTokenResponse]),
      swapState: () => Promise.resolve(mockQuerySwap),
      notifyParticipation: spyOnNotifyParticipation,
      newSaleTicket: spyOnNewSaleTicketApi,
      notifyPaymentFailure: spyOnNotifyPaymentFailureApi,
    } as unknown as SnsWrapper);
    // `getOpenTicket` is mocked from the SnsSwapCanister not the wrapper
    vi.spyOn(SnsSwapCanister, "create").mockImplementation(
      (): SnsSwapCanister => snsSwapCanister
    );

    resetIdentity();
  });

  describe("loadOpenTicket", () => {
    beforeEach(() => {
      snsTicketsStore.reset();
    });

    describe("when polling is enabled", () => {
      beforeEach(() => {
        vi.clearAllTimers();
        const now = Date.now();
        vi.useFakeTimers().setSystemTime(now);
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

        expect(get(toastsStore)).toEqual([]);

        await loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          swapCanisterId: swapCanisterIdMock,
          certified: true,
        });

        expect(get(toastsStore)).toMatchObject([
          {
            level: "error",
            text: "Sorry, the swap was already closed. Please reload the page.",
          },
        ]);
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

        expect(get(toastsStore)).toEqual([]);

        await loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          swapCanisterId: swapCanisterIdMock,
          certified: true,
        });

        expect(get(toastsStore)).toMatchObject([
          {
            level: "error",
            text: "Sorry, there was an unexpected error connection with the SNS swap. Please reload the page and try again.",
          },
        ]);
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

        expect(get(toastsStore)).toEqual([]);

        await loadOpenTicket({
          rootCanisterId: testSnsTicket.rootCanisterId,
          swapCanisterId: swapCanisterIdMock,
          certified: true,
        });

        expect(get(toastsStore)).toMatchObject([
          {
            level: "error",
            text: "Sorry, the swap is not yet open. Please reload the page.",
          },
        ]);
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
            expect(get(toastsStore)).toMatchObject([
              {
                level: "info",
                text: "We're connecting with the SNS swap. This might take more than a minute.",
              },
            ]);
          }
        }
        expect(snsSwapCanister.getOpenTicket).toBeCalledTimes(
          expectFailuresBeforeToast
        );
        expect(get(toastsStore)).toMatchObject([
          {
            level: "info",
            text: "We're connecting with the SNS swap. This might take more than a minute.",
          },
          {
            level: "error",
            text: "The Internet Computer is experiencing high load. We'll keep retrying.",
          },
        ]);
      });
    });

    describe("when disabling polling", () => {
      beforeEach(() => {
        vi.clearAllTimers();
        const now = Date.now();
        vi.useFakeTimers().setSystemTime(now);
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

        expect(get(toastsStore)).toEqual([]);
        await runResolvedPromises();
        expect(get(toastsStore)).toMatchObject([
          {
            level: "info",
            text: "We're connecting with the SNS swap. This might take more than a minute.",
          },
        ]);

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
        expect(get(toastsStore)).toMatchObject([
          {
            level: "info",
            text: "We're connecting with the SNS swap. This might take more than a minute.",
          },
        ]);
        cancelPollGetOpenTicket();

        await runResolvedPromises();
        expect(get(toastsStore)).toEqual([]);
      });
    });
  });

  describe("loadNewSaleTicket ", () => {
    beforeEach(() => {
      vi.clearAllTimers();
      const now = Date.now();
      vi.useFakeTimers().setSystemTime(now);
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

      expect(get(toastsStore)).toEqual([]);

      await loadNewSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "Sorry, the swap was already closed. Please reload the page. ",
        },
      ]);
      expect(ticketFromStore()?.ticket).toEqual(null);
    });

    it("should handle sale-not-open error", async () => {
      spyOnNewSaleTicketApi.mockRejectedValue(
        new SnsSwapNewTicketError({
          errorType: NewSaleTicketResponseErrorType.TYPE_SALE_NOT_OPEN,
        })
      );

      expect(get(toastsStore)).toEqual([]);

      await loadNewSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "Sorry, the swap is not yet open. Please reload the page. ",
        },
      ]);
      expect(ticketFromStore()?.ticket).toEqual(null);
    });

    it("should reuse the ticket from the ticket-exist error", async () => {
      spyOnNewSaleTicketApi.mockRejectedValue(
        new SnsSwapNewTicketError({
          errorType: NewSaleTicketResponseErrorType.TYPE_TICKET_EXISTS,
          existingTicket: testSnsTicket.ticket,
        })
      );

      expect(get(toastsStore)).toEqual([]);

      await loadNewSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "There is an existing participation started at Jan 1, 1970 12:00 AM. Completing that participation.",
        },
      ]);
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

      expect(get(toastsStore)).toEqual([]);

      await loadNewSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "Can't participate with the selected amount. Please participate with a different amount (0.00000123 - 0.00000321).",
        },
      ]);
      expect(ticketFromStore()?.ticket).toEqual(null);
    });

    it("should handle invalid sub-account error", async () => {
      spyOnNewSaleTicketApi.mockRejectedValue(
        new SnsSwapNewTicketError({
          errorType: NewSaleTicketResponseErrorType.TYPE_INVALID_SUBACCOUNT,
        })
      );

      expect(get(toastsStore)).toEqual([]);

      await loadNewSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "Can't participate with the selected subaccount.",
        },
      ]);
      expect(ticketFromStore()?.ticket).toEqual(null);
    });

    it("should handle retry later error", async () => {
      spyOnNewSaleTicketApi.mockRejectedValue(
        new SnsSwapNewTicketError({
          errorType: NewSaleTicketResponseErrorType.TYPE_UNSPECIFIED,
        })
      );

      expect(get(toastsStore)).toEqual([]);

      await loadNewSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "Sorry, there was an unexpected error while participating. Please try again later.",
        },
      ]);
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
          expect(get(toastsStore)).toEqual([]);
        }
      }
      expect(spyOnNewSaleTicketApi).toBeCalledTimes(expectFailuresBeforeToast);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "The Internet Computer is experiencing high load. We'll keep retrying.",
        },
      ]);
    });
  });

  describe("restoreSnsSaleParticipation", () => {
    it("should perform successful participation flow if open ticket", async () => {
      snsSwapCanister.getOpenTicket.mockResolvedValue(testSnsTicket.ticket);
      const postprocessSpy = vi.fn().mockResolvedValue(undefined);
      const updateProgressSpy = vi.fn().mockResolvedValue(undefined);

      expect(get(toastsStore)).toEqual([]);

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
      expect(get(toastsStore)).toMatchObject([
        {
          level: "warn",
          text: "Your total committed: 0.00000666 ICP",
        },
        {
          level: "success",
          text: "Your participation has been successfully committed.",
        },
      ]);
    });

    it("should not start flow if no open ticket", async () => {
      snsSwapCanister.getOpenTicket.mockResolvedValue(undefined);
      const postprocessSpy = vi.fn().mockResolvedValue(undefined);
      const updateProgressSpy = vi.fn().mockResolvedValue(undefined);
      const startBusySpy = vi
        .spyOn(busyStore, "startBusy")
        .mockImplementation(vi.fn());

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
      const postprocessSpy = vi.fn().mockResolvedValue(undefined);
      const updateProgressSpy = vi.fn().mockResolvedValue(undefined);

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
      const postprocessSpy = vi.fn().mockResolvedValue(undefined);
      const updateProgressSpy = vi.fn().mockResolvedValue(undefined);

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
          amount: 1_000_000_000_000n,
          token: ICPToken,
        }),
      };
      const postprocessSpy = vi.fn().mockResolvedValue(undefined);
      const updateProgressSpy = vi.fn().mockResolvedValue(undefined);

      expect(get(toastsStore)).toEqual([]);

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
          amount_icp_e8s: 100_000_000n,
        })
      );
      expect(spyOnSendICP).toBeCalledTimes(1);
      expect(postprocessSpy).toBeCalledTimes(1);
      // All step progress including done
      expect(updateProgressSpy).toBeCalledTimes(5);
      // null after ready
      expect(ticketFromStore().ticket).toEqual(null);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "warn",
          text: "Your total committed: 0.00000666 ICP",
        },
        {
          level: "success",
          text: "Your participation has been successfully committed.",
        },
      ]);
    });

    it("should handle errors", async () => {
      // remove the sns-project
      vi.spyOn(snsProjectsStore, "subscribe").mockImplementation(
        mockProjectSubscribe([])
      );

      const account = {
        ...mockMainAccount,
        balance: TokenAmount.fromE8s({
          amount: 1_000_000_000_000n,
          token: ICPToken,
        }),
      };

      expect(get(toastsStore)).toEqual([]);

      await initiateSnsSaleParticipation({
        rootCanisterId: rootCanisterIdMock,
        amount: TokenAmount.fromNumber({
          amount: 1,
          token: ICPToken,
        }),
        account,
        userCommitment: 0n,
        postprocess: vi.fn().mockResolvedValue(undefined),
        updateProgress: vi.fn().mockResolvedValue(undefined),
      });

      expect(spyOnNewSaleTicketApi).not.toBeCalled();
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "Sorry, the project was not found. Please refresh and try again",
        },
      ]);
      // null after ready
      expect(ticketFromStore().ticket).toEqual(null);
    });
  });

  describe("participateInSnsSale", () => {
    beforeEach(() => {
      vi.clearAllTimers();
      const now = Date.now();
      vi.useFakeTimers().setSystemTime(now);
    });
    it("should call postprocess and APIs", async () => {
      setAccountsForTesting({
        main: mockMainAccount,
      });
      const postprocessSpy = vi.fn().mockResolvedValue(undefined);
      const upgradeProgressSpy = vi.fn().mockResolvedValue(undefined);

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
      setAccountsForTesting({
        main: mockMainAccount,
      });
      const postprocessSpy = vi.fn().mockResolvedValue(undefined);
      const upgradeProgressSpy = vi.fn().mockResolvedValue(undefined);

      expect(get(icpAccountsStore).main.balanceUlps).not.toEqual(newBalanceE8s);

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: upgradeProgressSpy,
        ticket: testTicket,
      });

      expect(get(icpAccountsStore).main.balanceUlps).toEqual(newBalanceE8s);
    });

    it("should update subaccounts's balance in the store", async () => {
      const snsTicket = snsTicketMock({
        rootCanisterId: rootCanisterIdMock,
        owner: mockIdentity.getPrincipal(),
        subaccount: arrayOfNumberToUint8Array(mockSubAccount.subAccount),
      });
      setAccountsForTesting({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
      });
      const postprocessSpy = vi.fn().mockResolvedValue(undefined);
      const upgradeProgressSpy = vi.fn().mockResolvedValue(undefined);

      expect(get(icpAccountsStore).main.balanceUlps).not.toEqual(newBalanceE8s);

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: postprocessSpy,
        updateProgress: upgradeProgressSpy,
        ticket: snsTicket.ticket,
      });

      expect(get(icpAccountsStore).subAccounts[0].balanceUlps).toEqual(
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
      const postprocessSpy = vi.fn().mockResolvedValue(undefined);
      const upgradeProgressSpy = vi.fn().mockResolvedValue(undefined);

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

      const postprocessSpy = vi.fn().mockResolvedValue(undefined);
      const upgradeProgressSpy = vi.fn().mockResolvedValue(undefined);

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

      const postprocessSpy = vi.fn().mockResolvedValue(undefined);
      const upgradeProgressSpy = vi.fn().mockResolvedValue(undefined);

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
      const postprocessSpy = vi.fn().mockResolvedValue(undefined);
      const updateProgressSpy = vi.fn().mockResolvedValue(undefined);

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
      authStore.setForTesting({
        ...mockIdentity,
        getPrincipal: () => Principal.fromText("aaaaa-aa"),
      });

      expect(get(toastsStore)).toEqual([]);

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: vi.fn().mockResolvedValue(undefined),
        updateProgress: vi.fn().mockResolvedValue(undefined),
        ticket: testTicket,
      });

      expect(spyOnNotifyParticipation).not.toBeCalled();
      expect(spyOnNotifyPaymentFailureApi).not.toBeCalled();
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "Sorry, There was an unexpected error while participating. Please refresh the page and try again.",
        },
      ]);
      // do not enable the UI
      expect(ticketFromStore().ticket).not.toEqual(null);
    });

    it("should poll transfer during unknown issues or TxCreatedInFutureError", async () => {
      const postprocessSpy = vi.fn().mockResolvedValue(undefined);
      const updateProgressSpy = vi.fn().mockResolvedValue(undefined);

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

      expect(get(toastsStore)).toEqual([]);

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: vi.fn().mockResolvedValue(undefined),
        updateProgress: vi.fn().mockResolvedValue(undefined),
        ticket: testTicket,
      });

      expect(spyOnNotifyParticipation).not.toBeCalled();
      expect(spyOnNotifyPaymentFailureApi).not.toBeCalled();
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "Sorry, There was an unexpected error while participating. Please refresh the page and try again. test",
        },
      ]);
      expect(ticketFromStore().ticket).toEqual(null);
    });

    it("should display InsufficientFundsError errors", async () => {
      spyOnSendICP.mockRejectedValue(new InsufficientFundsError(0n));

      expect(get(toastsStore)).toEqual([]);

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: vi.fn().mockResolvedValue(undefined),
        updateProgress: vi.fn().mockResolvedValue(undefined),
        ticket: testTicket,
      });

      expect(spyOnNotifyParticipation).not.toBeCalled();
      expect(spyOnNotifyPaymentFailureApi).toBeCalledTimes(1);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "Sorry, the account doesn't have enough funds for this transaction. ",
        },
      ]);
      expect(ticketFromStore().ticket).toEqual(null);
    });

    describe("TooOldError", () => {
      it("should succeed when no errors on notify participation", async () => {
        spyOnSendICP.mockRejectedValue(new TxTooOldError(0));

        expect(get(toastsStore)).toEqual([]);

        await participateInSnsSale({
          rootCanisterId: testRootCanisterId,
          swapCanisterId,
          userCommitment: 0n,
          postprocess: vi.fn().mockResolvedValue(undefined),
          updateProgress: vi.fn().mockResolvedValue(undefined),
          ticket: testTicket,
        });

        expect(spyOnNotifyParticipation).toBeCalledTimes(1);
        expect(spyOnNotifyPaymentFailureApi).not.toBeCalled();
        expect(get(toastsStore)).toMatchObject([
          {
            level: "warn",
            text: "Your total committed: 0.00000666 ICP",
          },
          {
            level: "success",
            text: "Your participation has been successfully committed.",
          },
        ]);
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

        expect(get(toastsStore)).toEqual([]);

        await participateInSnsSale({
          rootCanisterId: testRootCanisterId,
          swapCanisterId,
          userCommitment: 0n,
          postprocess: vi.fn().mockResolvedValue(undefined),
          updateProgress: vi.fn().mockResolvedValue(undefined),
          ticket: testTicket,
        });

        expect(spyOnNotifyParticipation).toBeCalledTimes(1);
        expect(spyOnNotifyPaymentFailureApi).toBeCalledTimes(1);
        expect(get(toastsStore)).toMatchObject([
          {
            level: "error",
            text: "Sorry, There was an unexpected error while participating. Please refresh and try again The token amount can only be refreshed when the canister is in the OPEN state",
          },
        ]);
        // the button/increase_participation should not be enabled
        expect(ticketFromStore().ticket).not.toBeNull();
      });
    });

    it("should ignore Duplicate error", async () => {
      spyOnSendICP.mockRejectedValue(new TxDuplicateError(0n));

      expect(get(toastsStore)).toEqual([]);

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: vi.fn().mockResolvedValue(undefined),
        updateProgress: vi.fn().mockResolvedValue(undefined),
        ticket: testTicket,
      });

      expect(spyOnNotifyParticipation).toBeCalled();
      expect(get(toastsStore)).toMatchObject([
        {
          level: "warn",
          text: "Your total committed: 0.00000666 ICP",
        },
        {
          level: "success",
          text: "Your participation has been successfully committed.",
        },
      ]);
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
      expect(get(toastsStore)).toEqual([]);
      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: vi.fn().mockResolvedValue(undefined),
        updateProgress: vi.fn().mockResolvedValue(undefined),
        ticket,
      });

      expect(get(toastsStore)).toMatchObject([
        {
          level: "warn",
          text: "Your total committed: 0.000001 ICP",
        },
        {
          level: "success",
          text: "Your participation has been successfully committed.",
        },
      ]);
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
      expect(get(toastsStore)).toEqual([]);
      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 0n,
        postprocess: vi.fn().mockResolvedValue(undefined),
        updateProgress: vi.fn().mockResolvedValue(undefined),
        ticket,
      });

      expect(get(toastsStore)).toMatchObject([
        {
          level: "success",
          text: "Your participation has been successfully committed.",
        },
      ]);
    });

    it("should not display a waring when current_committed = ticket.amount for increase participation", async () => {
      const ticket = {
        ...testTicket,
        amount_icp_e8s: 3n,
      };
      spyOnNotifyParticipation.mockResolvedValue({
        icp_accepted_participation_e8s: 10n,
      });
      expect(get(toastsStore)).toEqual([]);
      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        swapCanisterId,
        userCommitment: 7n,
        postprocess: vi.fn().mockResolvedValue(undefined),
        updateProgress: vi.fn().mockResolvedValue(undefined),
        ticket,
      });

      expect(get(toastsStore)).toMatchObject([
        {
          level: "success",
          text: "Your participation has been successfully committed.",
        },
      ]);
    });

    it("should show 'high load' toast after 6 failures", async () => {
      const expectFailuresBeforeToast = 6;
      spyOnNotifyParticipation.mockRejectedValue(new Error("network error"));
      const postprocessSpy = vi.fn().mockResolvedValue(undefined);
      const upgradeProgressSpy = vi.fn().mockResolvedValue(undefined);
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
          expect(get(toastsStore)).toEqual([]);
        }
      }
      expect(spyOnNotifyParticipation).toBeCalledTimes(
        expectFailuresBeforeToast
      );
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "The Internet Computer is experiencing high load. We'll keep retrying.",
        },
      ]);
    });

    it("transfer should show 'high load' toast after 6 failures", async () => {
      const expectFailuresBeforeToast = 6;
      spyOnSendICP.mockRejectedValue(new Error("network error"));
      const postprocessSpy = vi.fn().mockResolvedValue(undefined);
      const upgradeProgressSpy = vi.fn().mockResolvedValue(undefined);
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
          expect(get(toastsStore)).toEqual([]);
        }
      }
      expect(spyOnSendICP).toBeCalledTimes(expectFailuresBeforeToast);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "The Internet Computer is experiencing high load. We'll keep retrying.",
        },
      ]);
    });
  });
});
