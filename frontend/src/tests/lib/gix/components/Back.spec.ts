import Back from "$lib/gix/components/Back.svelte";
import { render } from "$tests/lib/gix/test-utils/render.test-utils";
import { fireEvent } from "@testing-library/svelte";

describe("Back", () => {
  it("should forward the click event", () =>
    new Promise<void>((done) => {
      const { getByTestId } = render(Back, {
        props: {
          onBack: done,
        },
      });

      const button = getByTestId("back") as HTMLButtonElement;

      expect(button).not.toBeNull();

      fireEvent.click(button);
    }));
});
