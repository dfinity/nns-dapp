/**
 * @jest-environment jsdom
 */

import App from "$routes/(login)/+page.svelte";
import { render } from "@testing-library/svelte";

describe("Layout", () => {
  it("should render accounts landing page", async () => {
    const { queryByTestId } = render(App);

    expect(queryByTestId("accounts-landing-page")).toBeInTheDocument();
  });
});
