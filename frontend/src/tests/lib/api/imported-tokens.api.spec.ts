import {
  getImportedTokens,
  setImportedTokens,
} from "$lib/api/imported-tokens.api";
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockImportedToken } from "$tests/mocks/icrc-accounts.mock";
import { mock } from "vitest-mock-extended";

// Mock createAgent to avoid console errors caused by the time-syncing fetch call in agent-js.
vi.mock("@dfinity/utils", async () => {
  return {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    ...(await vi.importActual<any>("@dfinity/utils")),
    __esModule: true,
    createAgent: vi.fn(),
  };
});

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
