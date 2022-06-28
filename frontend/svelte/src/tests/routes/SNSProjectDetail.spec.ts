/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import SNSProjectDetail from "../../routes/SNSProjectDetail.svelte";

describe("SNSProjectDetail", () => {
  it("should render a header", () => {
    const { queryByText } = render(SNSProjectDetail);

    expect(queryByText("Project Tetris")).toBeInTheDocument();
  });

  it("should render a spinner", () => {
    const { getByTestId } = render(SNSProjectDetail);

    expect(getByTestId("spinner")).toBeInTheDocument();
  });
});
