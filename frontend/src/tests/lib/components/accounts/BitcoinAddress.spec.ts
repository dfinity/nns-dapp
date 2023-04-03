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

  beforeEach(() => jest.clearAllMocks());

  it("should load bitcoin address on mount", async () => {
    const spyGetAddress = jest
      .spyOn(minterApi, "getBTCAddress")
      .mockResolvedValue(mockBTCAddressTestnet);

    render(BitcoinAddress, { props });

    await waitFor(() =>
      expect(spyGetAddress).toBeCalledWith({
        identity: mockIdentity,
        canisterId: CKTESTBTC_MINTER_CANISTER_ID,
      })
    );
  });

  it("should not load bitcoin address on mount if already loaded", async () => {
    const spyGetAddress = jest
      .spyOn(minterApi, "getBTCAddress")
      .mockResolvedValue(mockBTCAddressTestnet);

    const data = {
      identifier: mockCkBTCMainAccount.identifier,
      btcAddress: mockBTCAddressTestnet,
    };

    bitcoinAddressStore.set(data);

    render(BitcoinAddress, { props });

    await waitFor(() => expect(spyGetAddress).not.toHaveBeenCalled());
  });
});
