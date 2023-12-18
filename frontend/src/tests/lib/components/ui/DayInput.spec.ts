import DayInput from "$lib/components/ui/DayInput.svelte";
import { SECONDS_IN_DAY, SECONDS_IN_YEAR } from "$lib/constants/constants";
import en from "$tests/mocks/i18n.mock";
import { fireEvent, render } from "@testing-library/svelte";
import { tick } from "svelte";
import DayInputTest from "./DayInputTest.svelte";

describe("DayInput", () => {
  const defaultProps = {
    seconds: 10,
    maxInSeconds: 100,
    minInSeconds: 5,
    getInputError: () => undefined,
  };

  it("should render a default name attribute", () => {
    const { container } = render(DayInput, { props: defaultProps });
    expect(container.querySelector("input")?.getAttribute("name")).toEqual(
      "amount"
    );
  });

  it("should render a custom name attribute", () => {
    const { container } = render(DayInput, {
      props: {
        name: "custom",
        ...defaultProps,
      },
    });
    expect(container.querySelector("input")?.getAttribute("name")).toEqual(
      "custom"
    );
  });

  it("should render a default placeholder attribute", () => {
    const { container } = render(DayInput, { props: defaultProps });
    expect(
      container.querySelector("input")?.getAttribute("placeholder")
    ).toEqual(en.core.amount);
  });

  it("should render an error message after changing value", async () => {
    const { queryByText, container } = render(DayInput, {
      props: {
        ...defaultProps,
        getInputError: () => "error",
      },
    });
    expect(queryByText("error")).toBeNull();
    await fireEvent.input(container.querySelector("input"), { target: "12" });
    expect(queryByText("error")).toBeInTheDocument();
  });

  it("should render a custom placeholder attribute", () => {
    const { container } = render(DayInput, {
      props: {
        placeholderLabelKey: "neurons.dissolve_delay_placeholder",
        ...defaultProps,
      },
    });
    expect(
      container.querySelector("input")?.getAttribute("placeholder")
    ).toEqual(en.neurons.dissolve_delay_placeholder);
  });

  it("should render days inside the input", async () => {
    const days = 6;

    const { container } = render(DayInput, {
      props: {
        ...defaultProps,
        seconds: SECONDS_IN_DAY * days,
        maxInSeconds: SECONDS_IN_YEAR,
      },
    });

    expect(container.querySelector("input").value).toBe(days.toString());
  });

  it("should update seconds when days are changed", async () => {
    const initialSeconds = SECONDS_IN_DAY;

    const { queryByTestId, container } = render(DayInputTest, {
      props: {
        ...defaultProps,
        maxInSeconds: SECONDS_IN_YEAR,
        seconds: initialSeconds,
      },
    });

    expect(queryByTestId("seconds")?.textContent).toBe(
      initialSeconds.toString()
    );
    const inputElement = container.querySelector("input");
    const days = 2;

    await fireEvent.input(inputElement, {
      target: { value: days },
    });

    await tick();
    expect(queryByTestId("seconds")?.textContent).toBe(
      String(SECONDS_IN_DAY * days)
    );
  });

  it("should update seconds and input on Min/Max click", async () => {
    const initialSeconds = SECONDS_IN_DAY;
    const minInSeconds = SECONDS_IN_DAY * 30;
    const maxInSeconds = SECONDS_IN_YEAR;

    const { container, queryByTestId } = render(DayInputTest, {
      props: {
        seconds: initialSeconds,
        maxInSeconds,
        minInSeconds,
        getInputError: () => null,
      },
    });

    const minButton = queryByTestId("min-button");
    const maxButton = queryByTestId("max-button");
    const inputElement = container.querySelector("input");

    expect(queryByTestId("seconds")?.textContent).toBe(
      initialSeconds.toString()
    );
    expect(inputElement.value).toBe("1");

    await fireEvent.click(minButton);

    expect(queryByTestId("seconds")?.textContent).toBe(minInSeconds.toString());
    expect(inputElement.value).toBe("30");

    await fireEvent.click(maxButton);

    expect(queryByTestId("seconds")?.textContent).toBe(maxInSeconds.toString());
    expect(inputElement.value).toBe("365.25");

    await fireEvent.click(minButton);

    expect(queryByTestId("seconds")?.textContent).toBe(minInSeconds.toString());
    expect(inputElement.value).toBe("30");
  });

  it("should update error message after Min/Max click", async () => {
    const initialSeconds = SECONDS_IN_DAY;
    const minInSeconds = SECONDS_IN_DAY * 30;
    const maxInSeconds = SECONDS_IN_YEAR;
    const getInputError = vi.fn(() => null);

    const { queryByTestId } = render(DayInputTest, {
      props: {
        seconds: initialSeconds,
        maxInSeconds,
        minInSeconds,
        getInputError,
      },
    });

    const minButton = queryByTestId("min-button");
    const maxButton = queryByTestId("max-button");

    expect(getInputError).toBeCalledTimes(0);

    await fireEvent.click(minButton);

    expect(getInputError).toBeCalledTimes(1);

    await fireEvent.click(maxButton);

    expect(getInputError).toBeCalledTimes(2);
  });

  it("should take into account the max when rounding up", async () => {
    // This is a fraction that if rounded up would be 366 days.
    const initialSeconds = SECONDS_IN_DAY * 365 + 10;
    // But the max is 365.5 days
    const maxInSeconds = SECONDS_IN_DAY * 365 + SECONDS_IN_DAY / 2;
    const minInSeconds = SECONDS_IN_DAY * 30;

    const { container } = render(DayInput, {
      props: {
        seconds: initialSeconds,
        maxInSeconds,
        minInSeconds,
        getInputError: () => null,
      },
    });

    const inputElement = container.querySelector("input");

    expect(inputElement.value).toBe("365.5");
  });
});
