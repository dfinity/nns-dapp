/**
 * @jest-environment jsdom
 */

import * as minterApi from "$lib/api/ckbtc-minter.api";
import BitcoinAddressLoader from "$lib/components/accounts/BitcoinAddressLoader.svelte";
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

describe("BitcoinAddressLoader", () => {
  beforeAll(() => {
    page.mock({
      data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Wallet,
    });
  });

  const props = {
    identifier: mockCkBTCMainAccount.identifier,
    minterCanisterId: CKTESTBTC_MINTER_CANISTER_ID,
    universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    bitcoinAddressStore.reset();
  });

  let spyGetAddress;

  beforeEach(() => {
    spyGetAddress = jest
      .spyOn(minterApi, "getBTCAddress")
      .mockResolvedValue(mockBTCAddressTestnet);
  });

  it("should load bitcoin address on mount", async () => {
    render(BitcoinAddressLoader, { props });

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

    render(BitcoinAddressLoader, { props });

    await waitFor(() =>
      expect(spyGetAddress).toBeCalledWith({
        identity: mockIdentity,
        canisterId: CKTESTBTC_MINTER_CANISTER_ID,
      })
    );
  });

  it("should load bitcoin address after mount if identifier is set afterwards", async () => {
    const { rerender } = render(BitcoinAddressLoader, {
      props: {
        ...props,
        identifier: undefined,
      },
    });

    expect(() => expect(spyGetAddress).not.toBeCalled());

    rerender(props);

    await waitFor(() =>
      expect(spyGetAddress).toBeCalledWith({
        identity: mockIdentity,
        canisterId: CKTESTBTC_MINTER_CANISTER_ID,
      })
    );
  });
});
