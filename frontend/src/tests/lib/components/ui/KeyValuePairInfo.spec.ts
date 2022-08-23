/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import KeyValuePairInfoTest from "./KeyValuePairInfoTest.svelte";

describe("KeyValuePairInfo", () => {
  const key = "test-key";
  const value = "test-value";
  it("should render key and value", () => {
    const { queryByText } = render(KeyValuePairInfoTest, {
      props: { key, value },
    });

    expect(queryByText(key)).toBeInTheDocument();
    expect(queryByText(value)).toBeInTheDocument();
  });

  it("should toggle to display more information", async () => {
    const { getByTestId } = render(KeyValuePairInfoTest, {
      props: { key, value },
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

    fireEvent.click(button);
    await waitFor(() =>
      expect(
        getByTestId("collapsible-content")?.classList.contains("expanded")
      ).toBeFalsy()
    );
  });
});
