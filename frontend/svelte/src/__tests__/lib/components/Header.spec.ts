/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Header from "../../../lib/components/Header.svelte";

describe("Header", () => {
  it("should render a title", () => {
    const { getByText } = render(Header);

    expect(getByText("NETWORK NERVOUS SYSTEM")).toBeInTheDocument();
  });

  it("should render a logout button", () => {
    const { getByRole } = render(Header);
    const button = getByRole('button');
    expect(button).not.toBeUndefined();
    expect(button).toBeVisible();
    expect(button).toHaveTextContent('Logout');
  });
});
