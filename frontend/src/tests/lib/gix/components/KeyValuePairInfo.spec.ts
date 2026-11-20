import KeyValuePairInfoTest from "$tests/lib/gix/components/KeyValuePairInfoTest.svelte";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";

describe("KeyValuePairInfo", () => {
  const key = "test-key";
  const value = "test-value";
  const info = "test-info";

  it("should render key and value", () => {
    const { queryByText } = render(KeyValuePairInfoTest, {
      props: { key, value, info },
    });

    expect(queryByText(key)).toBeInTheDocument();
    expect(queryByText(value)).toBeInTheDocument();
  });

  it("should more info button", () => {
    const { queryByTestId, getByTestId } = render(KeyValuePairInfoTest, {
      props: { key, value, info },
    });

    const button = getByTestId("key-value-pair-info-test")?.querySelector(
      "div.wrapper > button"
    );

    expect(button).not.toBeNull();

    expect(queryByTestId("icon-info")).toBeInTheDocument();
  });

  it("should be initially collapsed", () => {
    const { getByTestId } = render(KeyValuePairInfoTest, {
      props: { key, value, info },
    });

    const content = getByTestId("collapsible-content");

    expect(content?.classList.contains("expanded")).toBeFalsy();
    expect(content?.style.maxHeight).toEqual("0px");
  });

  it("should toggle to display more information", async () => {
    const { getByTestId, queryByText } = render(KeyValuePairInfoTest, {
      props: { key, value, info },
    });

    const button = getByTestId("key-value-pair-info-test")?.querySelector(
      "div.wrapper > button"
    ) as HTMLButtonElement;

    fireEvent.click(button);

    await waitFor(() =>
      expect(
        getByTestId("collapsible-content")?.classList.contains("expanded")
      ).toBeTruthy()
    );

    await waitFor(() => expect(queryByText(info)).toBeVisible());

    fireEvent.click(button);
    await waitFor(() =>
      expect(
        getByTestId("collapsible-content")?.classList.contains("expanded")
      ).toBeFalsy()
    );
  });
});
