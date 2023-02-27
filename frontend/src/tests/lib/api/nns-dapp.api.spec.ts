import { addAccount, queryAccount } from "$lib/api/nns-dapp.api";
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import { mock } from "jest-mock-extended";
import { mockAccountDetails } from "../../mocks/accounts.store.mock";
import { mockIdentity } from "../../mocks/auth.store.mock";

describe("nns-dapp api", () => {
  describe("addAccount", () => {
    const nnsDappCanister = mock<NNSDappCanister>();
    nnsDappCanister.getAccount.mockResolvedValue(mockAccountDetails);
    nnsDappCanister.addAccount.mockResolvedValue(undefined);

    beforeEach(() => {
      jest.clearAllMocks();
      jest
        .spyOn(NNSDappCanister, "create")
        .mockImplementation((): NNSDappCanister => nnsDappCanister);
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
