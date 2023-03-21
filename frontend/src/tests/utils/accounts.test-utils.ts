import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

export const testAccountsModal = async ({
  result,
  testId,
}: {
  result: RenderResult<SvelteComponent>;
  testId: string;
}) => {
  const { container, getByTestId } = result;

  await waitFor(expect(getByTestId(testId)).not.toBeNull);

  const button = getByTestId(testId) as HTMLButtonElement;

  await fireEvent.click(button);

  await waitFor(() =>
    expect(container.querySelector("div.modal")).not.toBeNull()
  );
};
