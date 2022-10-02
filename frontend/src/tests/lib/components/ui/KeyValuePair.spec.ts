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
});
