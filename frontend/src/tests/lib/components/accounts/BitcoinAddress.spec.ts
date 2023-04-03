/**
 * @jest-environment jsdom
 */

import * as minterApi from "$lib/api/ckbtc-minter.api";
import BitcoinAddress from "$lib/components/accounts/BitcoinAddress.svelte";
import {
  CKTESTBTC_MINTER_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { bitcoinAddressStore } from "$lib/stores/bitcoin.store";
import { mockMainAccount } from "$tests/mocks/accounts.store.mock";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockBTCAddressTestnet,
  mockCkBTCMainAccount,
} from "$tests/mocks/ckbtc-accounts.mock";
import { render, waitFor } from "@testing-library/svelte";
import { page } from "../../../../../__mocks__/$app/stores";

describe("BitcoinAddress", () => {
  beforeAll(() => {
    page.mock({
      data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Wallet,
    });
  });

  const props = {
    account: mockCkBTCMainAccount,
    minterCanisterId: CKTESTBTC_MINTER_CANISTER_ID,
    universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
  };

  beforeEach(() => {
      jest.clearAllMocks();
      bitcoinAddressStore.reset();
  });

  describe("not matching bitcoin address store", () => {
    let spyGetAddress;

    beforeEach(() => {
      spyGetAddress = jest
        .spyOn(minterApi, "getBTCAddress")
        .mockResolvedValue(mockBTCAddressTestnet);
    });

    it("should load bitcoin address on mount", async () => {
      render(BitcoinAddress, { props });

      await waitFor(() =>
        expect(spyGetAddress).toBeCalledWith({
          identity: mockIdentity,
          canisterId: CKTESTBTC_MINTER_CANISTER_ID,
        })
      );
    });

    it("should also load bitcoin address on mount if no match", async () => {
      const data = {
        identifier: mockMainAccount.identifier,
        btcAddress: mockBTCAddressTestnet,
      };

      bitcoinAddressStore.set(data);

      render(BitcoinAddress, { props });

      await waitFor(() =>
        expect(spyGetAddress).toBeCalledWith({
          identity: mockIdentity,
          canisterId: CKTESTBTC_MINTER_CANISTER_ID,
        })
      );
    });
  });

  describe("existing bitcoin address store", () => {
    beforeEach(() => {
      const data = {
        identifier: mockCkBTCMainAccount.identifier,
        btcAddress: mockBTCAddressTestnet,
      };

      bitcoinAddressStore.set(data);
    });

    it("should not load bitcoin address on mount if already loaded", async () => {
      const spyGetAddress = jest
        .spyOn(minterApi, "getBTCAddress")
        .mockResolvedValue(mockBTCAddressTestnet);

      render(BitcoinAddress, { props });

      await waitFor(() => expect(spyGetAddress).not.toHaveBeenCalled());
    });
  });
});
