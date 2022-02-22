import { Principal } from "@dfinity/principal";
import { mock } from "jest-mock-extended";
import { NNSDappCanister } from "../../../lib/canisters/nns-dapp/nns-dapp.canister";
import type { NNSDappService } from "../../../lib/canisters/nns-dapp/nns-dapp.idl";
import type {
  CreateSubAccountResponse,
  SubAccountDetails,
} from "../../../lib/canisters/nns-dapp/nns-dapp.types";
import { createAgent } from "../../../lib/utils/agent.utils";
import { mockIdentity } from "../../mocks/auth.store.mock";

describe("NNSDapp.createSubAccount", () => {
  it("returns subaccount details when success", async () => {
    const defaultAgent = await createAgent({ identity: mockIdentity });
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
    const defaultAgent = await createAgent({ identity: mockIdentity });
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
    const defaultAgent = await createAgent({ identity: mockIdentity });
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
    const defaultAgent = await createAgent({ identity: mockIdentity });
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
