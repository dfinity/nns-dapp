/**
 * @jest-environment jsdom
 */
import SetDissolveDelay from "$lib/components/neurons/SetDissolveDelay.svelte";
import {
  SECONDS_IN_DAY,
  SECONDS_IN_EIGHT_YEARS,
  SECONDS_IN_HALF_YEAR,
} from "$lib/constants/constants";
import en from "$tests/mocks/i18n.mock";
import { SetDissolveDelayPo } from "$tests/page-objects/SetDissolveDelay.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronState } from "@dfinity/nns";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

const defaultComponentProps = {
  neuronState: NeuronState.Locked,
  neuronDissolveDelaySeconds: 0,
  neuronStake: TokenAmount.fromE8s({
    amount: BigInt(200_000_000),
    token: ICPToken,
  }),
  delayInSeconds: 0,
  minProjectDelayInSeconds: SECONDS_IN_HALF_YEAR,
  maxDelayInSeconds: SECONDS_IN_EIGHT_YEARS,
  calculateVotingPower: () => 0,
  minDissolveDelayDescription: "",
};

describe("SetDissolveDelay", () => {
  const getDelayInSeconds = (component) =>
    component.$$.ctx[component.$$.props["delayInSeconds"]];

  const renderComponent = (props = {}) => {
    const { container } = render(SetDissolveDelay, {
      props: {
        ...defaultComponentProps,
        ...props,
      },
    });
    return SetDissolveDelayPo.under(new JestPageObjectElement(container));
  };

  describe("current dissolve delay is Max - (less than a day in seconds)", () => {
    it("should enable button if user clicks Max button", async () => {
      const neuronDissolveDelaySeconds = SECONDS_IN_EIGHT_YEARS - 10;
      const po = renderComponent({
        neuronDissolveDelaySeconds: BigInt(neuronDissolveDelaySeconds),
        delayInSeconds: neuronDissolveDelaySeconds,
        maxDelayInSeconds: SECONDS_IN_EIGHT_YEARS,
      });
      // Clicking Max is not even necessary because the displayed number of days
      // already represents an increase in the number of seconds and is
      // therefore already a valid input.
      expect(await po.getUpdateButtonPo().isDisabled()).toBe(false);

      await po.clickMax();
      expect(await po.getUpdateButtonPo().isDisabled()).toBe(false);
    });
  });

  it("should initialize text and slider correctly", async () => {
    const neuronDissolveDelaySeconds = 90 * SECONDS_IN_DAY;
    const po = renderComponent({
      neuronDissolveDelaySeconds: BigInt(neuronDissolveDelaySeconds),
      delayInSeconds: neuronDissolveDelaySeconds,
    });

    expect(await po.getDays()).toBe(90);
    expect(await po.getSliderDays()).toBe(90);
  });

  it("fractional days get rounded up", async () => {
    // 1 extra second turns into 1 extra day.
    const neuronDissolveDelaySeconds = 90 * SECONDS_IN_DAY + 1;
    const po = renderComponent({
      neuronDissolveDelaySeconds: BigInt(neuronDissolveDelaySeconds),
      delayInSeconds: neuronDissolveDelaySeconds,
    });

    expect(await po.getDays()).toBe(91);
    expect(await po.getSliderDays()).toBe(91);
  });

  it("should update slider on text input", async () => {
    const po = renderComponent();
    await po.enterDays(1);
    expect(await po.getSliderDays()).toBe(1);

    await po.enterDays(1000);
    expect(await po.getSliderDays()).toBe(1000);

    await po.enterDays(0);
    expect(await po.getSliderDays()).toBe(0);
  });

  it("should update text on slider input", async () => {
    const po = renderComponent();
    await po.setSliderDays(1);
    expect(await po.getDays()).toBe(1);

    await po.setSliderDays(1000);
    expect(await po.getDays()).toBe(1000);

    await po.setSliderDays(0);
    expect(await po.getDays()).toBe(0);
  });

  describe("should update error message and button state", () => {
    it("when text input below or equal to current delay", async () => {
      const neuronDays = 365;
      const neuronDissolveDelaySeconds = neuronDays * SECONDS_IN_DAY;
      const projectMinDays = 183;

      const po = renderComponent({
        neuronDissolveDelaySeconds: BigInt(neuronDissolveDelaySeconds),
        minProjectDelayInSeconds: projectMinDays * SECONDS_IN_DAY,
        delayInSeconds: neuronDissolveDelaySeconds,
        maxDelayInSeconds: SECONDS_IN_EIGHT_YEARS,
      });

      expect(await po.getUpdateButtonPo().isDisabled()).toBe(true);
      expect(await po.getErrorMessage()).toBe(null);

      await po.enterDays(neuronDays);
      expect(await po.getErrorMessage()).toBe(
        en.neurons.dissolve_delay_below_current
      );
      expect(await po.getUpdateButtonPo().isDisabled()).toBe(true);

      await po.enterDays(neuronDays + 1);
      expect(await po.getErrorMessage()).toBe(null);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(await po.getUpdateButtonPo().isDisabled()).toBe(false);
    });

    it("when text input below min project delay", async () => {
      const neuronDays = 0;
      const neuronDissolveDelaySeconds = neuronDays * SECONDS_IN_DAY;
      const projectMinDays = 183;

      const po = renderComponent({
        neuronDissolveDelaySeconds: BigInt(neuronDissolveDelaySeconds),
        minProjectDelayInSeconds: projectMinDays * SECONDS_IN_DAY,
        delayInSeconds: neuronDissolveDelaySeconds,
        maxDelayInSeconds: SECONDS_IN_EIGHT_YEARS,
      });

      expect(await po.getUpdateButtonPo().isDisabled()).toBe(true);
      expect(await po.getErrorMessage()).toBe(null);

      await po.enterDays(projectMinDays - 1);
      expect(await po.getUpdateButtonPo().isDisabled()).toBe(true);
      expect(await po.getErrorMessage()).toBe(
        en.neurons.dissolve_delay_below_minimum
      );

      await po.enterDays(projectMinDays);
      expect(await po.getUpdateButtonPo().isDisabled()).toBe(false);
      expect(await po.getErrorMessage()).toBe(null);
    });

    it("when text input above max project delay", async () => {
      const projectMaxDays = 3000;

      const po = renderComponent({
        maxDelayInSeconds: SECONDS_IN_DAY * projectMaxDays,
      });

      await po.enterDays(projectMaxDays);
      expect(await po.getUpdateButtonPo().isDisabled()).toBe(false);
      expect(await po.getErrorMessage()).toBe(null);
      await po.enterDays(projectMaxDays + 1);
      expect(await po.getUpdateButtonPo().isDisabled()).toBe(true);
      expect(await po.getErrorMessage()).toBe(
        en.neurons.dissolve_delay_above_maximum
      );
    });

    it("when slider input below or equal to current delay", async () => {
      const neuronDays = 365;
      const neuronDissolveDelaySeconds = neuronDays * SECONDS_IN_DAY;
      const projectMinDays = 183;

      const po = renderComponent({
        neuronDissolveDelaySeconds: BigInt(neuronDissolveDelaySeconds),
        minProjectDelayInSeconds: projectMinDays * SECONDS_IN_DAY,
        delayInSeconds: neuronDissolveDelaySeconds,
        maxDelayInSeconds: SECONDS_IN_EIGHT_YEARS,
      });

      expect(await po.getUpdateButtonPo().isDisabled()).toBe(true);
      expect(await po.getErrorMessage()).toBe(null);

      await po.setSliderDays(neuronDays);
      expect(await po.getErrorMessage()).toBe(
        en.neurons.dissolve_delay_below_current
      );
      expect(await po.getUpdateButtonPo().isDisabled()).toBe(true);

      await po.setSliderDays(neuronDays + 1);
      expect(await po.getErrorMessage()).toBe(null);
      expect(await po.getUpdateButtonPo().isDisabled()).toBe(false);
    });

    it("when slider input below min project delay", async () => {
      const neuronDays = 0;
      const neuronDissolveDelaySeconds = neuronDays * SECONDS_IN_DAY;
      const projectMinDays = 183;

      const po = renderComponent({
        neuronDissolveDelaySeconds: BigInt(neuronDissolveDelaySeconds),
        minProjectDelayInSeconds: projectMinDays * SECONDS_IN_DAY,
        delayInSeconds: neuronDissolveDelaySeconds,
        maxDelayInSeconds: SECONDS_IN_EIGHT_YEARS,
      });

      expect(await po.getUpdateButtonPo().isDisabled()).toBe(true);
      expect(await po.getErrorMessage()).toBe(null);

      await po.setSliderDays(projectMinDays - 1);
      expect(await po.getUpdateButtonPo().isDisabled()).toBe(true);
      expect(await po.getErrorMessage()).toBe(
        en.neurons.dissolve_delay_below_minimum
      );

      await po.setSliderDays(projectMinDays);
      expect(await po.getUpdateButtonPo().isDisabled()).toBe(false);
      expect(await po.getErrorMessage()).toBe(null);
    });
  });

  it("can set same number of days when current number of days is fractional", async () => {
    // 1 extra second turns into 1 extra day.
    const neuronDissolveDelaySeconds = 1000 * SECONDS_IN_DAY + 1;
    const po = renderComponent({
      neuronDissolveDelaySeconds: BigInt(neuronDissolveDelaySeconds),
      delayInSeconds: neuronDissolveDelaySeconds,
    });

    expect(await po.getDays()).toBe(1001);
    expect(await po.getSliderDays()).toBe(1001);

    expect(await po.getErrorMessage()).toBe(null);
    expect(await po.getUpdateButtonPo().isDisabled()).toBe(false);

    await po.enterDays(1002);
    expect(await po.getErrorMessage()).toBe(null);
    expect(await po.getUpdateButtonPo().isDisabled()).toBe(false);

    await po.enterDays(1000);
    expect(await po.getErrorMessage()).toBe(
      en.neurons.dissolve_delay_below_current
    );
    expect(await po.getUpdateButtonPo().isDisabled()).toBe(true);

    await po.enterDays(1001);
    expect(await po.getErrorMessage()).toBe(null);
    expect(await po.getUpdateButtonPo().isDisabled()).toBe(false);
  });

  it("should update prop on text input", async () => {
    const { container, component } = render(SetDissolveDelay, {
      props: defaultComponentProps,
    });
    const po = SetDissolveDelayPo.under(new JestPageObjectElement(container));

    await po.enterDays(100);
    expect(getDelayInSeconds(component)).toBe(100 * SECONDS_IN_DAY);

    await po.enterDays(200);
    expect(getDelayInSeconds(component)).toBe(200 * SECONDS_IN_DAY);
  });

  it("should update prop on slider input", async () => {
    const { container, component } = render(SetDissolveDelay, {
      props: defaultComponentProps,
    });
    const po = SetDissolveDelayPo.under(new JestPageObjectElement(container));

    await po.setSliderDays(100);
    expect(getDelayInSeconds(component)).toBe(100 * SECONDS_IN_DAY);

    await po.setSliderDays(200);
    expect(getDelayInSeconds(component)).toBe(200 * SECONDS_IN_DAY);
  });

  it("should update prop, text and slider on Min/Max", async () => {
    const minProjectDelayInDays = 50;
    const maxDelayInDays = 500;
    const minProjectDelayInSeconds = minProjectDelayInDays * SECONDS_IN_DAY;
    const maxDelayInSeconds = maxDelayInDays * SECONDS_IN_DAY;

    const { container, component } = render(SetDissolveDelay, {
      props: {
        ...defaultComponentProps,
        delayInSeconds: 0,
        minProjectDelayInSeconds,
        maxDelayInSeconds,
      },
    });
    const po = SetDissolveDelayPo.under(new JestPageObjectElement(container));

    expect(getDelayInSeconds(component)).toBe(0);

    // Clicking "Min" can increase the delay to the minimum.
    await po.clickMin();
    expect(getDelayInSeconds(component)).toBe(minProjectDelayInSeconds);
    expect(await po.getDays()).toBe(minProjectDelayInDays);
    expect(await po.getSliderDays()).toBe(minProjectDelayInDays);

    await po.clickMax();
    expect(getDelayInSeconds(component)).toBe(maxDelayInSeconds);
    expect(await po.getDays()).toBe(maxDelayInDays);
    expect(await po.getSliderDays()).toBe(maxDelayInDays);

    // Clicking "Min" can decrease the delay to the minimum.
    await po.clickMin();
    expect(getDelayInSeconds(component)).toBe(minProjectDelayInSeconds);
    expect(await po.getDays()).toBe(minProjectDelayInDays);
    expect(await po.getSliderDays()).toBe(minProjectDelayInDays);
  });
});
