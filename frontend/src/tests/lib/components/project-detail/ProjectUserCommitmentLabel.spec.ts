/**
 * @jest-environment jsdom
 */

import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import ProjectUserCommitmentLabel from "../../../../lib/components/project-detail/ProjectUserCommitmentLabel.svelte";
import en from "../../../mocks/i18n.mock";
import {
  mockSwapCommitment,
  summaryForLifecycle,
} from "../../../mocks/sns-projects.mock";

describe("ProjectUserCommitmentLabel", () => {
  it("should render current commitment label", () => {
    const summary = summaryForLifecycle(SnsSwapLifecycle.Open);

    const { queryByText } = render(ProjectUserCommitmentLabel, {
      props: {
        summary,
        swapCommitment: mockSwapCommitment,
      },
    });

    expect(
      queryByText(en.sns_project_detail.user_current_commitment)
    ).toBeInTheDocument();
  });

  it("should render commitment label (not current)", () => {
    const summary = summaryForLifecycle(SnsSwapLifecycle.Committed);

    const { queryByText } = render(ProjectUserCommitmentLabel, {
      props: {
        summary,
        swapCommitment: mockSwapCommitment,
      },
    });

    expect(
      queryByText(en.sns_project_detail.user_commitment)
    ).toBeInTheDocument();
  });
});
