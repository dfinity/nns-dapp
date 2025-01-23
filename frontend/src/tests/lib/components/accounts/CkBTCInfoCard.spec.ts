import * as minterApi from "$lib/api/ckbtc-minter.api";
import CkBTCInfoCard from "$lib/components/accounts/CkBTCInfoCard.svelte";
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
import { CkBTCInfoCardPo } from "$tests/page-objects/CkBTCInfoCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";

describe("CkBTCInfoCard", () => {
  const props = {
    account: mockCkBTCMainAccount,
    minterCanisterId: CKTESTBTC_MINTER_CANISTER_ID,
    universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
    reload: vi.fn(),
  };

  const renderComponent = async (props) => {
    const { container } = render(CkBTCInfoCard, { props });
    await runResolvedPromises();
    return CkBTCInfoCardPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetIdentity();

    page.mock({
      data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Wallet,
    });
  });

  describe("not matching bitcoin address store", () => {
    let spyGetAddress;

    beforeEach(() => {
      spyGetAddress = vi
        .spyOn(minterApi, "getBTCAddress")
        .mockResolvedValue(mockBTCAddressTestnet);
    });

    it("should load bitcoin address on mount", async () => {
      await renderComponent(props);

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

      await renderComponent(props);

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
      const po = await renderComponent(props);

      expect(await po.hasSpinner()).toBe(true);
      expect(await po.hasSkeletonText()).toBe(true);
      expect(await po.hasQrCode()).toBe(false);
      expect(await po.hasQrCodePlaceholder()).toBe(false);
      expect(await po.hasAddress()).toBe(false);
      await resolveBtcAddress();
      expect(await po.hasSpinner()).toBe(false);
      expect(await po.hasSkeletonText()).toBe(false);
      expect(await po.hasQrCode()).toBe(true);
      expect(await po.hasQrCodePlaceholder()).toBe(false);
      expect(await po.hasAddress()).toBe(true);
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

      await renderComponent(props);

      expect(spyGetAddress).not.toHaveBeenCalled();
    });

    it("should not render a spinner when loaded", async () => {
      const po = await renderComponent(props);

      expect(await po.hasSpinner()).toBe(false);
      expect(await po.hasSkeletonText()).toBe(false);
      expect(await po.hasQrCode()).toBe(true);
    });

    it("should display a sentence info", async () => {
      const po = await renderComponent(props);

      expect(await po.getText()).toContain(
        "incoming Bitcoin transactions require 12 confirmations. Check status on a"
      );
    });

    it("should display a link to block explorer", async () => {
      const po = await renderComponent(props);

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

    it("should display the BTC address", async () => {
      const po = await renderComponent(props);

      expect(await po.getAddress()).toBe(data.btcAddress);
    });

    it("should display a call to action to refresh balance", async () => {
      const po = await renderComponent(props);

      expect(await po.hasUpdateBalanceButton()).toBe(true);
    });

    it("should not show sign for address in message", async () => {
      const po = await renderComponent(props);
      expect(await po.hasSignInForAddressMessage()).toBe(false);
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
      const po = await renderComponent(props);

      expect(await po.getText()).toContain(
        "incoming Bitcoin transactions require  confirmations."
      );
    });
  });

  describe("without account", () => {
    const props = {
      account: undefined,
      minterCanisterId: CKTESTBTC_MINTER_CANISTER_ID,
      universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      reload: vi.fn(),
    };

    it("should not show block explorer link", async () => {
      const po = await renderComponent(props);
      expect(await po.hasBlockExplorerLink()).toBe(false);
    });

    it("should not show a skeleton text", async () => {
      const po = await renderComponent(props);
      expect(await po.hasSkeletonText()).toBe(false);
    });

    it("should not show a BTC address", async () => {
      const po = await renderComponent(props);
      expect(await po.hasAddress()).toBe(false);
    });

    it("should not show a QR code", async () => {
      const po = await renderComponent(props);
      expect(await po.hasQrCode()).toBe(false);
    });

    it("should show a QR code placeholder", async () => {
      const po = await renderComponent(props);
      expect(await po.hasQrCodePlaceholder()).toBe(true);
    });

    it("should not show a spinner", async () => {
      const po = await renderComponent(props);
      expect(await po.hasSpinner()).toBe(false);
    });

    it("should not show the update balance button", async () => {
      const po = await renderComponent(props);
      expect(await po.hasUpdateBalanceButton()).toBe(false);
    });

    it("should show sign for address in message", async () => {
      const po = await renderComponent(props);
      expect(await po.hasSignInForAddressMessage()).toBe(true);
    });

    it("should load BTC address if account is set after render", async () => {
      vi.spyOn(minterApi, "getBTCAddress").mockResolvedValue(
        mockBTCAddressTestnet
      );

      const { container, component } = render(CkBTCInfoCard, { props });
      await runResolvedPromises();
      const po = CkBTCInfoCardPo.under(new JestPageObjectElement(container));

      expect(await po.hasAddress()).toBe(false);
      component.$set({ account: mockCkBTCMainAccount });

      await runResolvedPromises();
      expect(await po.hasAddress()).toBe(true);
      expect(await po.getAddress()).toBe(mockBTCAddressTestnet);
    });
  });
});
