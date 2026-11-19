import WizardModal from "$lib/gix/components/WizardModal.svelte";
import type { WizardStep, WizardSteps } from "$lib/gix/types/wizard";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { tick, type Snippet } from "svelte";
import { mockSnippet } from "../mocks/snippet.mocks";
import WizardModalTest from "./WizardModalTest.svelte";

describe("WizardModal", () => {
  const steps: WizardSteps = [
    {
      title: "Step 1",
      name: "step1",
    },
  ];

  const props: {
    steps: WizardSteps;
    currentStep: WizardStep | undefined;
    children: Snippet;
  } = {
    steps,
    currentStep: undefined,
    children: mockSnippet,
  };

  it("should not have a data-tid attribute", () => {
    const { container } = render(WizardModal, {
      props: {
        ...props,
      },
    });

    const modal = container.querySelector("div.modal");

    expect(modal?.getAttribute("data-tid")).toBeNull();
  });

  it("should have a single root with data-tid attribute", () => {
    const testId = "my-test-id";
    const { baseElement } = render(WizardModal, {
      props: {
        ...props,
        testId,
      },
    });

    // Make sure the data-tid encloses everything in the component.
    expect(baseElement.firstElementChild?.children.length).toBe(1);

    const modal = baseElement.firstElementChild?.firstElementChild;

    expect(modal?.className).toContain("modal");
    expect(modal?.getAttribute("data-tid")).toBe(testId);
  });

  it("should contains a container for the animation", () => {
    const { container } = render(WizardModal, {
      props: {
        ...props,
      },
    });

    const div = container.querySelector("div.transition");

    expect(div).not.toBeNull();
  });

  it("should trigger the next step when modal.next is called", async () => {
    const { getByTestId } = render(WizardModalTest);

    const nextButton = getByTestId("next-button");

    expect(nextButton).toBeInTheDocument();

    await fireEvent.click(nextButton);

    await waitFor(() => {
      const backButton = getByTestId("back-button");

      expect(nextButton).not.toBeInTheDocument();
      expect(backButton).toBeInTheDocument();
    });
  });

  it("should trigger the back step when modal.back is called", async () => {
    const { getByTestId } = render(WizardModalTest);

    const nextButton = getByTestId("next-button");

    await fireEvent.click(nextButton);

    await waitFor(() => {
      const backButton = getByTestId("back-button");

      expect(nextButton).not.toBeInTheDocument();
      expect(backButton).toBeInTheDocument();
    });

    const backButton = getByTestId("back-button");

    await fireEvent.click(backButton);

    await waitFor(() => {
      const nextButton = getByTestId("next-button");

      expect(nextButton).toBeInTheDocument();
      expect(backButton).not.toBeInTheDocument();
    });
  });

  it("should render a new step transition when the step changes", async () => {
    const { container, getByTestId } = render(WizardModalTest);

    const initialTransition = container.querySelector("div.transition");

    expect(initialTransition).not.toBeNull();

    await fireEvent.click(getByTestId("next-button"));

    await waitFor(() => expect(getByTestId("back-button")).toBeInTheDocument());

    const nextTransition = container.querySelector("div.transition");

    expect(nextTransition).not.toBeNull();
    expect(nextTransition).not.toBe(initialTransition);

    await fireEvent.click(getByTestId("back-button"));

    await waitFor(() => expect(getByTestId("next-button")).toBeInTheDocument());

    const backTransition = container.querySelector("div.transition");

    expect(backTransition).not.toBeNull();
    expect(backTransition).not.toBe(nextTransition);
  });

  it("should not render a new step transition when the step does not change", async () => {
    const { container, component } = render(WizardModal, {
      props,
    });

    const initialTransition = container.querySelector("div.transition");

    expect(initialTransition).not.toBeNull();

    component.back();
    await tick();

    expect(container.querySelector("div.transition")).toBe(initialTransition);

    component.next();
    await tick();

    expect(container.querySelector("div.transition")).toBe(initialTransition);

    component.set(0);
    await tick();

    expect(container.querySelector("div.transition")).toBe(initialTransition);
  });

  it("should set a custom step when modal.set is called", async () => {
    const { getByTestId } = render(WizardModalTest);

    const stepButton = getByTestId("hidden-step-button");

    await fireEvent.click(stepButton);

    await waitFor(() => {
      expect(stepButton).not.toBeInTheDocument();
      expect(getByTestId("hidden-step")).toBeInTheDocument();
    });
  });
});
