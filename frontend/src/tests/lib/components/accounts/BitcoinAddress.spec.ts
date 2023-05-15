/**
 * @jest-environment jsdom
 */

import * as minterApi from "$lib/api/ckbtc-minter.api";
import BitcoinAddress from "$lib/components/accounts/BitcoinAddress.svelte";
import { BITCOIN_BLOCK_EXPLORER_TESTNET_URL } from "$lib/constants/bitcoin.constants";
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
import en from "$tests/mocks/i18n.mock";
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
    reload: jest.fn(),
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

    it("should render a spinner while loading", async () => {
      const { getByTestId } = render(BitcoinAddress, { props });

      await waitFor(() => expect(getByTestId("spinner")).not.toBeNull());
    });
  });

  describe("existing bitcoin address store", () => {
    const data = {
      identifier: mockCkBTCMainAccount.identifier,
      btcAddress: mockBTCAddressTestnet,
    };

    beforeEach(() => {
      bitcoinAddressStore.set(data);
    });

    it("should not load bitcoin address on mount if already loaded", async () => {
      const spyGetAddress = jest
        .spyOn(minterApi, "getBTCAddress")
        .mockResolvedValue(mockBTCAddressTestnet);

      render(BitcoinAddress, { props });

      await waitFor(() => expect(spyGetAddress).not.toHaveBeenCalled());
    });

    it("should not render a spinner when loaded", () => {
      const { getByTestId } = render(BitcoinAddress, { props });

      expect(() => getByTestId("spinner")).toThrow();
    });

    it("should display a sentence info", () => {
      const { getByText } = render(BitcoinAddress, { props });

      expect(
        getByText(en.ckbtc.incoming_bitcoin_network_part_1, { exact: false })
      ).toBeInTheDocument();
      expect(
        getByText(en.ckbtc.incoming_bitcoin_network_part_2, { exact: false })
      ).toBeInTheDocument();
    });

    it("should display a link to block explorer", () => {
      const { getByTestId } = render(BitcoinAddress, { props });

      const link = getByTestId("block-explorer-link");

      expect(link).not.toBeNull();
      expect(link?.getAttribute("href")).toEqual(
        `${BITCOIN_BLOCK_EXPLORER_TESTNET_URL}/${data.btcAddress}`
      );
      expect(link?.getAttribute("target")).toEqual("_blank");
      expect(link?.getAttribute("rel")).toContain("noopener");
      expect(link?.getAttribute("rel")).toContain("noreferrer");
    });

    it("should display a call to action to refresh balance", () => {
      const { getByTestId } = render(BitcoinAddress, { props });

      const action = getByTestId("manual-refresh-balance");
      expect(action).not.toBeNull();
    });
  });
});
