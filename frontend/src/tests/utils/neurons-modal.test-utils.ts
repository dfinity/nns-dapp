import { fireEvent, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

export const selectPercentage = async (
  renderResult: RenderResult<SvelteComponent>
) => {
  const { queryByTestId } = renderResult;
  const rangeElement = queryByTestId("input-range");
  expect(rangeElement).toBeInTheDocument();
  rangeElement &&
    (await fireEvent.input(rangeElement, { target: { value: 50 } }));

  const selectMaturityButton = queryByTestId(
    "select-maturity-percentage-button"
  );
  expect(selectMaturityButton).toBeInTheDocument();
  selectMaturityButton && (await fireEvent.click(selectMaturityButton));
};
