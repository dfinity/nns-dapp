/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Header from "../../../../lib/components/common/Header.svelte";
import en from "../../../mocks/i18n.mock";

describe("Header", () => {
  it("should render a logout button", () => {
    const { getByTestId } = render(Header);
    const button = getByTestId("logout");
    expect(button).not.toBeNull();
    expect(button).toBeVisible();
    expect(button).toHaveTextContent(en.header.logout);
  });
});
