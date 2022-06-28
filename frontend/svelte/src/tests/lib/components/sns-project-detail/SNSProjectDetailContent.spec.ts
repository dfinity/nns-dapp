/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import SNSProjectDetailContent from "../../../../lib/components/sns-project-detail/SNSProjectDetailContent.svelte";

describe("SNSProjectDetailContent", () => {
  it("should render info section", () => {
    const { queryByTestId } = render(SNSProjectDetailContent);

    expect(queryByTestId("sns-project-detail-info")).toBeInTheDocument();
  });

  it("should render status section", () => {
    const { queryByTestId } = render(SNSProjectDetailContent);

    expect(queryByTestId("sns-project-detail-status")).toBeInTheDocument();
  });
});
