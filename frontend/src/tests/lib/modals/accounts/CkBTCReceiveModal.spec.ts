/**
 * @jest-environment jsdom
 */

import * as api from "$lib/api/ckbtc-minter.api";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import CkBTCReceiveModal from "$lib/modals/accounts/CkBTCReceiveModal.svelte";
import { bitcoinAddressStore } from "$lib/stores/bitcoin.store";
import { tokensStore } from "$lib/stores/tokens.store";
import type { UniverseCanisterId } from "$lib/types/universe";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { mockCkBTCAdditionalCanisters } from "$tests/mocks/canisters.mock";
import {
  mockBTCAddressTestnet,
  mockCkBTCAddress,
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import en from "$tests/mocks/i18n.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import {
  mockTokensSubscribe,
  mockUniversesTokens,
} from "$tests/mocks/tokens.mock";
import { selectSegmentBTC } from "$tests/utils/accounts.test-utils";
import type { UpdateBalanceOk } from "@dfinity/ckbtc";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";
import { fireEvent, waitFor } from "@testing-library/svelte";
import { page } from "../../../../../__mocks__/$app/stores";

jest.mock("$lib/api/ckbtc-minter.api");

describe("BtcCkBTCReceiveModal", () => {
  const reloadSpy = jest.fn();

  const success: UpdateBalanceOk = [
    {
      Checked: {
        height: 123,
        value: 123n,
        outpoint: { txid: arrayOfNumberToUint8Array([0, 0, 1]), vout: 123 },
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(api, "updateBalance").mockResolvedValue(success);
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

  it("should render a QR code", async () => {
    const { getByTestId } = await renderReceiveModal({});

    expect(getByTestId("qr-code")).toBeInTheDocument();
  });

  describe("with btc", () => {
    describe("with BTC address", () => {
      beforeEach(() => {
        bitcoinAddressStore.set({
          identifier: mockCkBTCMainAccount.identifier,
          btcAddress: mockBTCAddressTestnet,
        });
      });

      it("should render BTC address", async () => {
        const { getByText, container } = await renderReceiveModal({});

        expect(() => getByText(mockBTCAddressTestnet)).toThrow();

        await selectSegmentBTC(container);

        expect(getByText(mockBTCAddressTestnet)).toBeInTheDocument();
      });

      it("should render account identifier (without being shortened)", async () => {
        const { getByText } = await renderReceiveModal({});

        await waitFor(() =>
          expect(getByText(mockCkBTCMainAccount.identifier)).toBeInTheDocument()
        );
      });

      // TODO: to be activated when ckBTC with minter is live
      it.skip("should render a bitcoin description", async () => {
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

      // TODO: to be activated when ckBTC with minter is live
      it.skip("should render a bitcoin logo", async () => {
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

      const shouldCallUpdateBalance = async (
        dataTid: "update-ckbtc-balance" | "backdrop"
      ) => {
        const spyUpdateBalance = jest.spyOn(api, "updateBalance");

        const { getByTestId, container } = await renderReceiveModal({});

        await selectSegmentBTC(container);

        fireEvent.click(getByTestId(dataTid) as HTMLButtonElement);

        return spyUpdateBalance;
      };

      it("should update balance", async () => {
        const spy = await shouldCallUpdateBalance("update-ckbtc-balance");
        await waitFor(() => expect(spy).toHaveBeenCalled());
      });

      it("should not update balance on backdrop close", async () => {
        const spy = await shouldCallUpdateBalance("backdrop");
        await waitFor(() => expect(spy).not.toHaveBeenCalled());
      });

      it("should reload account after update balance", async () => {
        const { getByTestId, container } = await renderReceiveModal({});

        await selectSegmentBTC(container);

        fireEvent.click(
          getByTestId("update-ckbtc-balance") as HTMLButtonElement
        );

        await waitFor(() => expect(reloadSpy).toHaveBeenCalled());
      });

      const shouldNotCallUpdateBalance = async (
        dataTid: "reload-receive-account" | "backdrop"
      ) => {
        const spyUpdateBalance = jest.spyOn(api, "updateBalance");

        const { getByTestId } = await renderReceiveModal({});

        fireEvent.click(getByTestId(dataTid) as HTMLButtonElement);

        expect(spyUpdateBalance).not.toHaveBeenCalled();
      };

      it("should only reload account", async () => {
        await shouldNotCallUpdateBalance("reload-receive-account");

        await waitFor(() => expect(reloadSpy).toHaveBeenCalled());
      });

      it("should not update balance", async () => {
        await shouldNotCallUpdateBalance("backdrop");

        expect(reloadSpy).not.toHaveBeenCalled();
      });
    });

    describe("without BTC address", () => {
      beforeEach(() => {
        bitcoinAddressStore.reset();
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
  });

  describe("without btc", () => {
    beforeAll(() => {
      jest
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

    it("should only reload account", async () => {
      const spyUpdateBalance = jest.spyOn(api, "updateBalance");

      const { getByTestId } = await renderReceiveModal(params);

      fireEvent.click(
        getByTestId("reload-receive-account") as HTMLButtonElement
      );

      expect(spyUpdateBalance).not.toHaveBeenCalled();

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
