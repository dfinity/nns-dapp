/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import SnsAccounts from "../../../lib/pages/SnsAccounts.svelte";

describe("SnsAccounts", () => {
  it("should render accounts title", () => {
    const { getByTestId } = render(SnsAccounts);

    expect(getByTestId("accounts-title")).toBeInTheDocument();
  });

  it("should contain a tooltip", () => {
    const { container } = render(SnsAccounts);

    expect(container.querySelector(".tooltip-wrapper")).toBeInTheDocument();
  });
});
