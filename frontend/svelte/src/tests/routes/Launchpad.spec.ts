/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import LaunchPad from "../../routes/Launchpad.svelte";
import en from "../mocks/i18n.mock";

describe("Launchpad", () => {
  it("should render titles", () => {
    const { getByText } = render(LaunchPad);

    expect(getByText(en.sns_launchpad.projects)).toBeInTheDocument();
    expect(getByText(en.sns_launchpad.proposals)).toBeInTheDocument();
  });
});
