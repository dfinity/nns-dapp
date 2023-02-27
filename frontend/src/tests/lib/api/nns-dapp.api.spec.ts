import { getOrCreateAccount } from "$lib/api/nns-dapp.api";
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import { AccountNotFoundError } from "$lib/canisters/nns-dapp/nns-dapp.errors";
import { mock } from "jest-mock-extended";
import { mockAccountDetails } from "../../mocks/accounts.store.mock";
import { mockIdentity } from "../../mocks/auth.store.mock";

describe("nns-dapp api", () => {
  describe("loadAccounts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should not call nnsdapp addAccount if getAccount already returns account", async () => {
      // NNSDapp mock
      const nnsDappMock = mock<NNSDappCanister>();
      nnsDappMock.getAccount.mockResolvedValue(mockAccountDetails);
      jest.spyOn(NNSDappCanister, "create").mockReturnValue(nnsDappMock);

      await getOrCreateAccount({ identity: mockIdentity, certified: true });

      expect(nnsDappMock.getAccount).toBeCalledTimes(1);
      expect(nnsDappMock.addAccount).not.toBeCalled();
    });

    it("should throw if getAccount fails with other error than AccountNotFoundError", async () => {
      // NNSDapp mock
      const error = new Error("test");
      const nnsDappMock = mock<NNSDappCanister>();
      nnsDappMock.getAccount
        .mockRejectedValueOnce(error)
        .mockResolvedValue(mockAccountDetails);
      nnsDappMock.addAccount.mockResolvedValue(undefined);
      jest.spyOn(NNSDappCanister, "create").mockReturnValue(nnsDappMock);

      const call = () =>
        getOrCreateAccount({ identity: mockIdentity, certified: true });

      await expect(call).rejects.toThrowError(error);
      expect(nnsDappMock.addAccount).not.toBeCalled();
    });

    it("should throw if getAccount fails after addAccount", async () => {
      // NNSDapp mock
      const nnsDappMock = mock<NNSDappCanister>();
      nnsDappMock.getAccount
        .mockRejectedValueOnce(new AccountNotFoundError("test"))
        .mockRejectedValue(new Error("test"));
      jest.spyOn(NNSDappCanister, "create").mockReturnValue(nnsDappMock);

      const call = () =>
        getOrCreateAccount({ identity: mockIdentity, certified: true });

      await expect(call).rejects.toThrow();
      expect(nnsDappMock.addAccount).toBeCalled();
    });
  });
});
