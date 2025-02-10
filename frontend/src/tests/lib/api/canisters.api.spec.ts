import {
  attachCanister,
  createCanister,
  detachCanister,
  getIcpToCyclesExchangeRate,
  notifyAndAttachCanister,
  notifyTopUpCanister,
  queryCanisterDetails,
  queryCanisters,
  renameCanister,
  topUpCanister,
  updateSettings,
} from "$lib/api/canisters.api";
import { ICManagementCanister } from "$lib/canisters/ic-management/ic-management.canister";
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import { NameTooLongError } from "$lib/canisters/nns-dapp/nns-dapp.errors";
import {
  CREATE_CANISTER_MEMO,
  TOP_UP_CANISTER_MEMO,
} from "$lib/constants/api.constants";
import { CYCLES_MINTING_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { MAX_CANISTER_NAME_LENGTH } from "$lib/constants/canisters.constants";
import { nowInBigIntNanoSeconds } from "$lib/utils/date.utils";
import { mockCreateAgent } from "$tests/mocks/agent.mock";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCanisterDetails,
  mockCanisterSettings,
} from "$tests/mocks/canisters.mock";
import { mockSubAccount } from "$tests/mocks/icp-accounts.store.mock";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { CMCCanister, ProcessingError } from "@dfinity/cmc";
import {
  AccountIdentifier,
  LedgerCanister,
  SubAccount,
} from "@dfinity/ledger-icp";
import { Principal } from "@dfinity/principal";
import * as dfinityUtils from "@dfinity/utils";
import { principalToSubAccount } from "@dfinity/utils";
import { mock } from "vitest-mock-extended";

describe("canisters-api", () => {
  const mockNNSDappCanister = mock<NNSDappCanister>();
  const mockCMCCanister = mock<CMCCanister>();
  const mockICManagementCanister = mock<ICManagementCanister>();
  const mockLedgerCanister = mock<LedgerCanister>();
  const fee = 10_000n;

  beforeEach(() => {
    // Prevent HttpAgent.create(), which is called by createAgent, from making a
    // real network request via agent.syncTime().
    vi.spyOn(dfinityUtils, "createAgent").mockImplementation(mockCreateAgent);

    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const now = Date.now();
    vi.useFakeTimers().setSystemTime(now);

    vi.spyOn(NNSDappCanister, "create").mockImplementation(
      (): NNSDappCanister => mockNNSDappCanister
    );

    vi.spyOn(CMCCanister, "create").mockImplementation(() => mockCMCCanister);

    vi.spyOn(ICManagementCanister, "create").mockImplementation(
      () => mockICManagementCanister
    );

    vi.spyOn(LedgerCanister, "create").mockImplementation(
      () => mockLedgerCanister
    );
  });

  describe("queryCanisters", () => {
    it("should call the canister to list the canisters 🤪", async () => {
      await queryCanisters({ identity: mockIdentity, certified: true });

      expect(mockNNSDappCanister.getCanisters).toHaveReturnedTimes(1);
    });
  });

  describe("attachCanister", () => {
    it("should call the nns dapp canister to attach the canister id", async () => {
      expect(mockNNSDappCanister.attachCanister).not.toBeCalled();
      await attachCanister({
        identity: mockIdentity,
        canisterId: mockCanisterDetails.id,
        name: "test name",
      });

      expect(mockNNSDappCanister.attachCanister).toBeCalledTimes(1);
    });

    it("should call the nns dapp canister to attach the canister id with empty string as name when not present", async () => {
      expect(mockNNSDappCanister.attachCanister).not.toBeCalled();
      await attachCanister({
        identity: mockIdentity,
        canisterId: mockCanisterDetails.id,
      });

      expect(mockNNSDappCanister.attachCanister).toBeCalledTimes(1);
      expect(mockNNSDappCanister.attachCanister).toBeCalledWith({
        canisterId: mockCanisterDetails.id,
        name: "",
      });
    });

    it("should fail to attach if name is longer than max", async () => {
      const longName = "a".repeat(MAX_CANISTER_NAME_LENGTH + 1);
      expect(mockNNSDappCanister.attachCanister).not.toBeCalled();
      const call = () =>
        attachCanister({
          identity: mockIdentity,
          canisterId: mockCanisterDetails.id,
          name: longName,
        });

      await expect(call).rejects.toThrowError(
        new NameTooLongError("error__canister.name_too_long", {
          $name: longName,
        })
      );
      expect(mockNNSDappCanister.attachCanister).not.toBeCalled();
    });
  });

  describe("renameCanister", () => {
    it("should call the nns dapp canister to rename the canister", async () => {
      await renameCanister({
        identity: mockIdentity,
        canisterId: mockCanisterDetails.id,
        name: "test name",
      });

      expect(mockNNSDappCanister.renameCanister).toBeCalled();
    });

    it("should fail to rename if name is longer than max", async () => {
      const longName = "a".repeat(MAX_CANISTER_NAME_LENGTH + 1);
      const call = () =>
        renameCanister({
          identity: mockIdentity,
          canisterId: mockCanisterDetails.id,
          name: longName,
        });

      await expect(call).rejects.toThrowError(
        new NameTooLongError("error__canister.name_too_long", {
          $name: longName,
        })
      );
      expect(mockNNSDappCanister.renameCanister).not.toBeCalled();
    });
  });

  describe("updateSettings", () => {
    it("should call the ic management canister to update settings", async () => {
      mockICManagementCanister.updateSettings.mockResolvedValue(undefined);
      await updateSettings({
        identity: mockIdentity,
        canisterId: mockCanisterDetails.id,
        settings: mockCanisterSettings,
      });

      expect(mockICManagementCanister.updateSettings).toBeCalled();
    });

    it("should call the ic management canister to update settings with partial settings", async () => {
      const settings = {
        controllers: [
          "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe",
        ],
      };
      mockICManagementCanister.updateSettings.mockResolvedValue(undefined);
      await updateSettings({
        identity: mockIdentity,
        canisterId: mockCanisterDetails.id,
        settings,
      });

      expect(mockICManagementCanister.updateSettings).toBeCalled();
    });
  });

  describe("detachCanister", () => {
    it("should call the nns dapp canister to detach the canister id", async () => {
      await detachCanister({
        identity: mockIdentity,
        canisterId: mockCanisterDetails.id,
      });

      expect(mockNNSDappCanister.detachCanister).toBeCalled();
    });
  });

  describe("queryCanisterDetails", () => {
    it("should call IC Management Canister with canister id", async () => {
      mockICManagementCanister.getCanisterDetails.mockResolvedValue(
        mockCanisterDetails
      );

      const response = await queryCanisterDetails({
        identity: mockIdentity,
        canisterId: mockCanisterDetails.id,
      });
      expect(mockICManagementCanister.getCanisterDetails).toBeCalledWith(
        mockCanisterDetails.id
      );
      expect(response).toEqual(mockCanisterDetails);
    });
  });

  describe("getIcpToCyclesExchangeRate", () => {
    it("should call CMC to get conversion rate", async () => {
      mockCMCCanister.getIcpToCyclesConversionRate.mockResolvedValue(10_000n);

      const response = await getIcpToCyclesExchangeRate(mockIdentity);
      expect(mockCMCCanister.getIcpToCyclesConversionRate).toBeCalledWith({
        certified: true,
      });
      expect(response).toEqual(10_000n);
    });
  });

  describe("createCanister", () => {
    it("should make a transfer, notify and attach the canister", async () => {
      const blockIndex = 10n;
      mockLedgerCanister.transfer.mockResolvedValue(blockIndex);
      mockCMCCanister.notifyCreateCanister.mockResolvedValue(
        mockCanisterDetails.id
      );

      const response = await createCanister({
        identity: mockIdentity,
        amount: 300_000_000n,
        fee,
      });
      expect(mockLedgerCanister.transfer).toBeCalled();
      expect(mockCMCCanister.notifyCreateCanister).toBeCalled();
      expect(mockNNSDappCanister.attachCanister).toBeCalledWith({
        name: "",
        canisterId: mockCanisterDetails.id,
        blockIndex,
      });
      expect(response).toEqual(mockCanisterDetails.id);
    });

    it("should attach the canister if name max length", async () => {
      const blockIndex = 10n;
      mockLedgerCanister.transfer.mockResolvedValue(blockIndex);
      mockCMCCanister.notifyCreateCanister.mockResolvedValue(
        mockCanisterDetails.id
      );

      const longName = "a".repeat(MAX_CANISTER_NAME_LENGTH);
      const response = await createCanister({
        identity: mockIdentity,
        amount: 300_000_000n,
        name: longName,
        fee,
      });
      expect(mockNNSDappCanister.attachCanister).toBeCalledWith({
        name: longName,
        canisterId: mockCanisterDetails.id,
        blockIndex,
      });
      expect(response).toEqual(mockCanisterDetails.id);
    });

    it("should notify twice if the first call returns Processing", async () => {
      mockLedgerCanister.transfer.mockResolvedValue(10n);
      mockCMCCanister.notifyCreateCanister
        .mockRejectedValueOnce(new ProcessingError())
        .mockResolvedValue(mockCanisterDetails.id);

      const responsePromise = createCanister({
        identity: mockIdentity,
        amount: 300_000_000n,
        fee,
      });
      await advanceTime();
      expect(mockCMCCanister.notifyCreateCanister).toHaveBeenCalledTimes(2);
      expect(await responsePromise).toEqual(mockCanisterDetails.id);
    });

    it("handles creating from subaccounts", async () => {
      const blockIndex = 10n;
      mockLedgerCanister.transfer.mockResolvedValue(blockIndex);
      mockCMCCanister.notifyCreateCanister.mockResolvedValue(
        mockCanisterDetails.id
      );
      const amount = 300_000_000n;

      const response = await createCanister({
        identity: mockIdentity,
        amount,
        fromSubAccount: mockSubAccount.subAccount,
        fee,
      });
      const principal = mockIdentity.getPrincipal();
      const toSubAccount = principalToSubAccount(principal);
      // To create a canister you need to send ICP to an account owned by the CMC, so that the CMC can burn those funds.
      // To ensure everyone uses a unique address, the intended controller of the new canister is used to calculate the subaccount.
      const recipient = AccountIdentifier.fromPrincipal({
        principal: CYCLES_MINTING_CANISTER_ID,
        subAccount: SubAccount.fromBytes(toSubAccount) as SubAccount,
      });
      expect(mockLedgerCanister.transfer).toBeCalledWith({
        memo: CREATE_CANISTER_MEMO,
        to: AccountIdentifier.fromHex(recipient.toHex()),
        amount,
        fromSubAccount: mockSubAccount.subAccount,
        createdAt: nowInBigIntNanoSeconds(),
        fee,
      });
      expect(mockCMCCanister.notifyCreateCanister).toBeCalled();
      expect(mockNNSDappCanister.attachCanister).toBeCalledWith({
        name: "",
        canisterId: mockCanisterDetails.id,
        blockIndex,
      });
      expect(response).toEqual(mockCanisterDetails.id);
    });

    it("should not attach canister, nor notify if transfer fails", async () => {
      mockLedgerCanister.transfer.mockRejectedValue(new Error());

      const call = () =>
        createCanister({
          identity: mockIdentity,
          amount: 300_000_000n,
          fee,
        });
      await expect(call).rejects.toThrow();
      expect(mockCMCCanister.notifyCreateCanister).not.toBeCalled();
      expect(mockNNSDappCanister.attachCanister).not.toBeCalled();
    });

    it("should fail to create if name is longer than max", async () => {
      const longName = "a".repeat(MAX_CANISTER_NAME_LENGTH + 1);
      const call = () =>
        createCanister({
          identity: mockIdentity,
          amount: 300_000_000n,
          name: longName,
          fee,
        });

      await expect(call).rejects.toThrowError(
        new NameTooLongError("error__canister.name_too_long", {
          $name: longName,
        })
      );
      expect(mockCMCCanister.notifyCreateCanister).not.toBeCalled();
      expect(mockNNSDappCanister.attachCanister).not.toBeCalled();
    });
  });

  describe("notifyAndAttachCanister", () => {
    it("should notify the CMC and attach the canister", async () => {
      const blockIndex = 10n;
      mockCMCCanister.notifyCreateCanister.mockResolvedValue(
        mockCanisterDetails.id
      );

      const response = await notifyAndAttachCanister({
        identity: mockIdentity,
        blockIndex,
      });
      expect(mockCMCCanister.notifyCreateCanister).toBeCalledWith({
        block_index: blockIndex,
        controller: mockIdentity.getPrincipal(),
        settings: [],
        subnet_selection: [],
        subnet_type: [],
      });
      expect(mockCMCCanister.notifyCreateCanister).toBeCalledTimes(1);
      expect(mockNNSDappCanister.attachCanister).toBeCalledWith({
        name: "",
        canisterId: mockCanisterDetails.id,
        blockIndex,
      });
      expect(response).toEqual(mockCanisterDetails.id);
    });

    it("should notify twice if the first call returns Processing", async () => {
      const blockIndex = 10n;
      mockCMCCanister.notifyCreateCanister
        .mockRejectedValueOnce(new ProcessingError())
        .mockResolvedValue(mockCanisterDetails.id);

      const responsePromise = notifyAndAttachCanister({
        identity: mockIdentity,
        blockIndex,
      });

      await runResolvedPromises();
      const expectedNotifyParams = {
        block_index: blockIndex,
        controller: mockIdentity.getPrincipal(),
        settings: [],
        subnet_selection: [],
        subnet_type: [],
      };
      expect(mockCMCCanister.notifyCreateCanister).toBeCalledTimes(1);
      expect(mockCMCCanister.notifyCreateCanister).toHaveBeenNthCalledWith(
        1,
        expectedNotifyParams
      );
      await advanceTime();

      expect(mockCMCCanister.notifyCreateCanister).toBeCalledTimes(2);
      expect(mockCMCCanister.notifyCreateCanister).toHaveBeenNthCalledWith(
        2,
        expectedNotifyParams
      );
      expect(mockNNSDappCanister.attachCanister).toBeCalledWith({
        name: "",
        canisterId: mockCanisterDetails.id,
        blockIndex,
      });
      expect(await responsePromise).toEqual(mockCanisterDetails.id);
    });
  });

  describe("topUpCanister", () => {
    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(global, "setTimeout").mockImplementation((cb: any) => cb());
      // Avoid to print errors during test
      vi.spyOn(console, "log").mockImplementation(() => undefined);
    });

    it("should make a transfer and notify", async () => {
      mockLedgerCanister.transfer.mockResolvedValue(10n);
      mockCMCCanister.notifyTopUp.mockResolvedValue(10n);

      await topUpCanister({
        identity: mockIdentity,
        amount: 300_000_000n,
        canisterId: mockCanisterDetails.id,
        fee,
      });
      expect(mockLedgerCanister.transfer).toBeCalled();
      expect(mockCMCCanister.notifyTopUp).toBeCalled();
    });

    it("should notify twice if the first returns ProcessingError", async () => {
      mockLedgerCanister.transfer.mockResolvedValue(10n);
      mockCMCCanister.notifyTopUp
        .mockRejectedValueOnce(new ProcessingError())
        .mockResolvedValue(10n);

      await topUpCanister({
        identity: mockIdentity,
        amount: 300_000_000n,
        canisterId: mockCanisterDetails.id,
        fee,
      });
      expect(mockCMCCanister.notifyTopUp).toHaveBeenCalledTimes(2);
    });

    it("should make a transfer from subaccounts", async () => {
      mockLedgerCanister.transfer.mockResolvedValue(10n);
      mockCMCCanister.notifyTopUp.mockResolvedValue(10n);

      const toSubAccount = principalToSubAccount(mockCanisterDetails.id);
      // To create a canister you need to send ICP to an account owned by the CMC, so that the CMC can burn those funds.
      // To ensure everyone uses a unique address, the intended controller of the new canister is used to calculate the subaccount.
      const recipient = AccountIdentifier.fromPrincipal({
        principal: CYCLES_MINTING_CANISTER_ID,
        subAccount: SubAccount.fromBytes(toSubAccount) as SubAccount,
      });

      const amount = 300_000_000n;
      await topUpCanister({
        identity: mockIdentity,
        amount,
        canisterId: mockCanisterDetails.id,
        fromSubAccount: mockSubAccount.subAccount,
        fee,
      });

      expect(mockLedgerCanister.transfer).toBeCalledWith({
        memo: TOP_UP_CANISTER_MEMO,
        to: AccountIdentifier.fromHex(recipient.toHex()),
        amount,
        fromSubAccount: mockSubAccount.subAccount,
        createdAt: nowInBigIntNanoSeconds(),
        fee,
      });
      expect(mockLedgerCanister.transfer).toBeCalled();
      expect(mockCMCCanister.notifyTopUp).toBeCalled();
    });

    it("should not notify if transfer fails", async () => {
      mockLedgerCanister.transfer.mockRejectedValue(new Error());

      const call = () =>
        topUpCanister({
          identity: mockIdentity,
          amount: 300_000_000n,
          canisterId: mockCanisterDetails.id,
          fee,
        });
      await expect(call).rejects.toThrow();
      expect(mockCMCCanister.notifyTopUp).not.toBeCalled();
    });
  });

  describe("notifyTopUpCanister", () => {
    const canisterId = Principal.fromText("mkam6-f4aaa-aaaaa-qablq-cai");

    it("should call cmc.notifyTopUp", async () => {
      const cycles = 3_000_000_000_000n;
      const blockHeight = 14545n;

      mockCMCCanister.notifyTopUp.mockResolvedValue(cycles);

      const call = () =>
        notifyTopUpCanister({
          identity: mockIdentity,
          blockHeight,
          canisterId,
        });

      await expect(call()).resolves.toBe(cycles);

      expect(mockCMCCanister.notifyTopUp).toBeCalledTimes(1);
      expect(mockCMCCanister.notifyTopUp).toBeCalledWith({
        canister_id: canisterId,
        block_index: blockHeight,
      });
    });
  });
});
