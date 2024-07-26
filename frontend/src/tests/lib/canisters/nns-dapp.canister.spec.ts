import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import {
  AccountNotFoundError,
  CanisterAlreadyAttachedError,
  CanisterLimitExceededError,
  CanisterNameAlreadyTakenError,
  CanisterNameTooLongError,
  CanisterNotFoundError,
  HardwareWalletAttachError,
  NameTooLongError,
  ProposalPayloadNotFoundError,
  ProposalPayloadTooLargeError,
  SubAccountLimitExceededError,
  TooManyImportedTokensError,
  UnknownProposalPayloadError,
} from "$lib/canisters/nns-dapp/nns-dapp.errors";
import type { NNSDappService } from "$lib/canisters/nns-dapp/nns-dapp.idl";
import type {
  CreateSubAccountResponse,
  GetAccountResponse,
  GetImportedTokensResponse,
  SetImportedTokensResponse,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockCanister, mockCanisters } from "$tests/mocks/canisters.mock";
import {
  mockAccountDetails,
  mockSubAccountDetails,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockImportedToken } from "$tests/mocks/icrc-accounts.mock";
import type { HttpAgent } from "@dfinity/agent";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { Principal } from "@dfinity/principal";
import { mock } from "vitest-mock-extended";

describe("NNSDapp", () => {
  const createNnsDapp = async (service: NNSDappService) => {
    const canisterId = Principal.fromText("aaaaa-aa");

    return NNSDappCanister.create({
      agent: mock<HttpAgent>(),
      certifiedServiceOverride: service,
      canisterId,
    });
  };

  describe("NNSDapp.addAccount", () => {
    it("returns account identifier when success", async () => {
      const response =
        "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f";
      const service = mock<NNSDappService>();
      service.add_account.mockResolvedValue(response);

      const nnsDapp = await createNnsDapp(service);

      const res = await nnsDapp.addAccount();

      expect(res).toEqual(AccountIdentifier.fromHex(response));
    });
  });

  describe("NNSDapp.getAccount", () => {
    it("returns account details when success", async () => {
      const response: GetAccountResponse = {
        Ok: mockAccountDetails,
      };
      const service = mock<NNSDappService>();
      service.get_account.mockResolvedValue(response);

      const nnsDapp = await createNnsDapp(service);

      const res = await nnsDapp.getAccount({ certified: true });

      expect(res).toEqual(mockAccountDetails);
    });

    it("throws error if account not found", async () => {
      const response: GetAccountResponse = {
        AccountNotFound: null,
      };
      const service = mock<NNSDappService>();
      service.get_account.mockResolvedValue(response);

      const nnsDapp = await createNnsDapp(service);

      const call = async () => nnsDapp.getAccount({ certified: true });

      await expect(call).rejects.toThrow(AccountNotFoundError);
    });
  });

  describe("NNSDapp.createSubAccount", () => {
    it("returns subaccount details when success", async () => {
      const response: CreateSubAccountResponse = {
        Ok: mockSubAccountDetails,
      };
      const service = mock<NNSDappService>();
      service.create_sub_account.mockResolvedValue(response);

      const nnsDapp = await createNnsDapp(service);

      const res = await nnsDapp.createSubAccount({
        subAccountName: mockSubAccountDetails.name,
      });

      expect(res).toEqual(mockSubAccountDetails);
    });

    it("throws error if name too long", async () => {
      const response: CreateSubAccountResponse = {
        NameTooLong: null,
      };
      const service = mock<NNSDappService>();
      service.create_sub_account.mockResolvedValue(response);

      const nnsDapp = await createNnsDapp(service);

      const call = async () =>
        nnsDapp.createSubAccount({ subAccountName: "testSubaccount" });

      await expect(call).rejects.toThrow(NameTooLongError);
    });

    it("throws error if subaccount limit reached", async () => {
      const response: CreateSubAccountResponse = {
        SubAccountLimitExceeded: null,
      };
      const service = mock<NNSDappService>();
      service.create_sub_account.mockResolvedValue(response);

      const nnsDapp = await createNnsDapp(service);

      const call = async () =>
        nnsDapp.createSubAccount({ subAccountName: "testSubaccount" });

      await expect(call).rejects.toThrow(SubAccountLimitExceededError);
    });

    it("throws error if account not found", async () => {
      const response: CreateSubAccountResponse = {
        AccountNotFound: null,
      };
      const service = mock<NNSDappService>();
      service.create_sub_account.mockResolvedValue(response);

      const nnsDapp = await createNnsDapp(service);

      const call = async () =>
        nnsDapp.createSubAccount({ subAccountName: "testSubaccount" });

      await expect(call).rejects.toThrow(AccountNotFoundError);
    });
  });

  describe("NNSDapp.getCanisters", () => {
    it("should return canisters", async () => {
      const service = mock<NNSDappService>();
      service.get_canisters.mockResolvedValue(mockCanisters);

      const nnsDapp = await createNnsDapp(service);

      const res = await nnsDapp.getCanisters({ certified: true });

      expect(res).toEqual(mockCanisters);
    });
  });

  describe("NNSDapp.registerHardwareWallet", () => {
    it("should register hardware wallet", async () => {
      const service = mock<NNSDappService>();
      service.register_hardware_wallet.mockResolvedValue({ Ok: null });

      const nnsDapp = await createNnsDapp(service);

      const call = async () =>
        await nnsDapp.registerHardwareWallet({
          name: "test",
          principal: mockPrincipal,
        });

      expect(async () => await call()).not.toThrow();
    });

    const testError = async (params, err) => {
      const service = mock<NNSDappService>();
      service.register_hardware_wallet.mockResolvedValue(params);

      const nnsDapp = await createNnsDapp(service);

      const call = async () =>
        await nnsDapp.registerHardwareWallet({
          name: "test",
          principal: mockPrincipal,
        });

      expect(call).rejects.toThrow(err);
    };

    it("should throw register hardware wallet error not found", async () =>
      await testError(
        {
          AccountNotFound: null,
        },
        new AccountNotFoundError(
          "error__attach_wallet.register_hardware_wallet"
        )
      ));

    it("should throw register hardware wallet error name too long", async () =>
      await testError(
        {
          NameTooLong: null,
        },
        new NameTooLongError(
          "error__attach_wallet.create_hardware_wallet_too_long",
          {
            $accountName: "test",
          }
        )
      ));

    it("should throw register hardware wallet error already registered", async () =>
      await testError(
        {
          HardwareWalletAlreadyRegistered: null,
        },
        new HardwareWalletAttachError("error__attach_wallet.already_registered")
      ));

    it("should throw register hardware wallet error limit exceeded", async () =>
      await testError(
        {
          HardwareWalletLimitExceeded: null,
        },
        new HardwareWalletAttachError("error__attach_wallet.limit_exceeded")
      ));
  });

  describe("NNSDapp.attachCanister", () => {
    it("should call attach_canister", async () => {
      const service = mock<NNSDappService>();
      service.attach_canister.mockResolvedValue({ Ok: null });
      const nnsDapp = await createNnsDapp(service);

      await nnsDapp.attachCanister({
        name: "test",
        canisterId: mockCanister.canister_id,
      });

      expect(service.attach_canister).toBeCalled();
    });

    it("should throw CanisterAlreadyAttachedError", async () => {
      const service = mock<NNSDappService>();
      service.attach_canister.mockResolvedValue({
        CanisterAlreadyAttached: null,
      });
      const nnsDapp = await createNnsDapp(service);

      const call = () =>
        nnsDapp.attachCanister({
          name: "test",
          canisterId: mockCanister.canister_id,
        });

      expect(call).rejects.toThrowError(CanisterAlreadyAttachedError);
    });

    it("should throw CanisterNameAlreadyTakenError", async () => {
      const service = mock<NNSDappService>();
      service.attach_canister.mockResolvedValue({
        NameAlreadyTaken: null,
      });
      const nnsDapp = await createNnsDapp(service);

      const call = () =>
        nnsDapp.attachCanister({
          name: "test",
          canisterId: mockCanister.canister_id,
        });

      expect(call).rejects.toThrowError(CanisterNameAlreadyTakenError);
    });

    it("should throw CanisterNameTooLongError", async () => {
      const service = mock<NNSDappService>();
      service.attach_canister.mockResolvedValue({
        NameTooLong: null,
      });
      const nnsDapp = await createNnsDapp(service);

      const call = () =>
        nnsDapp.attachCanister({
          name: "test",
          canisterId: mockCanister.canister_id,
        });

      expect(call).rejects.toThrowError(CanisterNameTooLongError);
    });

    it("should throw CanisterLimitExceededError", async () => {
      const service = mock<NNSDappService>();
      service.attach_canister.mockResolvedValue({
        CanisterLimitExceeded: null,
      });
      const nnsDapp = await createNnsDapp(service);

      const call = () =>
        nnsDapp.attachCanister({
          name: "test",
          canisterId: mockCanister.canister_id,
        });

      expect(call).rejects.toThrowError(CanisterLimitExceededError);
    });
  });

  describe("NNSDapp.renameCanister", () => {
    it("should call rename_canister", async () => {
      const service = mock<NNSDappService>();
      service.rename_canister.mockResolvedValue({ Ok: null });
      const nnsDapp = await createNnsDapp(service);

      await nnsDapp.renameCanister({
        name: "test",
        canisterId: mockCanister.canister_id,
      });

      expect(service.rename_canister).toBeCalledWith({
        name: "test",
        canister_id: mockCanister.canister_id,
      });
    });

    it("should throw CanisterNotFound", async () => {
      const service = mock<NNSDappService>();
      service.rename_canister.mockResolvedValue({
        CanisterNotFound: null,
      });
      const nnsDapp = await createNnsDapp(service);

      const call = () =>
        nnsDapp.renameCanister({
          name: "test",
          canisterId: mockCanister.canister_id,
        });

      expect(call).rejects.toThrowError(CanisterNotFoundError);
    });

    it("should throw CanisterNameAlreadyTakenError", async () => {
      const service = mock<NNSDappService>();
      service.rename_canister.mockResolvedValue({
        NameAlreadyTaken: null,
      });
      const nnsDapp = await createNnsDapp(service);

      const call = () =>
        nnsDapp.renameCanister({
          name: "test",
          canisterId: mockCanister.canister_id,
        });

      expect(call).rejects.toThrowError(CanisterNameAlreadyTakenError);
    });

    it("should throw CanisterNameTooLongError", async () => {
      const service = mock<NNSDappService>();
      service.rename_canister.mockResolvedValue({
        NameTooLong: null,
      });
      const nnsDapp = await createNnsDapp(service);

      const call = () =>
        nnsDapp.renameCanister({
          name: "test",
          canisterId: mockCanister.canister_id,
        });

      expect(call).rejects.toThrowError(CanisterNameTooLongError);
    });
  });

  describe("NNSDapp.detachCanister", () => {
    it("should call attach_canister", async () => {
      const service = mock<NNSDappService>();
      service.detach_canister.mockResolvedValue({ Ok: null });
      const nnsDapp = await createNnsDapp(service);

      await nnsDapp.detachCanister(mockCanister.canister_id);

      expect(service.detach_canister).toBeCalled();
    });

    it("should throw CanisterNotFoundError", async () => {
      const service = mock<NNSDappService>();
      service.detach_canister.mockResolvedValue({
        CanisterNotFound: null,
      });
      const nnsDapp = await createNnsDapp(service);

      const call = () => nnsDapp.detachCanister(mockCanister.canister_id);

      expect(call).rejects.toThrowError(CanisterNotFoundError);
    });
  });

  describe("NNSDapp.getProposalPayload", () => {
    it("should call get_proposal_payload", async () => {
      const service = mock<NNSDappService>();
      service.get_proposal_payload.mockResolvedValue({ Ok: "{}" });
      const nnsDapp = await createNnsDapp(service);

      await nnsDapp.getProposalPayload({
        proposalId: 0n,
      });

      expect(service.get_proposal_payload).toBeCalled();
    });
  });

  it("should parse successful response", async () => {
    const service = mock<NNSDappService>();
    service.get_proposal_payload.mockResolvedValue({
      Ok: JSON.stringify({ test: "data" }),
    });
    const nnsDapp = await createNnsDapp(service);

    const result = await nnsDapp.getProposalPayload({
      proposalId: 0n,
    });

    expect(result).toEqual({ test: "data" });
  });

  it("should throw ProposalPayloadNotFoundError", async () => {
    const service = mock<NNSDappService>();
    service.get_proposal_payload.mockResolvedValue({
      Err: "Proposal not found",
    });
    const nnsDapp = await createNnsDapp(service);

    const call = () =>
      nnsDapp.getProposalPayload({
        proposalId: 0n,
      });

    expect(call).rejects.toThrowError(ProposalPayloadNotFoundError);
  });

  it("should throw ProposalPayloadTooLargeError", async () => {
    const service = mock<NNSDappService>();
    service.get_proposal_payload.mockResolvedValue({
      Err: "An error occurred while loading proposal payload. IC0504: Canister xxxx violated contract: ic0.msg_reply_data_append: application payload size (2553969) cannot be larger than 2097152",
    });
    const nnsDapp = await createNnsDapp(service);

    const call = () =>
      nnsDapp.getProposalPayload({
        proposalId: 0n,
      });

    expect(call).rejects.toThrowError(ProposalPayloadTooLargeError);
  });

  it("should throw UnknownProposalPayloadError", async () => {
    const service = mock<NNSDappService>();
    service.get_proposal_payload.mockResolvedValue({
      Err: "test error",
    });
    const nnsDapp = await createNnsDapp(service);

    const call = () =>
      nnsDapp.getProposalPayload({
        proposalId: 0n,
      });

    expect(call).rejects.toThrowError(UnknownProposalPayloadError);
  });

  describe("NNSDapp.getImportedTokens", () => {
    it("should call get_imported_tokens", async () => {
      const service = mock<NNSDappService>();
      service.get_imported_tokens.mockResolvedValue({
        Ok: {
          imported_tokens: [],
        },
      });
      const nnsDapp = await createNnsDapp(service);

      expect(service.get_imported_tokens).not.toBeCalled();

      await nnsDapp.getImportedTokens({ certified: true });

      expect(service.get_imported_tokens).toBeCalledTimes(1);
    });

    it("should return imported tokens", async () => {
      const service = mock<NNSDappService>();
      service.get_imported_tokens.mockResolvedValue({
        Ok: {
          imported_tokens: [mockImportedToken],
        },
      });
      const nnsDapp = await createNnsDapp(service);
      const result = await nnsDapp.getImportedTokens({ certified: true });

      expect(result).toEqual({
        imported_tokens: [mockImportedToken],
      });
    });

    it("throws error if account not found", async () => {
      const response: GetImportedTokensResponse = {
        AccountNotFound: null,
      };
      const service = mock<NNSDappService>();
      service.get_imported_tokens.mockResolvedValue(response);

      const nnsDapp = await createNnsDapp(service);

      const call = async () => nnsDapp.getImportedTokens({ certified: true });

      await expect(call).rejects.toThrow(AccountNotFoundError);
    });

    it("should provide generic error message", async () => {
      const response = {
        UnexpectedError: "message",
      };
      const service = mock<NNSDappService>();
      service.get_imported_tokens.mockResolvedValue(
        response as unknown as GetImportedTokensResponse
      );

      const nnsDapp = await createNnsDapp(service);

      const call = async () => nnsDapp.getImportedTokens({ certified: true });

      await expect(call).rejects.toThrow(
        'Error getting imported tokens {"UnexpectedError":"message"}'
      );
    });
  });

  describe("NNSDapp.setImportedTokens", () => {
    it("should call set_imported_tokens", async () => {
      const service = mock<NNSDappService>();
      service.set_imported_tokens.mockResolvedValue({
        Ok: null,
      });
      const nnsDapp = await createNnsDapp(service);

      expect(service.set_imported_tokens).not.toBeCalled();

      await nnsDapp.setImportedTokens([mockImportedToken]);

      expect(service.set_imported_tokens).toBeCalledTimes(1);
      expect(service.set_imported_tokens).toBeCalledWith({
        imported_tokens: [mockImportedToken],
      });
    });

    it("throws error if account not found", async () => {
      const response: SetImportedTokensResponse = {
        AccountNotFound: null,
      };
      const service = mock<NNSDappService>();
      service.set_imported_tokens.mockResolvedValue(response);

      const nnsDapp = await createNnsDapp(service);

      const call = async () => nnsDapp.setImportedTokens([]);

      await expect(call).rejects.toThrow(AccountNotFoundError);
    });

    it("throws error if the limit has been reached", async () => {
      const response: SetImportedTokensResponse = {
        TooManyImportedTokens: { limit: 10 },
      };
      const service = mock<NNSDappService>();
      service.set_imported_tokens.mockResolvedValue(response);

      const nnsDapp = await createNnsDapp(service);

      const call = async () => nnsDapp.setImportedTokens([]);

      await expect(call).rejects.toThrowError(
        new TooManyImportedTokensError("error__imported_tokens.too_many", {
          limit: "10",
        })
      );
    });

    it("should provide generic error message", async () => {
      const response = {
        UnexpectedError: "message",
      };
      const service = mock<NNSDappService>();
      service.set_imported_tokens.mockResolvedValue(
        response as unknown as SetImportedTokensResponse
      );

      const nnsDapp = await createNnsDapp(service);

      const call = async () => nnsDapp.setImportedTokens([]);

      await expect(call).rejects.toThrow(
        'Error setting imported tokens {"UnexpectedError":"message"}'
      );
    });
  });
});
