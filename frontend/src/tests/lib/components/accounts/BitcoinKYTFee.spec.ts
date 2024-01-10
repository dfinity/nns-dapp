import BitcoinKYTFee from "$lib/components/accounts/BitcoinKYTFee.svelte";
import { CKTESTBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { ckBTCInfoStore } from "$lib/stores/ckbtc-info.store";
import { formatEstimatedFee } from "$lib/utils/bitcoin.utils";
import { mockCkBTCMinterInfo } from "$tests/mocks/ckbtc-minter.mock";
import en from "$tests/mocks/i18n.mock";
import { render } from "@testing-library/svelte";

describe("BitcoinKYTFee", () => {
  const props = {
    universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
  };

  beforeEach(() => {
    ckBTCInfoStore.reset();
  });

  describe("display fee", () => {
    const result = 789n;

    beforeEach(() => {
      ckBTCInfoStore.setInfo({
        canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID,
        info: {
          ...mockCkBTCMinterInfo,
          kyt_fee: 789n,
        },
        certified: true,
      });
    });

    it("should display kyt fee", () => {
      const { getByTestId } = render(BitcoinKYTFee, {
        props,
      });

      expect(getByTestId("kyt-estimated-fee-label")).not.toBeNull();

      const label = getByTestId("kyt-estimated-fee-label")?.textContent ?? "";
      expect(
        label.includes(en.accounts.estimated_internetwork_fee)
      ).toBeTruthy();

      const fee = getByTestId("kyt-estimated-fee")?.textContent ?? "";
      expect(fee.includes(`${formatEstimatedFee(result)}`)).toBeTruthy();
      expect(fee.includes(en.ckbtc.btc)).toBeTruthy();
    });
  });

  describe("no fee", () => {
    it("should not display kyt fee", async () => {
      const { getByTestId } = render(BitcoinKYTFee, {
        props,
      });

      expect(() => getByTestId("kyt-estimated-fee-label")).toThrow();
      expect(() => getByTestId("kyt-estimated-fee")).toThrow();
    });
  });
});
