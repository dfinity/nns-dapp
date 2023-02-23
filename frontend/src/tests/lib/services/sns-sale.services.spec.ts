/**
 * @jest-environment jsdom
 */

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
} from "$lib/services/sns-sale.services";
import { authStore } from "$lib/stores/auth.store";
import * as busyStore from "$lib/stores/busy.store";
import { snsTicketsStore } from "$lib/stores/sns-tickets.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import { nanoSecondsToDateTime } from "$lib/utils/date.utils";
import { formatToken } from "$lib/utils/token.utils";
import type { HttpAgent, Identity } from "@dfinity/agent";
import {
  ICPToken,
  InsufficientFundsError,
  LedgerCanister,
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
import {toastsSuccess} from "../../../lib/stores/toasts.store";

jest.mock("$lib/proxy/api.import.proxy");
jest.mock("$lib/api/agent.api", () => {
  return {
    createAgent: () => Promise.resolve(mock<HttpAgent>()),
  };
});

jest.mock("$lib/constants/sns.constants", () => ({
  SALE_PARTICIPATION_RETRY_SECONDS: 1,
}));

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

  const spyOnNotifyParticipation = jest.fn().mockResolvedValue({
    icp_accepted_participation_e8s: 666n,
  });
  const spyOnToastsShow = jest.spyOn(toastsStore, "toastsShow");
  const spyOnToastsSuccess = jest.spyOn(toastsStore, "toastsSuccess");
  const spyOnToastsError = jest.spyOn(toastsStore, "toastsError");
  const ledgerCanisterMock = mock<LedgerCanister>();
  const testRootCanisterId = rootCanisterIdMock;
  const testSnsTicket = snsTicketMock({
    rootCanisterId: testRootCanisterId,
    owner: mockPrincipal,
  });
  const testTicket = testSnsTicket.ticket;
  const spyOnGetOpenTicketApi = jest.fn();
  const spyOnNewSaleTicketApi = jest.fn();
  const ticketFromStore = (rootCanisterId = testRootCanisterId) =>
    get(snsTicketsStore)[rootCanisterId.toText()];

  beforeEach(() => {
    spyOnToastsShow.mockClear();
    spyOnToastsError.mockClear();
    spyOnToastsSuccess.mockClear();
    jest.clearAllMocks();

    snsTicketsStore.reset();

    spyOnGetOpenTicketApi.mockResolvedValue(testSnsTicket.ticket);
    spyOnNewSaleTicketApi.mockResolvedValue(testSnsTicket.ticket);
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

    const ledgerMock = mock<LedgerCanister>();
    ledgerMock.accountBalance.mockResolvedValue(BigInt(100_000_000));
    jest.spyOn(LedgerCanister, "create").mockReturnValue(ledgerMock);

    ledgerCanisterMock.transfer.mockResolvedValue(13n);

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

  describe("loadOpenTicket", () => {
    it("Should load ticket in the store", async () => {
      await loadOpenTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        certified: true,
      });

      expect(spyOnGetOpenTicketApi).toBeCalled();
      expect(ticketFromStore().ticket).toEqual(testTicket);
    });

    it("should display already closed error", async () => {
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
      expect(ticketFromStore()?.ticket).toBeNull();
    });

    it("should display unexpected error on not_closed error", async () => {
      spyOnGetOpenTicketApi.mockRejectedValue(
        new SnsSwapGetOpenTicketError(GetOpenTicketErrorType.TYPE_UNSPECIFIED)
      );

      spyOnGetOpenTicketApi.mockRejectedValue({
        errorType: GetOpenTicketErrorType.TYPE_SALE_NOT_OPEN,
      });

      await loadOpenTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        certified: true,
      });

      expect(ticketFromStore()?.ticket).toBeNull();
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_unexpected_error",
        })
      );
    });
  });

  describe("newSaleTicket", () => {
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

    it("should handle unknown errors", async () => {
      spyOnNewSaleTicketApi.mockRejectedValue(
        new SnsSwapNewTicketError({
          errorType: "dummy type" as unknown as NewSaleTicketResponseErrorType,
        })
      );

      await newSaleTicket({
        rootCanisterId: testSnsTicket.rootCanisterId,
        amount_icp_e8s: 0n,
      });

      expect(spyOnNewSaleTicketApi).toBeCalled();
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_unexpected_error",
        })
      );
      expect(ticketFromStore()?.ticket).toEqual(null);
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
      const startBusySpy = jest
        .spyOn(busyStore, "startBusy")
        .mockImplementation(jest.fn());
      const stopBusySpy = jest
        .spyOn(busyStore, "stopBusy")
        .mockImplementation(jest.fn());

      await initiateSnsSaleParticipation({
        rootCanisterId: rootCanisterIdMock,
        amount: TokenAmount.fromNumber({
          amount: 1,
          token: ICPToken,
        }),
        account,
        postprocess: postprocessSpy,
      });

      expect(startBusySpy).toBeCalledTimes(1);
      expect(spyOnNewSaleTicketApi).toBeCalledTimes(1);
      expect(spyOnNewSaleTicketApi).toBeCalledWith(
        expect.objectContaining({
          amount_icp_e8s: 100000000n,
        })
      );
      expect(ledgerCanisterMock.transfer).toBeCalledTimes(1);
      expect(postprocessSpy).toBeCalledTimes(1);
      expect(stopBusySpy).toBeCalledTimes(1);
      // null after ready
      expect(ticketFromStore().ticket).toEqual(null);
      expect(spyOnToastsSuccess).toBeCalledTimes(1);
      expect(spyOnToastsSuccess).toBeCalledWith(expect.objectContaining({
        labelKey: "sns_project_detail.participate_success",
      }));
      // no errors
      expect(spyOnToastsError).not.toBeCalled();
    });

    it("should handle errors", async () => {
      // remove the sns-project
      jest
        .spyOn(snsProjectsStore, "subscribe")
        .mockImplementation(mockProjectSubscribe([]));

      const startBusySpy = jest
        .spyOn(busyStore, "startBusy")
        .mockImplementation(jest.fn());
      const stopBusySpy = jest
        .spyOn(busyStore, "stopBusy")
        .mockImplementation(jest.fn());
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
        postprocess: jest.fn().mockResolvedValue(undefined),
      });

      expect(startBusySpy).toBeCalledTimes(1);
      expect(spyOnNewSaleTicketApi).not.toBeCalled();
      expect(spyOnToastsError).toBeCalled();
      expect(stopBusySpy).toBeCalledTimes(1);
      // null after ready
      expect(ticketFromStore().ticket).toEqual(null);
    });
  });

  describe("participateInSnsSale", () => {
    it("should call postprocess and APIs", async () => {
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: testTicket,
      });
      const spyOnSyncAccounts = jest.spyOn(accountsServices, "syncAccounts");
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        postprocess: postprocessSpy,
      });

      expect(ledgerCanisterMock.transfer).toBeCalledTimes(1);
      expect(spyOnNotifyParticipation).toBeCalledTimes(1);
      expect(spyOnSyncAccounts).toBeCalledTimes(1);
      expect(ticketFromStore().ticket).toEqual(null);
      expect(postprocessSpy).toBeCalledTimes(1);
    });

    it("should do nothing if there is no ticket (important for auto retry feature)", async () => {
      snsTicketsStore.setNoTicket(rootCanisterIdMock);
      const spyOnSyncAccounts = jest.spyOn(accountsServices, "syncAccounts");
      const postprocessSpy = jest.fn().mockResolvedValue(undefined);

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        postprocess: postprocessSpy,
      });

      expect(ledgerCanisterMock.transfer).not.toBeCalled();
      expect(spyOnNotifyParticipation).not.toBeCalled();
      expect(spyOnSyncAccounts).not.toBeCalled();
      expect(postprocessSpy).not.toBeCalled();
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
        postprocess: jest.fn().mockResolvedValue(undefined),
      });

      expect(spyOnNotifyParticipation).not.toBeCalled();
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_unexpected_error",
        })
      );
      // do not enable the UI
      expect(ticketFromStore().ticket).not.toEqual(null);
    });

    it("should display transfer api errors", async () => {
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: testTicket,
      });
      ledgerCanisterMock.transfer.mockRejectedValue(new TransferError("test"));

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        postprocess: jest.fn().mockResolvedValue(undefined),
      });

      expect(spyOnNotifyParticipation).not.toBeCalled();
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
      ledgerCanisterMock.transfer.mockRejectedValue(
        new InsufficientFundsError(0n)
      );

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        postprocess: jest.fn().mockResolvedValue(undefined),
      });

      expect(spyOnNotifyParticipation).not.toBeCalled();
      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.ledger_insufficient_funds",
        })
      );
      expect(ticketFromStore().ticket).toEqual(null);
    });

    it("should process TooOldError when notify participation succeed", async () => {
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: testTicket,
      });
      ledgerCanisterMock.transfer.mockRejectedValue(new TxTooOldError(0));

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        postprocess: jest.fn().mockResolvedValue(undefined),
      });

      expect(spyOnNotifyParticipation).toBeCalledTimes(1);
      expect(spyOnToastsError).not.toBeCalled();
      expect(spyOnToastsSuccess).toBeCalledTimes(1);
      expect(spyOnToastsSuccess).toBeCalledWith(expect.objectContaining({
        labelKey: "sns_project_detail.participate_success",
      }));
      expect(ticketFromStore().ticket).toEqual(null);
    });

    it("should ignore Duplicate error", async () => {
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: testTicket,
      });
      ledgerCanisterMock.transfer.mockRejectedValue(new TxDuplicateError(0n));

      expect(spyOnToastsError).not.toBeCalled();

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        postprocess: jest.fn().mockResolvedValue(undefined),
      });

      expect(spyOnNotifyParticipation).toBeCalled();
      expect(spyOnToastsError).not.toBeCalled();
      expect(ticketFromStore().ticket).toEqual(null);
    });

    it("should set retry flag on CreatedInFuture error", async () => {
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: testTicket,
      });
      ledgerCanisterMock.transfer.mockRejectedValue(
        new TxCreatedInFutureError()
      );

      expect(spyOnToastsError).not.toBeCalled();

      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        postprocess: jest.fn().mockResolvedValue(undefined),
      });

      expect(spyOnNotifyParticipation).not.toBeCalled();

      await waitFor(() => expect(spyOnToastsShow).toHaveBeenCalledTimes(2), {
        timeout: 2000,
      });

      expect(spyOnToastsShow).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_retry_in",
        })
      );

      // the ticket should stay in the store
      expect(ticketFromStore().ticket).toEqual(testTicket);
    });

    it("should display a waring when current_committed ≠ ticket.amount", async () => {
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: testTicket,
      });
      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        postprocess: jest.fn().mockResolvedValue(undefined),
      });

      expect(spyOnToastsShow).toBeCalledWith(
        expect.objectContaining({
          level: "warn",
          labelKey: "error__sns.sns_sale_committed_not_equal_to_amount",
        })
      );
      expect(ticketFromStore().ticket).toEqual(null);
    });

    it("should display participateInSnsSale errors", async () => {
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: testTicket,
      });
      spyOnNotifyParticipation.mockRejectedValue(new Error());
      await participateInSnsSale({
        rootCanisterId: testRootCanisterId,
        postprocess: jest.fn().mockResolvedValue(undefined),
      });

      expect(spyOnToastsError).toBeCalledWith(
        expect.objectContaining({
          labelKey: "error__sns.sns_sale_unexpected_error",
        })
      );
      expect(ticketFromStore().ticket).toEqual(null);
    });
  });
});
