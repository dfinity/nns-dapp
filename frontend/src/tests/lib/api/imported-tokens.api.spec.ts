import {
  getImportedTokens,
  setImportedTokens,
} from "$lib/api/imported-tokens.api";
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockImportedToken } from "$tests/mocks/icp-accounts.store.mock";
import { mock } from "vitest-mock-extended";

describe("imported-tokens-api", () => {
  const mockNNSDappCanister = mock<NNSDappCanister>();

  beforeEach(() => {
    vi.resetAllMocks();

    vi.spyOn(NNSDappCanister, "create").mockImplementation(
      (): NNSDappCanister => mockNNSDappCanister
    );
  });

  describe("getImportedTokens", () => {
    it("should call the nns dapp canister to get the imported tokens", async () => {
      expect(mockNNSDappCanister.getImportedTokens).not.toBeCalled();
      await getImportedTokens({
        identity: mockIdentity,
        certified: true,
      });

      expect(mockNNSDappCanister.getImportedTokens).toBeCalledTimes(1);
      expect(mockNNSDappCanister.getImportedTokens).toBeCalledWith({
        certified: true,
      });
    });
  });

  describe("setImportedTokens", () => {
    it("should call the nns dapp canister to set imported tokens", async () => {
      expect(mockNNSDappCanister.setImportedTokens).not.toBeCalled();
      await setImportedTokens({
        identity: mockIdentity,
        importedTokens: [mockImportedToken],
      });

      expect(mockNNSDappCanister.setImportedTokens).toBeCalledTimes(1);
      expect(mockNNSDappCanister.setImportedTokens).toBeCalledWith([
        mockImportedToken,
      ]);
    });
  });
});
