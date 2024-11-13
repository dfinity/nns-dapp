import * as agent from "$lib/api/agent.api";
import { addAccount, queryAccount } from "$lib/api/nns-dapp.api";
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockAccountDetails } from "$tests/mocks/icp-accounts.store.mock";
import type { HttpAgent } from "@dfinity/agent";
import { mock } from "vitest-mock-extended";

describe("nns-dapp api", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  describe("addAccount", () => {
    const nnsDappCanister = mock<NNSDappCanister>();

    beforeEach(() => {
      nnsDappCanister.getAccount.mockResolvedValue(mockAccountDetails);
      nnsDappCanister.addAccount.mockResolvedValue(undefined);
      vi.spyOn(NNSDappCanister, "create").mockImplementation(
        (): NNSDappCanister => nnsDappCanister
      );
    });

    it("get account details from nns-dapp canister", async () => {
      const certified = true;
      const account = await queryAccount({
        identity: mockIdentity,
        certified,
      });
      expect(account).toEqual(mockAccountDetails);
      expect(nnsDappCanister.getAccount).toBeCalledWith({
        certified,
      });
    });

    it("call to add account to nns-dapp canister", async () => {
      await addAccount(mockIdentity);
      expect(nnsDappCanister.addAccount).toBeCalledWith();
    });
  });
});
