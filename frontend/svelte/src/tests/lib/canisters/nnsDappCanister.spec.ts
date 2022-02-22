import { HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { mock } from "jest-mock-extended";
import type { NNSDappService } from "../../../lib/canisters/nns-dapp/nns-dapp.idl";
import type {
  CreateSubAccountResponse,
  SubAccountDetails,
} from "../../../lib/canisters/nns-dapp/nns-dapp.types";
import { NNSDappCanister } from "../../../lib/canisters/nns-dapp/nnsDappCanister";

describe("NNSDapp.createSubAccount", () => {
  const defaultAgent = new HttpAgent({ host: "http://localhost:8000" });
  it("returns subaccount details when success", async () => {
    const subAccountName = "longName";
    const subAccountDetails: SubAccountDetails = {
      name: subAccountName,
      sub_account: [0, 0],
      account_identifier: "account-identifier",
    };
    const response: CreateSubAccountResponse = {
      Ok: subAccountDetails,
    };
    const service = mock<NNSDappService>();
    service.create_sub_account.mockResolvedValue(response);

    const canisterId = Principal.fromText("aaaaa-aa");
    const governance = NNSDappCanister.create({
      agent: defaultAgent,
      certifiedServiceOverride: service,
      canisterId,
    });

    const res = await governance.createSubAccount({ subAccountName });

    expect(res).toEqual(subAccountDetails);
  });

  it("throws error if name too long", async () => {
    const response: CreateSubAccountResponse = {
      NameTooLong: null,
    };
    const service = mock<NNSDappService>();
    service.create_sub_account.mockResolvedValue(response);

    const canisterId = Principal.fromText("aaaaa-aa");
    const governance = NNSDappCanister.create({
      certifiedServiceOverride: service,
      canisterId,
      agent: defaultAgent,
    });

    const call = async () =>
      governance.createSubAccount({ subAccountName: "testSubaccount" });

    expect(call).rejects.toThrow(Error);
  });

  it("throws error if subaccount limit reached", async () => {
    const response: CreateSubAccountResponse = {
      SubAccountLimitExceeded: null,
    };
    const service = mock<NNSDappService>();
    service.create_sub_account.mockResolvedValue(response);

    const canisterId = Principal.fromText("aaaaa-aa");
    const governance = NNSDappCanister.create({
      agent: defaultAgent,
      certifiedServiceOverride: service,
      canisterId,
    });

    const call = async () =>
      governance.createSubAccount({ subAccountName: "testSubaccount" });

    expect(call).rejects.toThrow(Error);
  });

  it("throws error if account not found", async () => {
    const response: CreateSubAccountResponse = {
      AccountNotFound: null,
    };
    const service = mock<NNSDappService>();
    service.create_sub_account.mockResolvedValue(response);

    const canisterId = Principal.fromText("aaaaa-aa");
    const governance = NNSDappCanister.create({
      agent: defaultAgent,
      certifiedServiceOverride: service,
      canisterId,
    });

    const call = async () =>
      governance.createSubAccount({ subAccountName: "testSubaccount" });

    expect(call).rejects.toThrow(Error);
  });
});
