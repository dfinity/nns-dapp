/**
 * @jest-environment jsdom
 */

import { fireEvent, render, waitFor } from "@testing-library/svelte";
import InfoContextKeyTest from "./InfoContextKeyTest.svelte";

describe("InfoContextKey", () => {
  const header = "header-content";
  const content = "test-content";
  it("should render header, info icon", () => {
    const { queryByText, queryByTestId } = render(InfoContextKeyTest, {
      props: { content, header },
    });

    expect(queryByText(header)).toBeInTheDocument();
    expect(queryByTestId("icon-info")).toBeInTheDocument();
  });

  it("should be initially collapsed", () => {
    const { queryByText } = render(InfoContextKeyTest, {
      props: { content, header },
    });
    expect(queryByText(content)).not.toBeVisible();
  });

  it("should show extra content on click", async () => {
    const { container, getByTestId, queryByText } = render(InfoContextKeyTest, {
      props: { content, header },
    });
    expect(queryByText(content)).not.toBeVisible();

    await fireEvent.click(getByTestId("collapsible-header"));
    waitFor(() =>
      expect(
        container.querySelector('[aria-expanded="true"]')
      ).toBeInTheDocument()
    );

    expect(queryByText(content)).toBeVisible();
  });
});
