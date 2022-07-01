/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import SNSLaunchpad from "../../routes/SNSLaunchpad.svelte";
import en from "../mocks/i18n.mock";

describe("SNSLaunchpad", () => {
  it("should render titles", () => {
    const { getByText } = render(SNSLaunchpad);

    expect(getByText(en.sns_launchpad.projects)).toBeInTheDocument();
    expect(getByText(en.sns_launchpad.proposals)).toBeInTheDocument();
  });
});
