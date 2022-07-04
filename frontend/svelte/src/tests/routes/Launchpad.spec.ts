/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Launchpad from "../../routes/Launchpad.svelte";
import en from "../mocks/i18n.mock";

describe("Launchpad", () => {
  it("should render titles", () => {
    const { getByText } = render(Launchpad);

    expect(getByText(en.sns_launchpad.projects)).toBeInTheDocument();
    expect(getByText(en.sns_launchpad.proposals)).toBeInTheDocument();
  });
});
