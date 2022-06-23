/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import SNSProjectDetail from "../../routes/SNSProjectDetail.svelte";

describe("SNSProjectDetail", () => {
  it("should render section", () => {
    const { queryByTestId } = render(SNSProjectDetail);

    expect(queryByTestId("sns-project-detail")).toBeInTheDocument();
  });
});
