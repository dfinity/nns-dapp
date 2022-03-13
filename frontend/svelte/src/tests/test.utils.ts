import { fireEvent, screen } from "@testing-library/dom";
import { waitFor } from "@testing-library/svelte";

export const awaitAndClickByTestId = async (testId: string): Promise<void> => {
  await waitFor(() => screen.queryByTestId(testId));
  fireEvent.click(screen.queryByTestId(testId) as Element);
};
