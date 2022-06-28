/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import SNSLaunchpad from "../../routes/SNSLaunchpad.svelte";
import en from "../mocks/i18n.mock";

describe("SNSLaunchpad", () => {
  it("should render header", () => {
    const { queryByText } = render(SNSLaunchpad);

    expect(queryByText(en.sns_launchpad.header)).toBeInTheDocument();
  });

  it("should render a spinner", () => {
    const { getByTestId } = render(SNSLaunchpad);

    expect(getByTestId("spinner")).toBeInTheDocument();
  });
});
