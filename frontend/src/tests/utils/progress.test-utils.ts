import type { RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

export const testProgress = ({
  result: { container },
  position,
  label,
  status,
}: {
  result: RenderResult<SvelteComponent>;
  position: number;
  label: string;
  status: "In progress" | "Completed";
}) => {
  const element = container.querySelectorAll(".step")[position - 1];

  if (status === "In progress") {
    expect(element?.textContent ?? "").toContain(`${position}`);
  } else if (status === "Completed") {
    // Circle checkmark
    expect(element.querySelector("svg")).not.toBeNull();
  }

  expect(element?.textContent ?? "").toContain(label);
  expect(element?.textContent ?? "").toContain(status);
};
