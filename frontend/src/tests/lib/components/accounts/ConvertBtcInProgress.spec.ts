import ConvertBtcInProgress from "$lib/components/accounts/ConvertBtcInProgress.svelte";
import { ConvertBtcStep } from "$lib/types/ckbtc-convert";
import en from "$tests/mocks/i18n.mock";
import { testProgress } from "$tests/utils/progress.test-utils";
import { render } from "@testing-library/svelte";

describe("ConvertBtcInProgress", () => {
  it("should render a warning to not close the browser", () => {
    const { getByTestId } = render(ConvertBtcInProgress, {
      props: {
        progressStep: ConvertBtcStep.APPROVE_TRANSFER,
      },
    });

    const element = getByTestId("in-progress-warning");

    expect(element).not.toBeNull();
    expect(element.textContent).toContain(en.core.this_may_take_a_few_minutes);
    expect(element.textContent).toContain(en.core.do_not_close);
  });

  describe("with ICRC-2 transfer approval", () => {
    it("should render steps while approving transfer", () => {
      const result = render(ConvertBtcInProgress, {
        props: {
          progressStep: ConvertBtcStep.APPROVE_TRANSFER,
        },
      });

      testProgress({
        result,
        position: 1,
        label: en.ckbtc.step_approve_transfer,
        status: "In progress",
      });

      expect(result.container.querySelectorAll(".step").length).toEqual(3);
    });

    it("should render steps while sending btc", () => {
      const result = render(ConvertBtcInProgress, {
        props: {
          progressStep: ConvertBtcStep.SEND_BTC,
        },
      });

      testProgress({
        result,
        position: 1,
        label: en.ckbtc.step_approve_transfer,
        status: "Completed",
      });

      testProgress({
        result,
        position: 2,
        label: en.ckbtc.step_send_btc,
        status: "In progress",
      });

      expect(result.container.querySelectorAll(".step").length).toEqual(3);
    });

    it("should render steps while reloading", () => {
      const result = render(ConvertBtcInProgress, {
        props: {
          progressStep: ConvertBtcStep.RELOAD,
        },
      });

      testProgress({
        result,
        position: 1,
        label: en.ckbtc.step_approve_transfer,
        status: "Completed",
      });

      testProgress({
        result,
        position: 2,
        label: en.ckbtc.step_send_btc,
        status: "Completed",
      });

      testProgress({
        result,
        position: 3,
        label: en.ckbtc.step_reload,
        status: "In progress",
      });

      expect(result.container.querySelectorAll(".step").length).toEqual(3);
    });

    it("should render steps when done", () => {
      const result = render(ConvertBtcInProgress, {
        props: {
          progressStep: ConvertBtcStep.DONE,
        },
      });

      testProgress({
        result,
        position: 1,
        label: en.ckbtc.step_approve_transfer,
        status: "Completed",
      });

      testProgress({
        result,
        position: 2,
        label: en.ckbtc.step_send_btc,
        status: "Completed",
      });

      testProgress({
        result,
        position: 3,
        label: en.ckbtc.step_reload,
        status: "Completed",
      });

      expect(result.container.querySelectorAll(".step").length).toEqual(3);
    });
  });
});
