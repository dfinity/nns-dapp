/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Header from "../../../lib/components/Header.svelte";

test("Welcome the user", () => {
  const { getByText } = render(Header);

  expect(getByText("NETWORK NERVOUS SYSTEM")).toBeInTheDocument();
});
