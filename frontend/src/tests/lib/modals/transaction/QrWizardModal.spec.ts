// This import needs to be at the top for the mock to work:
import MockQRCodeReaderModal from "./MockQRCodeReaderModal.svelte";

import QrWizardModal from "$lib/modals/transaction/QrWizardModal.svelte";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { mockedConstants } from "$tests/utils/mockable-constants.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { ICPToken } from "@dfinity/utils";
import { fireEvent, render } from "@testing-library/svelte";

vi.mock("@dfinity/gix-components", async () => ({
  ...(await vi.importActual("@dfinity/gix-components")),
  QRCodeReaderModal: MockQRCodeReaderModal,
}));

describe("QrWizardModal", () => {
  beforeEach(() => {
    mockedConstants.ENABLE_QR_CODE_READER = true;
  });

  const getCurrentStep = (component) => {
    return component.$$.ctx[component.$$.props["currentStep"]];
  };

  const scanQrCode = ({ component, requiredToken }) => {
    return component.$$.ctx[component.$$.props["scanQrCode"]]({
      requiredToken,
    });
  };

  const goToNextStep = (component) => {
    return component.$$.ctx[component.$$.props["modal"]].next();
  };

  const goToPreviousStep = (component) => {
    return component.$$.ctx[component.$$.props["modal"]].back();
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

    scanQrCode({
      component,
      requiredToken: ICPToken,
    });
    await runResolvedPromises();

    expect(getCurrentStep(component).name).toEqual("QRCode");
  });

  it("scanQrCode() returns identifier", async () => {
    const identifier =
      "97731a95e48d63106ede6e6a7c4937475f0a2a1ef0f42f46956a3e06f8e32ba7";

    const steps = [
      {
        title: "Step 1",
        name: "step1",
      },
    ];

    const { getByTestId, component } = render(QrWizardModal, { steps });

    const qrPromise = scanQrCode({
      component,
      requiredToken: ICPToken,
    });
    const qrPromiseResolved = vi.fn();
    qrPromise.then(qrPromiseResolved);

    await runResolvedPromises();

    expect(getCurrentStep(component).name).toEqual("QRCode");

    expect(qrPromiseResolved).not.toBeCalled();

    fireEvent.input(getByTestId("mock-qr-input"), {
      target: { value: identifier },
    });
    fireEvent.click(getByTestId("mock-qr-dispatch"));

    await runResolvedPromises();

    expect(qrPromiseResolved).toBeCalled();
    expect(await qrPromise).toEqual({ result: "success", identifier });

    expect(getCurrentStep(component).name).toEqual("step1");
  });

  it("scanQrCode() accepts token prefix for ICP", async () => {
    const identifier =
      "97731a95e48d63106ede6e6a7c4937475f0a2a1ef0f42f46956a3e06f8e32ba7";
    const paymentUri = `icp:${identifier}`;

    const steps = [
      {
        title: "Step 1",
        name: "step1",
      },
    ];

    const { getByTestId, component } = render(QrWizardModal, { steps });

    const qrPromise = scanQrCode({
      component,
      requiredToken: ICPToken,
    });
    const qrPromiseResolved = vi.fn();
    qrPromise.then(qrPromiseResolved);

    await runResolvedPromises();

    expect(getCurrentStep(component).name).toEqual("QRCode");

    expect(qrPromiseResolved).not.toBeCalled();

    fireEvent.input(getByTestId("mock-qr-input"), {
      target: { value: paymentUri },
    });
    fireEvent.click(getByTestId("mock-qr-dispatch"));

    await runResolvedPromises();

    expect(qrPromiseResolved).toBeCalled();
    expect(await qrPromise).toEqual({
      result: "success",
      identifier,
      token: "icp",
    });

    expect(getCurrentStep(component).name).toEqual("step1");
  });

  it("scanQrCode() accepts token prefix for non-ICP token", async () => {
    const identifier =
      "97731a95e48d63106ede6e6a7c4937475f0a2a1ef0f42f46956a3e06f8e32ba7";
    const tokenSymbol = "abc";
    const paymentUri = `${tokenSymbol}:${identifier}`;

    const steps = [
      {
        title: "Step 1",
        name: "step1",
      },
    ];

    const { getByTestId, component } = render(QrWizardModal, { steps });

    const qrPromise = scanQrCode({
      component,
      requiredToken: {
        ...mockSnsToken,
        symbol: tokenSymbol,
      },
    });
    const qrPromiseResolved = vi.fn();
    qrPromise.then(qrPromiseResolved);

    await runResolvedPromises();

    expect(getCurrentStep(component).name).toEqual("QRCode");

    expect(qrPromiseResolved).not.toBeCalled();

    fireEvent.input(getByTestId("mock-qr-input"), {
      target: { value: paymentUri },
    });
    fireEvent.click(getByTestId("mock-qr-dispatch"));

    await runResolvedPromises();

    expect(qrPromiseResolved).toBeCalled();
    expect(await qrPromise).toEqual({
      result: "success",
      identifier,
      token: tokenSymbol,
    });

    expect(getCurrentStep(component).name).toEqual("step1");
  });

  it("scanQrCode() rejects different token prefix", async () => {
    const identifier =
      "97731a95e48d63106ede6e6a7c4937475f0a2a1ef0f42f46956a3e06f8e32ba7";
    const paymentUri = `abc:${identifier}`;

    const steps = [
      {
        title: "Step 1",
        name: "step1",
      },
    ];

    const { getByTestId, component } = render(QrWizardModal, { steps });

    const qrPromise = scanQrCode({
      component,
      requiredToken: ICPToken,
    });
    const qrPromiseResolved = vi.fn();
    qrPromise.then(qrPromiseResolved);

    await runResolvedPromises();

    expect(getCurrentStep(component).name).toEqual("QRCode");

    expect(qrPromiseResolved).not.toBeCalled();

    fireEvent.input(getByTestId("mock-qr-input"), {
      target: { value: paymentUri },
    });
    fireEvent.click(getByTestId("mock-qr-dispatch"));

    await runResolvedPromises();

    expect(qrPromiseResolved).toBeCalled();
    expect(await qrPromise).toEqual({ result: "token_incompatible" });

    expect(getCurrentStep(component).name).toEqual("step1");
  });

  it("scanQrCode() accepts 'dfinity' token prefix for ICP", async () => {
    const identifier =
      "97731a95e48d63106ede6e6a7c4937475f0a2a1ef0f42f46956a3e06f8e32ba7";
    const paymentUri = `dfinity:${identifier}`;

    const steps = [
      {
        title: "Step 1",
        name: "step1",
      },
    ];

    const { getByTestId, component } = render(QrWizardModal, { steps });

    const qrPromise = scanQrCode({
      component,
      requiredToken: ICPToken,
    });
    const qrPromiseResolved = vi.fn();
    qrPromise.then(qrPromiseResolved);

    await runResolvedPromises();

    expect(getCurrentStep(component).name).toEqual("QRCode");

    expect(qrPromiseResolved).not.toBeCalled();

    fireEvent.input(getByTestId("mock-qr-input"), {
      target: { value: paymentUri },
    });
    fireEvent.click(getByTestId("mock-qr-dispatch"));

    await runResolvedPromises();

    expect(qrPromiseResolved).toBeCalled();
    expect(await qrPromise).toEqual({
      result: "success",
      identifier,
      token: "dfinity",
    });

    expect(getCurrentStep(component).name).toEqual("step1");
  });

  it("scanQrCode() accepts 'dfinity' prefix for DFINITY token", async () => {
    const identifier =
      "97731a95e48d63106ede6e6a7c4937475f0a2a1ef0f42f46956a3e06f8e32ba7";
    const tokenSymbol = "dfinity";
    const paymentUri = `${tokenSymbol}:${identifier}`;

    const steps = [
      {
        title: "Step 1",
        name: "step1",
      },
    ];

    const { getByTestId, component } = render(QrWizardModal, { steps });

    const qrPromise = scanQrCode({
      component,
      requiredToken: {
        ...mockSnsToken,
        symbol: tokenSymbol,
      },
    });
    const qrPromiseResolved = vi.fn();
    qrPromise.then(qrPromiseResolved);

    await runResolvedPromises();

    expect(getCurrentStep(component).name).toEqual("QRCode");

    expect(qrPromiseResolved).not.toBeCalled();

    fireEvent.input(getByTestId("mock-qr-input"), {
      target: { value: paymentUri },
    });
    fireEvent.click(getByTestId("mock-qr-dispatch"));

    await runResolvedPromises();

    expect(qrPromiseResolved).toBeCalled();
    expect(await qrPromise).toEqual({
      result: "success",
      identifier,
      token: tokenSymbol,
    });

    expect(getCurrentStep(component).name).toEqual("step1");
  });

  it("resolves scanQrCode() to 'canceled' when canceled", async () => {
    const steps = [
      {
        title: "Step 1",
        name: "step1",
      },
    ];

    const { getByTestId, component } = render(QrWizardModal, { steps });

    const qrPromise = scanQrCode({
      component,
      requiredToken: ICPToken,
    });
    const qrPromiseResolved = vi.fn();
    qrPromise.then(qrPromiseResolved);

    await runResolvedPromises();

    expect(getCurrentStep(component).name).toEqual("QRCode");

    const cancelButton = getByTestId("transaction-qrcode-button-cancel");
    expect(cancelButton).toBeInTheDocument();

    expect(qrPromiseResolved).not.toBeCalled();
    fireEvent.click(cancelButton);
    await runResolvedPromises();

    expect(qrPromiseResolved).toBeCalled();
    expect(await qrPromise).toEqual({ result: "canceled" });
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

    scanQrCode({
      component,
      requiredToken: ICPToken,
    });
    await runResolvedPromises();

    expect(getCurrentStep(component).name).toEqual("QRCode");

    const cancelButton = getByTestId("transaction-qrcode-button-cancel");
    fireEvent.click(cancelButton);
    await runResolvedPromises();

    expect(getCurrentStep(component).name).toEqual("step2");
  });
});
