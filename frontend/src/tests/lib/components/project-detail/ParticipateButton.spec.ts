/**
 * @jest-environment jsdom
 */

import { type SnsSwapBuyerState, SnsSwapLifecycle } from "@dfinity/sns";
import { waitFor } from "@testing-library/svelte";
import ParticipateButton from "../../../../lib/components/project-detail/ParticipateButton.svelte";
import type { SnsSwapCommitment } from "../../../../lib/types/sns";
import {
  mockSnsFullProject,
  mockSwapInit,
  summaryForLifecycle,
} from "../../../mocks/sns-projects.mock";
import { renderContextCmp } from "../../../mocks/sns.mock";
import { clickByTestId } from "../../testHelpers/clickByTestId";

describe("ParticipateButton", () => {
  it("should render project participate button", () => {
    const { queryByTestId } = renderContextCmp({
      summary: mockSnsFullProject.summary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ParticipateButton,
    });
    expect(queryByTestId("sns-project-participate-button")).toBeInTheDocument();
  });

  it("should open swap participation modal on participate click", async () => {
    const { getByTestId } = renderContextCmp({
      summary: mockSnsFullProject.summary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ParticipateButton,
    });

    await clickByTestId(getByTestId, "sns-project-participate-button");
    await waitFor(() =>
      expect(getByTestId("sns-swap-participate-step-1")).toBeInTheDocument()
    );
  });

  it("should hide button is state is not open", () => {
    const { queryByTestId } = renderContextCmp({
      summary: summaryForLifecycle(SnsSwapLifecycle.Pending),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ParticipateButton,
    });
    expect(
      queryByTestId("sns-project-participate-button")
    ).not.toBeInTheDocument();
  });

  it("should enable button is user has not committed max already", () => {
    const { queryByTestId } = renderContextCmp({
      summary: summaryForLifecycle(SnsSwapLifecycle.Open),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ParticipateButton,
    });

    const button = queryByTestId(
      "sns-project-participate-button"
    ) as HTMLButtonElement;
    expect(button.getAttribute("disabled")).toBeNull();
  });

  it("should disable button is user has committed max already", () => {
    const mock = mockSnsFullProject.swapCommitment as SnsSwapCommitment;

    const { queryByTestId } = renderContextCmp({
      summary: summaryForLifecycle(SnsSwapLifecycle.Open),
      swapCommitment: {
        rootCanisterId: mock.rootCanisterId,
        myCommitment: {
          ...(mock.myCommitment as SnsSwapBuyerState),
          amount_icp_e8s: mockSwapInit.max_participant_icp_e8s,
        },
      },
      Component: ParticipateButton,
    });

    const button = queryByTestId(
      "sns-project-participate-button"
    ) as HTMLButtonElement;
    expect(button.getAttribute("disabled")).not.toBeNull();
  });
});
