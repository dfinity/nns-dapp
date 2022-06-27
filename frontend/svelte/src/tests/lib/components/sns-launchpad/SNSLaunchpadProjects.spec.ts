/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import SNSLaunchpadProjects from "../../../../lib/components/sns-launchpad/SNSLaunchpadProjects.svelte";
import { loadSnsFullProjects } from "../../../../lib/services/sns.services";
import en from "../../../mocks/i18n.mock";

jest.mock("../../../../lib/services/sns.services", () => {
  return {
    loadSnsFullProjects: jest.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("SNSLaunchpadProjects", () => {
  it("should trigger loadSnsFullProjects", async () => {
    render(SNSLaunchpadProjects);
    expect(loadSnsFullProjects).toBeCalled();
  });

  it("should render project lists", async () => {
    const { queryByText } = render(SNSLaunchpadProjects);

    expect(
      queryByText(en.sns_launchpad.opportunity_projects)
    ).toBeInTheDocument();
    expect(queryByText(en.sns_launchpad.upcoming_projects)).toBeInTheDocument();
  });
});
