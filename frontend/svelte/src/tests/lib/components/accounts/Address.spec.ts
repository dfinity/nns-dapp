/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Address from "../../../../lib/components/accounts/Address.svelte";
import en from "../../../mocks/i18n.mock";

describe("Address", () => {
  it("should render a form to enter an address", () => {
    const { container } = render(Address, { props: { address: undefined } });

    expect(container.querySelector("input")).not.toBeNull();
    expect(container.querySelector("form")).not.toBeNull();

    const button = container.querySelector('button[type="submit"]');
    expect(button).not.toBeNull();
    expect(button?.innerHTML).toEqual(en.core.continue);
  });
});
