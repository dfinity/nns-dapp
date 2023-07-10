import * as minterApi from "$lib/api/ckbtc-minter.api";
import {
  CKBTC_MINTER_CANISTER_ID,
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import CkBTCReceiveModal from "$lib/modals/accounts/CkBTCReceiveModal.svelte";
import { bitcoinAddressStore } from "$lib/stores/bitcoin.store";
import { ckBTCInfoStore } from "$lib/stores/ckbtc-info.store";
import { tokensStore } from "$lib/stores/tokens.store";
import type { UniverseCanisterId } from "$lib/types/universe";
import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockCkBTCAdditionalCanisters } from "$tests/mocks/canisters.mock";
import {
  mockBTCAddressTestnet,
  mockCkBTCAddress,
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockCkBTCMinterInfo } from "$tests/mocks/ckbtc-minter.mock";
import en from "$tests/mocks/i18n.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import {
  mockTokensSubscribe,
  mockUniversesTokens,
} from "$tests/mocks/tokens.mock";
import { selectSegmentBTC } from "$tests/utils/accounts.test-utils";
import { fireEvent, waitFor } from "@testing-library/svelte";
import { page } from "../../../../../__mocks__/$app/stores";
import {vi} from "vitest";

vi.mock("$lib/api/ckbtc-minter.api");

describe("BtcCkBTCReceiveModal", () => {
  const reloadSpy = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderReceiveModal = ({
    displayBtcAddress = true,
    universeId = CKTESTBTC_UNIVERSE_CANISTER_ID,
  }: {
    displayBtcAddress?: boolean;
    universeId?: UniverseCanisterId;
  }) =>
    renderModal({
      component: CkBTCReceiveModal,
      props: {
        data: {
          universeId,
          displayBtcAddress,
          account: mockCkBTCMainAccount,
          btcAddress: mockBTCAddressTestnet,
          reload: reloadSpy,
          canisters: mockCkBTCAdditionalCanisters,
        },
      },
    });

  describe("not matching bitcoin address store", () => {
    let spyGetAddress;

    beforeEach(() => {
      spyGetAddress = vi
        .spyOn(minterApi, "getBTCAddress")
        .mockResolvedValue(mockBTCAddressTestnet);
    });

    it("should load bitcoin address on mount", async () => {
      await renderReceiveModal({});

      await waitFor(() =>
        expect(spyGetAddress).toBeCalledWith({
          identity: mockIdentity,
          canisterId: CKBTC_MINTER_CANISTER_ID,
        })
      );
    });
  });

  describe("with btc", () => {
    describe("without BTC address", () => {
      beforeEach(() => {
        bitcoinAddressStore.reset();

        vi.spyOn(minterApi, "getBTCAddress").mockResolvedValue(undefined);
      });

      it("should render spinner while loading BTC address", async () => {
        const { getByText, getByTestId, container } = await renderReceiveModal(
          {}
        );

        await selectSegmentBTC(container);

        expect(getByTestId("spinner")).not.toBeNull();
        expect(getByText(en.ckbtc.loading_address)).toBeInTheDocument();
      });
    });

    describe("with BTC address", () => {
      beforeEach(() => {
        bitcoinAddressStore.set({
          identifier: mockCkBTCMainAccount.identifier,
          btcAddress: mockBTCAddressTestnet,
        });

        ckBTCInfoStore.setInfo({
          canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID,
          info: {
            ...mockCkBTCMinterInfo,
            kyt_fee: 789n,
          },
          certified: true,
        });
      });

      it("should render BTC address", async () => {
        const { getByText, container } = await renderReceiveModal({});

        expect(() => getByText(mockBTCAddressTestnet)).toThrow();

        await selectSegmentBTC(container);

        expect(getByText(mockBTCAddressTestnet)).toBeInTheDocument();
      });

      it("should render a KYT fee", async () => {
        const { getByTestId, container } = await renderReceiveModal({});

        await selectSegmentBTC(container);

        await waitFor(() => {
          expect(
            getByTestId("kyt-estimated-fee-label")?.textContent.trim()
          ).toEqual(`${en.accounts.estimated_internetwork_fee}`);

          expect(getByTestId("kyt-estimated-fee")?.textContent).toEqual(
            `${formatEstimatedFee(789n)} ${en.ckbtc.btc}`
          );
        });
      });

      it("should render account identifier (without being shortened)", async () => {
        const { getByText } = await renderReceiveModal({});

        await waitFor(() =>
          expect(getByText(mockCkBTCMainAccount.identifier)).toBeInTheDocument()
        );
      });

      it("should render a bitcoin description", async () => {
        const { getByText, container } = await renderReceiveModal({
          universeId: CKBTC_UNIVERSE_CANISTER_ID,
        });

        await selectSegmentBTC(container);

        const title = replacePlaceholders(en.wallet.token_address, {
          $tokenSymbol: en.ckbtc.bitcoin,
        });

        expect(getByText(title)).toBeInTheDocument();
      });

      it("should render a test bitcoin description", async () => {
        const { getByText, container } = await renderReceiveModal({});

        await selectSegmentBTC(container);

        const title = replacePlaceholders(en.wallet.token_address, {
          $tokenSymbol: en.ckbtc.test_bitcoin,
        });

        expect(getByText(title)).toBeInTheDocument();
      });

      it("should render a ckBTC description", async () => {
        const { getByText } = await renderReceiveModal({});

        const title = replacePlaceholders(en.wallet.token_address, {
          $tokenSymbol: en.ckbtc.test_title,
        });

        await waitFor(() => expect(getByText(title)).toBeInTheDocument());
      });

      it("should render a bitcoin logo", async () => {
        const { getByTestId, container } = await renderReceiveModal({
          universeId: CKBTC_UNIVERSE_CANISTER_ID,
        });

        await selectSegmentBTC(container);

        expect(getByTestId("logo").getAttribute("alt")).toEqual(
          en.ckbtc.bitcoin
        );
      });

      it("should render a test bitcoin logo", async () => {
        const { getByTestId, container } = await renderReceiveModal({});

        await selectSegmentBTC(container);

        expect(getByTestId("logo").getAttribute("alt")).toEqual(
          en.ckbtc.test_bitcoin
        );
      });

      it("should render ckBTC logo", async () => {
        const { getByTestId } = await renderReceiveModal({});

        await waitFor(() =>
          expect(getByTestId("logo").getAttribute("alt")).toEqual(
            en.ckbtc.test_title
          )
        );
      });

      const shouldCallFinish = async (
        dataTid: "reload-receive-account" | "backdrop"
      ) => {
        const { getByTestId } = await renderReceiveModal({});

        fireEvent.click(getByTestId(dataTid) as HTMLButtonElement);
      };

      it("should only reload account", async () => {
        await shouldCallFinish("reload-receive-account");

        await waitFor(() => expect(reloadSpy).toHaveBeenCalled());
      });

      it("should not reload account", async () => {
        await shouldCallFinish("backdrop");

        expect(reloadSpy).not.toHaveBeenCalled();
      });
    });
  });

  it("should render a QR code", async () => {
    const { getByTestId } = await renderReceiveModal({});

    expect(getByTestId("qr-code")).toBeInTheDocument();
  });

  describe("without btc", () => {
    beforeAll(() => {
      vi
        .spyOn(tokensStore, "subscribe")
        .mockImplementation(mockTokensSubscribe(mockUniversesTokens));

      page.mock({
        data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Wallet,
      });
    });

    const params = {
      displayBtcAddress: false,
      universeId: CKBTC_UNIVERSE_CANISTER_ID,
    };

    it("should render BTC address", async () => {
      const { getByText } = await renderReceiveModal(params);

      expect(() => getByText(mockCkBTCAddress)).toThrow();
    });

    it("should render account identifier (without being shortened)", async () => {
      const { getByText } = await renderReceiveModal(params);

      await waitFor(() =>
        expect(getByText(mockCkBTCMainAccount.identifier)).toBeInTheDocument()
      );
    });

    it("should render a ckBTC description", async () => {
      const { getByText } = await renderReceiveModal(params);

      const title = replacePlaceholders(en.wallet.token_address, {
        $tokenSymbol: mockCkBTCToken.symbol,
      });

      await waitFor(() => expect(getByText(title)).toBeInTheDocument());
    });

    it("should reload account", async () => {
      const { getByTestId } = await renderReceiveModal(params);

      fireEvent.click(
        getByTestId("reload-receive-account") as HTMLButtonElement
      );

      await waitFor(() => expect(reloadSpy).toHaveBeenCalled());
    });

    it("should render ckBTC logo", async () => {
      const { getByTestId } = await renderReceiveModal(params);

      await waitFor(() =>
        expect(getByTestId("logo").getAttribute("alt")).toEqual(en.ckbtc.title)
      );
    });
  });
});
