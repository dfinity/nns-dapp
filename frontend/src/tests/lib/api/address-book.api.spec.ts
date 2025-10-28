import { getAddressBook, setAddressBook } from "$lib/api/address-book.api";
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import { mockCreateAgent } from "$tests/mocks/agent.mock";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockNamedAddress,
  mockNamedAddressIcrc1,
} from "$tests/mocks/icrc-accounts.mock";
import * as dfinityUtils from "@dfinity/utils";
import { mock } from "vitest-mock-extended";

describe("address-book-api", () => {
  const mockNNSDappCanister = mock<NNSDappCanister>();

  beforeEach(() => {
    vi.spyOn(NNSDappCanister, "create").mockImplementation(
      (): NNSDappCanister => mockNNSDappCanister
    );
    // Prevent HttpAgent.create(), which is called by createAgent, from making a
    // real network request via agent.syncTime().
    vi.spyOn(dfinityUtils, "createAgent").mockImplementation(mockCreateAgent);
  });

  describe("getAddressBook", () => {
    it("should call the nns dapp canister to get the address book", async () => {
      mockNNSDappCanister.getAddressBook.mockResolvedValue({
        named_addresses: [mockNamedAddress, mockNamedAddressIcrc1],
      });
      expect(mockNNSDappCanister.getAddressBook).not.toBeCalled();
      const result = await getAddressBook({
        identity: mockIdentity,
        certified: true,
      });

      expect(mockNNSDappCanister.getAddressBook).toBeCalledTimes(1);
      expect(mockNNSDappCanister.getAddressBook).toBeCalledWith({
        certified: true,
      });
      expect(result).toEqual({
        named_addresses: [mockNamedAddress, mockNamedAddressIcrc1],
      });
    });
  });

  describe("setAddressBook", () => {
    it("should call the nns dapp canister to set address book", async () => {
      expect(mockNNSDappCanister.setAddressBook).not.toBeCalled();
      await setAddressBook({
        identity: mockIdentity,
        namedAddresses: [mockNamedAddress, mockNamedAddressIcrc1],
      });

      expect(mockNNSDappCanister.setAddressBook).toBeCalledTimes(1);
      expect(mockNNSDappCanister.setAddressBook).toBeCalledWith([
        mockNamedAddress,
        mockNamedAddressIcrc1,
      ]);
    });
  });
});
