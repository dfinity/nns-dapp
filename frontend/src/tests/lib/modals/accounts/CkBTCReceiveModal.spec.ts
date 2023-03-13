/**
 * @jest-environment jsdom
 */

import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import CkBTCReceiveModal from "$lib/modals/accounts/CkBTCReceiveModal.svelte";
import * as services from "$lib/services/ckbtc-minter.services";
import { tokensStore } from "$lib/stores/tokens.store";
import type { UniverseCanisterId } from "$lib/types/universe";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { mockCkBTCAdditionalCanisters } from "$tests/mocks/canisters.mock";
import {
  mockBTCAddressTestnet,
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import en from "$tests/mocks/i18n.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import {
  mockTokensSubscribe,
  mockUniversesTokens,
} from "$tests/mocks/tokens.mock";
import { fireEvent, waitFor } from "@testing-library/svelte";
import { page } from "../../../../../__mocks__/$app/stores";
import { mockCkBTCAddress } from "../../../mocks/ckbtc-accounts.mock";

jest.mock("$lib/services/ckbtc-minter.services", () => {
  return {
    updateBalance: jest.fn().mockImplementation(() => undefined),
  };
});

describe("BtcCkBTCReceiveModal", () => {
  const reloadAccountSpy = jest.fn();

  beforeEach(() => jest.clearAllMocks());

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
          reloadAccount: reloadAccountSpy,
          canisters: mockCkBTCAdditionalCanisters,
        },
      },
    });

  it("should render a QR code", async () => {
    const { getByTestId } = await renderReceiveModal({});

    expect(getByTestId("qr-code")).toBeInTheDocument();
  });

  describe("with btc", () => {
    it("should render BTC address", async () => {
      const { getByText } = await renderReceiveModal({});

      expect(getByText(mockBTCAddressTestnet)).toBeInTheDocument();
    });

    const selectCkBTC = async (container: HTMLElement) => {
      const button = container.querySelector(
        "div.segment-button:nth-of-type(3) button"
      ) as HTMLButtonElement;
      expect(button).not.toBeNull();

      await fireEvent.click(button);
    };

    it("should render account identifier (without being shortened)", async () => {
      const { getByText, container } = await renderReceiveModal({});

      await selectCkBTC(container);

      await waitFor(() =>
        expect(getByText(mockCkBTCMainAccount.identifier)).toBeInTheDocument()
      );
    });

    it("should render a bitcoin description", async () => {
      const { getByText } = await renderReceiveModal({});

      expect(getByText(en.ckbtc.btc_receive_note_title)).toBeInTheDocument();
      expect(getByText(en.ckbtc.btc_receive_note_text)).toBeInTheDocument();
    });

    it("should render a ckBTC description", async () => {
      const { getByText, container } = await renderReceiveModal({});

      await selectCkBTC(container);

      await waitFor(() =>
        expect(getByText(en.ckbtc.ckbtc_receive_note_title)).toBeInTheDocument()
      );
      await waitFor(() =>
        expect(getByText(en.ckbtc.ckbtc_receive_note_text)).toBeInTheDocument()
      );
    });

    it("should render a bitcoin logo", async () => {
      const { getByTestId } = await renderReceiveModal({});

      expect(getByTestId("logo")?.getAttribute("alt")).toEqual(
        en.ckbtc.bitcoin
      );
    });

    it("should render ckBTC logo", async () => {
      const { getByTestId, container } = await renderReceiveModal({});

      await selectCkBTC(container);

      await waitFor(() =>
        expect(getByTestId("logo")?.getAttribute("alt")).toEqual(
          en.ckbtc.test_title
        )
      );
    });

    const updateBalance = async (
      dataTid: "update-ckbtc-balance" | "backdrop"
    ) => {
      const spyUpdateBalance = jest.spyOn(services, "updateBalance");

      const { getByTestId } = await renderReceiveModal({});

      fireEvent.click(getByTestId(dataTid) as HTMLButtonElement);

      await waitFor(() => expect(spyUpdateBalance).toHaveBeenCalled());
    };

    it("should update balance", async () => {
      await updateBalance("update-ckbtc-balance");
    });

    it("should update balance on backdrop close", async () => {
      await updateBalance("backdrop");
    });

    it("should reload account after update balance", async () => {
      const { getByTestId } = await renderReceiveModal({});

      fireEvent.click(getByTestId("update-ckbtc-balance") as HTMLButtonElement);

      await waitFor(() => expect(reloadAccountSpy).toHaveBeenCalled());
    });

    const notUpdateBalance = async (
      dataTid: "reload-receive-account" | "backdrop"
    ) => {
      const spyUpdateBalance = jest.spyOn(services, "updateBalance");

      const { getByTestId, container } = await renderReceiveModal({});

      await selectCkBTC(container);

      fireEvent.click(getByTestId(dataTid) as HTMLButtonElement);

      expect(spyUpdateBalance).not.toHaveBeenCalled();
    };

    it("should only reload account", async () => {
      await notUpdateBalance("reload-receive-account");

      await waitFor(() => expect(reloadAccountSpy).toHaveBeenCalled());
    });

    it("should not update balance", async () => {
      await notUpdateBalance("backdrop");

      expect(reloadAccountSpy).not.toHaveBeenCalled();
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

      const title = replacePlaceholders(en.wallet.sns_receive_note_title, {
        $tokenSymbol: mockCkBTCToken.symbol,
      });

      const description = replacePlaceholders(en.wallet.sns_receive_note_text, {
        $tokenSymbol: mockCkBTCToken.symbol,
      });

      await waitFor(() => expect(getByText(title)).toBeInTheDocument());
      await waitFor(() => expect(getByText(description)).toBeInTheDocument());
    });

    it("should only reload account", async () => {
      const spyUpdateBalance = jest.spyOn(services, "updateBalance");

      const { getByTestId } = await renderReceiveModal(params);

      fireEvent.click(
        getByTestId("reload-receive-account") as HTMLButtonElement
      );

      expect(spyUpdateBalance).not.toHaveBeenCalled();

      await waitFor(() => expect(reloadAccountSpy).toHaveBeenCalled());
    });

    it("should render ckBTC logo", async () => {
      const { getByTestId } = await renderReceiveModal(params);

      await waitFor(() =>
        expect(getByTestId("logo")?.getAttribute("alt")).toEqual(en.ckbtc.title)
      );
    });
  });
});
