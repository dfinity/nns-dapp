import {
  getImportedTokens,
  setImportedTokens,
} from "$lib/api/imported-tokens.api";
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockImportedToken } from "$tests/mocks/icrc-accounts.mock";
import * as dfinityUtils from "@dfinity/utils";
import { mock } from "vitest-mock-extended";

describe("imported-tokens-api", () => {
  const mockNNSDappCanister = mock<NNSDappCanister>();

  beforeEach(() => {
    vi.resetAllMocks();

    vi.spyOn(NNSDappCanister, "create").mockImplementation(
      (): NNSDappCanister => mockNNSDappCanister
    );
    // Prevent HttpAgent.create(), which is called by createAgent, from making a
    // real network request via agent.syncTime().
    vi.spyOn(dfinityUtils, "createAgent").mockReturnValue(undefined);
  });

  describe("getImportedTokens", () => {
    it("should call the nns dapp canister to get the imported tokens", async () => {
      mockNNSDappCanister.getImportedTokens.mockResolvedValue({
        imported_tokens: [mockImportedToken],
      });
      expect(mockNNSDappCanister.getImportedTokens).not.toBeCalled();
      const result = await getImportedTokens({
        identity: mockIdentity,
        certified: true,
      });

      expect(mockNNSDappCanister.getImportedTokens).toBeCalledTimes(1);
      expect(mockNNSDappCanister.getImportedTokens).toBeCalledWith({
        certified: true,
      });
      expect(result).toEqual({
        imported_tokens: [mockImportedToken],
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
