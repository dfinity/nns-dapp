/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import SNSLaunchpadContent from "../../../../lib/components/sns-launchpad/SNSLaunchpadContent.svelte";
import en from "../../../mocks/i18n.mock";

jest.mock("../../../../lib/services/sns.services", () => {
  return {
    loadSnsFullProjects: jest.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("SNSLaunchpadContent", () => {
  it("should render a spinner", () => {
    const { queryByText } = render(SNSLaunchpadContent);

    expect(queryByText(en.sns_launchpad.projects)).toBeInTheDocument();
    expect(queryByText(en.sns_launchpad.proposals)).toBeInTheDocument();
  });
});
