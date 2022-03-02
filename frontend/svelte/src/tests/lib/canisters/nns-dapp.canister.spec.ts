import { AccountIdentifier } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { mock } from "jest-mock-extended";
import { NNSDappCanister } from "../../../lib/canisters/nns-dapp/nns-dapp.canister";
import {
  AccountNotFoundError,
  NameTooLongError,
  SubAccountLimitExceededError,
} from "../../../lib/canisters/nns-dapp/nns-dapp.errors";
import type { NNSDappService } from "../../../lib/canisters/nns-dapp/nns-dapp.idl";
import type {
  CreateSubAccountResponse,
  GetAccountResponse,
} from "../../../lib/canisters/nns-dapp/nns-dapp.types";
import { createAgent } from "../../../lib/utils/agent.utils";
import {
  mockAccountDetails,
  mockSubAccountDetails,
} from "../../mocks/accounts.store.mock";
import { mockIdentity } from "../../mocks/auth.store.mock";

describe("NNSDapp.addAccount", () => {
  it("returns account identifier when success", async () => {
    const defaultAgent = await createAgent({ identity: mockIdentity });
    const response: string =
      "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f";
    const service = mock<NNSDappService>();
    service.add_account.mockResolvedValue(response);

    const canisterId = Principal.fromText("aaaaa-aa");
    const nnsDapp = NNSDappCanister.create({
      agent: defaultAgent,
      certifiedServiceOverride: service,
      canisterId,
    });

    const res = await nnsDapp.addAccount();

    expect(res).toEqual(AccountIdentifier.fromHex(response));
  });
});

describe("NNSDapp.getAccount", () => {
  it("returns account details when success", async () => {
    const defaultAgent = await createAgent({ identity: mockIdentity });
    const response: GetAccountResponse = {
      Ok: mockAccountDetails,
    };
    const service = mock<NNSDappService>();
    service.get_account.mockResolvedValue(response);

    const canisterId = Principal.fromText("aaaaa-aa");
    const nnsDapp = NNSDappCanister.create({
      agent: defaultAgent,
      certifiedServiceOverride: service,
      canisterId,
    });

    const res = await nnsDapp.getAccount();

    expect(res).toEqual(mockAccountDetails);
  });

  it("throws error if account not found", async () => {
    const defaultAgent = await createAgent({ identity: mockIdentity });
    const response: GetAccountResponse = {
      AccountNotFound: null,
    };
    const service = mock<NNSDappService>();
    service.get_account.mockResolvedValue(response);

    const canisterId = Principal.fromText("aaaaa-aa");
    const nnsDapp = NNSDappCanister.create({
      certifiedServiceOverride: service,
      canisterId,
      agent: defaultAgent,
    });

    const call = async () => nnsDapp.getAccount();

    expect(call).rejects.toThrow(AccountNotFoundError);
  });
});

describe("NNSDapp.createSubAccount", () => {
  it("returns subaccount details when success", async () => {
    const defaultAgent = await createAgent({ identity: mockIdentity });
    const response: CreateSubAccountResponse = {
      Ok: mockSubAccountDetails,
    };
    const service = mock<NNSDappService>();
    service.create_sub_account.mockResolvedValue(response);

    const canisterId = Principal.fromText("aaaaa-aa");
    const nnsDapp = NNSDappCanister.create({
      agent: defaultAgent,
      certifiedServiceOverride: service,
      canisterId,
    });

    const res = await nnsDapp.createSubAccount({
      subAccountName: mockSubAccountDetails.name,
    });

    expect(res).toEqual(mockSubAccountDetails);
  });

  it("throws error if name too long", async () => {
    const defaultAgent = await createAgent({ identity: mockIdentity });
    const response: CreateSubAccountResponse = {
      NameTooLong: null,
    };
    const service = mock<NNSDappService>();
    service.create_sub_account.mockResolvedValue(response);

    const canisterId = Principal.fromText("aaaaa-aa");
    const nnsDapp = NNSDappCanister.create({
      certifiedServiceOverride: service,
      canisterId,
      agent: defaultAgent,
    });

    const call = async () =>
      nnsDapp.createSubAccount({ subAccountName: "testSubaccount" });

    expect(call).rejects.toThrow(NameTooLongError);
  });

  it("throws error if subaccount limit reached", async () => {
    const defaultAgent = await createAgent({ identity: mockIdentity });
    const response: CreateSubAccountResponse = {
      SubAccountLimitExceeded: null,
    };
    const service = mock<NNSDappService>();
    service.create_sub_account.mockResolvedValue(response);

    const canisterId = Principal.fromText("aaaaa-aa");
    const nnsDapp = NNSDappCanister.create({
      agent: defaultAgent,
      certifiedServiceOverride: service,
      canisterId,
    });

    const call = async () =>
      nnsDapp.createSubAccount({ subAccountName: "testSubaccount" });

    expect(call).rejects.toThrow(SubAccountLimitExceededError);
  });

  it("throws error if account not found", async () => {
    const defaultAgent = await createAgent({ identity: mockIdentity });
    const response: CreateSubAccountResponse = {
      AccountNotFound: null,
    };
    const service = mock<NNSDappService>();
    service.create_sub_account.mockResolvedValue(response);

    const canisterId = Principal.fromText("aaaaa-aa");
    const nnsDapp = NNSDappCanister.create({
      agent: defaultAgent,
      certifiedServiceOverride: service,
      canisterId,
    });

    const call = async () =>
      nnsDapp.createSubAccount({ subAccountName: "testSubaccount" });

    expect(call).rejects.toThrow(AccountNotFoundError);
  });
});
