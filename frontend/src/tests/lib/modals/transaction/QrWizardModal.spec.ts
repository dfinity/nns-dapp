/**
 * @jest-environment jsdom
 */

import QrWizardModal from "$lib/modals/transaction/QrWizardModal.svelte";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { fireEvent, render } from "@testing-library/svelte";

describe("QrWizardModal", () => {
  const getCurrentStep = (component) => {
    return component.$$.ctx[component.$$.props["currentStep"]];
  };

  const scanQrCode = (component) => {
    return component.$$.ctx[component.$$.props["scanQrCode"]]();
  };

  const goToNextStep = (component) => {
    return component.$$.ctx[component.$$.props["next"]]();
  };

  const goToPreviousStep = (component) => {
    return component.$$.ctx[component.$$.props["back"]]();
  };

  it("moves to QRCode step when scanQrCode is called", async () => {
    const steps = [
      {
        title: "Step 1",
        name: "step1",
      },
    ];

    const { component } = render(QrWizardModal, { steps });

    expect(getCurrentStep(component).name).toEqual("step1");

    scanQrCode(component);
    await runResolvedPromises();

    expect(getCurrentStep(component).name).toEqual("QRCode");
  });

  it("resolves scanQrCode() to undefined when canceled", async () => {
    const steps = [
      {
        title: "Step 1",
        name: "step1",
      },
    ];

    const { getByTestId, component } = render(QrWizardModal, { steps });

    const qrPromise = scanQrCode(component);
    const qrPromiseResolved = jest.fn();
    qrPromise.then(qrPromiseResolved);

    await runResolvedPromises();

    expect(getCurrentStep(component).name).toEqual("QRCode");

    const cancelButton = getByTestId("transaction-qrcode-button-cancel");
    expect(cancelButton).toBeInTheDocument();

    expect(qrPromiseResolved).not.toBeCalled();
    fireEvent.click(cancelButton);
    await runResolvedPromises();

    expect(qrPromiseResolved).toBeCalled();
    expect(await qrPromise).toBeUndefined();
  });

  it("can go to next step and back", async () => {
    const steps = [
      {
        title: "Step 1",
        name: "step1",
      },
      {
        title: "Step 2",
        name: "step2",
      },
    ];

    const { component } = render(QrWizardModal, { steps });

    expect(getCurrentStep(component).name).toEqual("step1");

    goToNextStep(component);
    await runResolvedPromises();
    expect(getCurrentStep(component).name).toEqual("step2");

    goToPreviousStep(component);
    await runResolvedPromises();
    expect(getCurrentStep(component).name).toEqual("step1");
  });

  it("scanQrCode returns to original step when canceled", async () => {
    const steps = [
      {
        title: "Step 1",
        name: "step1",
      },
      {
        title: "Step 2",
        name: "step2",
      },
      {
        title: "Step 3",
        name: "step3",
      },
    ];

    const { getByTestId, component } = render(QrWizardModal, { steps });

    expect(getCurrentStep(component).name).toEqual("step1");

    goToNextStep(component);
    await runResolvedPromises();
    expect(getCurrentStep(component).name).toEqual("step2");

    scanQrCode(component);
    await runResolvedPromises();

    expect(getCurrentStep(component).name).toEqual("QRCode");

    const cancelButton = getByTestId("transaction-qrcode-button-cancel");
    fireEvent.click(cancelButton);
    await runResolvedPromises();

    expect(getCurrentStep(component).name).toEqual("step2");
  });
});
