import * as minterApi from "$lib/api/ckbtc-minter.api";
import BitcoinAddress from "$lib/components/accounts/BitcoinAddress.svelte";
import { BITCOIN_BLOCK_EXPLORER_TESTNET_URL } from "$lib/constants/bitcoin.constants";
import {
  CKTESTBTC_MINTER_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { bitcoinAddressStore } from "$lib/stores/bitcoin.store";
import { ckBTCInfoStore } from "$lib/stores/ckbtc-info.store";
import { page } from "$mocks/$app/stores";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockBTCAddressTestnet,
  mockCkBTCMainAccount,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockCkBTCMinterInfo } from "$tests/mocks/ckbtc-minter.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { BitcoinAddressPo } from "$tests/page-objects/BitcoinAddress.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";

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
    reload: vi.fn(),
  };

  const renderComponent = async () => {
    const { container } = render(BitcoinAddress, { props });
    await runResolvedPromises();
    return BitcoinAddressPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetIdentity();
    vi.clearAllMocks();
    bitcoinAddressStore.reset();
    ckBTCInfoStore.reset();
  });

  describe("not matching bitcoin address store", () => {
    let spyGetAddress;

    beforeEach(() => {
      spyGetAddress = vi
        .spyOn(minterApi, "getBTCAddress")
        .mockResolvedValue(mockBTCAddressTestnet);
    });

    it("should load bitcoin address on mount", async () => {
      await renderComponent();

      expect(spyGetAddress).toBeCalledWith({
        identity: mockIdentity,
        canisterId: CKTESTBTC_MINTER_CANISTER_ID,
      });
    });

    it("should also load bitcoin address on mount if no match", async () => {
      const data = {
        identifier: mockMainAccount.identifier,
        btcAddress: mockBTCAddressTestnet,
      };

      bitcoinAddressStore.set(data);

      await renderComponent();

      expect(spyGetAddress).toBeCalledWith({
        identity: mockIdentity,
        canisterId: CKTESTBTC_MINTER_CANISTER_ID,
      });
    });

    it("should render a spinner while loading", async () => {
      let resolveBtcAddress;

      spyGetAddress = vi.spyOn(minterApi, "getBTCAddress").mockImplementation(
        () =>
          new Promise<string>((resolve) => {
            resolveBtcAddress = async () => {
              resolve(mockBTCAddressTestnet);
              await runResolvedPromises();
            };
          })
      );

      bitcoinAddressStore.reset();
      const po = await renderComponent();

      expect(await po.hasSpinner()).toBe(true);
      await resolveBtcAddress();
      expect(await po.hasSpinner()).toBe(false);
    });
  });

  describe("existing bitcoin address store", () => {
    const data = {
      identifier: mockCkBTCMainAccount.identifier,
      btcAddress: mockBTCAddressTestnet,
    };

    beforeEach(() => {
      bitcoinAddressStore.set(data);

      ckBTCInfoStore.setInfo({
        canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID,
        info: mockCkBTCMinterInfo,
        certified: true,
      });
    });

    it("should not load bitcoin address on mount if already loaded", async () => {
      const spyGetAddress = vi
        .spyOn(minterApi, "getBTCAddress")
        .mockResolvedValue(mockBTCAddressTestnet);

      await renderComponent();

      expect(spyGetAddress).not.toHaveBeenCalled();
    });

    it("should not render a spinner when loaded", async () => {
      const po = await renderComponent();

      expect(await po.hasSpinner()).toBe(false);
    });

    it("should display a sentence info", async () => {
      const po = await renderComponent();

      expect(await po.getText()).toContain(
        "Incoming Bitcoin network transactions require 12 confirmations. Then click Refresh Balance to update your ckBTC balance. Check status on a"
      );
    });

    it("should display a link to block explorer", async () => {
      const po = await renderComponent();

      const link = po.getBlockExplorerLink();

      expect(await link.isPresent()).toBe(true);
      expect(await link.getAttribute("href")).toBe(
        `${BITCOIN_BLOCK_EXPLORER_TESTNET_URL}/${data.btcAddress}`
      );
      expect(await link.getAttribute("target")).toBe("_blank");
      const rel = await link.getAttribute("rel");
      expect(rel).toContain("noopener");
      expect(rel).toContain("noreferrer");
    });

    it("should display a call to action to refresh balance", async () => {
      const po = await renderComponent();

      expect(await po.hasUpdateBalanceButton()).toBe(true);
    });
  });

  describe("no matching ckBTC info parameter", () => {
    const data = {
      identifier: mockCkBTCMainAccount.identifier,
      btcAddress: mockBTCAddressTestnet,
    };

    beforeEach(() => {
      bitcoinAddressStore.set(data);
    });

    it("should display a sentence info with empty instead of the number of confirmations", async () => {
      const po = await renderComponent();

      expect(await po.getText()).toContain(
        "Incoming Bitcoin network transactions require  confirmations. Then click"
      );
    });
  });
});
