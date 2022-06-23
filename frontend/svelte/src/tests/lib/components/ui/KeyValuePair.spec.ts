/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import KeyValuePairTest from "./KeyValuePairTest.svelte";

describe("KeyValuePair", () => {
  const key = "test-key";
  const value = "test-value";
  it("should render key and value", () => {
    const { queryByText } = render(KeyValuePairTest, {
      props: { key, value },
    });

    expect(queryByText(key)).toBeInTheDocument();
    expect(queryByText(value)).toBeInTheDocument();
  });

  it("should render info icon", () => {
    const { queryByTestId } = render(KeyValuePairTest, {
      props: { key, value, info: true },
    });

    expect(queryByTestId("icon-info")).toBeInTheDocument();
  });

  it("should not show info text", () => {
    const infoText = "test info";
    const { queryByText } = render(KeyValuePairTest, {
      props: { key, value, info: true, infoText: "test info" },
    });

    expect(queryByText(infoText, { exact: false })).not.toBeVisible();
  });
});
