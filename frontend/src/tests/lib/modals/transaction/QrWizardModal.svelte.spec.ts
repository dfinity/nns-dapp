// This import needs to be at the top for the mock to work:
import MockQRCodeReaderModal from "$tests/lib/modals/transaction/MockQRCodeReaderModal.svelte";

import QrWizardModal from "$lib/modals/transaction/QrWizardModal.svelte";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { mockedConstants } from "$tests/utils/mockable-constants.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { WizardSteps } from "@dfinity/gix-components";
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

  const getCurrentStep = (props) => {
    return props.currentStep;
  };

  const scanQrCode = ({ props, requiredToken }) => {
    return props.scanQrCode({
      requiredToken,
    });
  };

  const goToNextStep = (props) => {
    return props.modal.next();
  };

  const goToPreviousStep = (props) => {
    return props.modal.back();
  };

  const props = {
    modal: undefined,
    currentStep: undefined,
    scanQrCode: undefined,
  };

  it("moves to QRCode step when scanQrCode is called", async () => {
    const steps: WizardSteps = [
      {
        title: "Step 1",
        name: "step1",
      },
    ];

    const testProps = $state({
      steps,
      ...props,
    });

    render(QrWizardModal, { props: testProps });

    expect(getCurrentStep(testProps).name).toEqual("step1");

    scanQrCode({
      props: testProps,
      requiredToken: ICPToken,
    });
    await runResolvedPromises();

    expect(getCurrentStep(testProps).name).toEqual("QRCode");
  });

  it("scanQrCode() returns identifier", async () => {
    const identifier =
      "97731a95e48d63106ede6e6a7c4937475f0a2a1ef0f42f46956a3e06f8e32ba7";

    const steps: WizardSteps = [
      {
        title: "Step 1",
        name: "step1",
      },
    ];

    const testProps = $state({
      steps,
      ...props,
    });

    const { getByTestId } = render(QrWizardModal, { props: testProps });

    const qrPromise = scanQrCode({
      props: testProps,
      requiredToken: ICPToken,
    });
    const qrPromiseResolved = vi.fn();
    qrPromise.then(qrPromiseResolved);

    await runResolvedPromises();

    expect(getCurrentStep(testProps).name).toEqual("QRCode");

    expect(qrPromiseResolved).not.toBeCalled();

    fireEvent.input(getByTestId("mock-qr-input"), {
      target: { value: identifier },
    });
    fireEvent.click(getByTestId("mock-qr-dispatch"));

    await runResolvedPromises();

    expect(qrPromiseResolved).toBeCalled();
    expect(await qrPromise).toEqual({ result: "success", identifier });

    expect(getCurrentStep(testProps).name).toEqual("step1");
  });

  it("scanQrCode() accepts token prefix for ICP", async () => {
    const identifier =
      "97731a95e48d63106ede6e6a7c4937475f0a2a1ef0f42f46956a3e06f8e32ba7";
    const paymentUri = `icp:${identifier}`;

    const steps: WizardSteps = [
      {
        title: "Step 1",
        name: "step1",
      },
    ];

    const testProps = $state({
      steps,
      ...props,
    });

    const { getByTestId } = render(QrWizardModal, { props: testProps });

    const qrPromise = scanQrCode({
      props: testProps,
      requiredToken: ICPToken,
    });
    const qrPromiseResolved = vi.fn();
    qrPromise.then(qrPromiseResolved);

    await runResolvedPromises();

    expect(getCurrentStep(testProps).name).toEqual("QRCode");

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

    expect(getCurrentStep(testProps).name).toEqual("step1");
  });

  it("scanQrCode() accepts token prefix for non-ICP token", async () => {
    const identifier =
      "97731a95e48d63106ede6e6a7c4937475f0a2a1ef0f42f46956a3e06f8e32ba7";
    const tokenSymbol = "abc";
    const paymentUri = `${tokenSymbol}:${identifier}`;

    const steps: WizardSteps = [
      {
        title: "Step 1",
        name: "step1",
      },
    ];

    const testProps = $state({
      steps,
      ...props,
    });

    const { getByTestId } = render(QrWizardModal, { props: testProps });

    const qrPromise = scanQrCode({
      props: testProps,
      requiredToken: {
        ...mockSnsToken,
        symbol: tokenSymbol,
      },
    });
    const qrPromiseResolved = vi.fn();
    qrPromise.then(qrPromiseResolved);

    await runResolvedPromises();

    expect(getCurrentStep(testProps).name).toEqual("QRCode");

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

    expect(getCurrentStep(testProps).name).toEqual("step1");
  });

  it("scanQrCode() rejects different token prefix", async () => {
    const identifier =
      "97731a95e48d63106ede6e6a7c4937475f0a2a1ef0f42f46956a3e06f8e32ba7";
    const paymentUri = `abc:${identifier}`;

    const steps: WizardSteps = [
      {
        title: "Step 1",
        name: "step1",
      },
    ];

    const testProps = $state({
      steps,
      ...props,
    });

    const { getByTestId } = render(QrWizardModal, { props: testProps });

    const qrPromise = scanQrCode({
      props: testProps,
      requiredToken: ICPToken,
    });
    const qrPromiseResolved = vi.fn();
    qrPromise.then(qrPromiseResolved);

    await runResolvedPromises();

    expect(getCurrentStep(testProps).name).toEqual("QRCode");

    expect(qrPromiseResolved).not.toBeCalled();

    fireEvent.input(getByTestId("mock-qr-input"), {
      target: { value: paymentUri },
    });
    fireEvent.click(getByTestId("mock-qr-dispatch"));

    await runResolvedPromises();

    expect(qrPromiseResolved).toBeCalled();
    expect(await qrPromise).toEqual({ result: "token_incompatible" });

    expect(getCurrentStep(testProps).name).toEqual("step1");
  });

  it("scanQrCode() accepts 'dfinity' token prefix for ICP", async () => {
    const identifier =
      "97731a95e48d63106ede6e6a7c4937475f0a2a1ef0f42f46956a3e06f8e32ba7";
    const paymentUri = `dfinity:${identifier}`;

    const steps: WizardSteps = [
      {
        title: "Step 1",
        name: "step1",
      },
    ];

    const testProps = $state({
      steps,
      ...props,
    });

    const { getByTestId } = render(QrWizardModal, { props: testProps });

    const qrPromise = scanQrCode({
      props: testProps,
      requiredToken: ICPToken,
    });
    const qrPromiseResolved = vi.fn();
    qrPromise.then(qrPromiseResolved);

    await runResolvedPromises();

    expect(getCurrentStep(testProps).name).toEqual("QRCode");

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

    expect(getCurrentStep(testProps).name).toEqual("step1");
  });

  it("scanQrCode() accepts 'dfinity' prefix for DFINITY token", async () => {
    const identifier =
      "97731a95e48d63106ede6e6a7c4937475f0a2a1ef0f42f46956a3e06f8e32ba7";
    const tokenSymbol = "dfinity";
    const paymentUri = `${tokenSymbol}:${identifier}`;

    const steps: WizardSteps = [
      {
        title: "Step 1",
        name: "step1",
      },
    ];

    const testProps = $state({
      steps,
      ...props,
    });

    const { getByTestId } = render(QrWizardModal, { props: testProps });

    const qrPromise = scanQrCode({
      props: testProps,
      requiredToken: {
        ...mockSnsToken,
        symbol: tokenSymbol,
      },
    });
    const qrPromiseResolved = vi.fn();
    qrPromise.then(qrPromiseResolved);

    await runResolvedPromises();

    expect(getCurrentStep(testProps).name).toEqual("QRCode");

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

    expect(getCurrentStep(testProps).name).toEqual("step1");
  });

  it("scanQrCode() rejects 'dfinity' prefix for other token", async () => {
    const identifier =
      "97731a95e48d63106ede6e6a7c4937475f0a2a1ef0f42f46956a3e06f8e32ba7";
    const paymentUri = `dfinity:${identifier}`;

    const steps: WizardSteps = [
      {
        title: "Step 1",
        name: "step1",
      },
    ];

    const testProps = $state({
      steps,
      ...props,
    });

    const { getByTestId } = render(QrWizardModal, { props: testProps });

    const qrPromise = scanQrCode({
      props: testProps,
      requiredToken: {
        ...mockSnsToken,
        symbol: "abc",
      },
    });
    const qrPromiseResolved = vi.fn();
    qrPromise.then(qrPromiseResolved);

    await runResolvedPromises();

    expect(getCurrentStep(testProps).name).toEqual("QRCode");

    expect(qrPromiseResolved).not.toBeCalled();

    fireEvent.input(getByTestId("mock-qr-input"), {
      target: { value: paymentUri },
    });
    fireEvent.click(getByTestId("mock-qr-dispatch"));

    await runResolvedPromises();

    expect(qrPromiseResolved).toBeCalled();
    expect(await qrPromise).toEqual({ result: "token_incompatible" });

    expect(getCurrentStep(testProps).name).toEqual("step1");
  });

  it("resolves scanQrCode() to 'canceled' when canceled", async () => {
    const steps: WizardSteps = [
      {
        title: "Step 1",
        name: "step1",
      },
    ];

    const testProps = $state({
      steps,
      ...props,
    });

    const { getByTestId } = render(QrWizardModal, { props: testProps });

    const qrPromise = scanQrCode({
      props: testProps,
      requiredToken: ICPToken,
    });
    const qrPromiseResolved = vi.fn();
    qrPromise.then(qrPromiseResolved);

    await runResolvedPromises();

    expect(getCurrentStep(testProps).name).toEqual("QRCode");

    const cancelButton = getByTestId("transaction-qrcode-button-cancel");
    expect(cancelButton).toBeInTheDocument();

    expect(qrPromiseResolved).not.toBeCalled();
    fireEvent.click(cancelButton);
    await runResolvedPromises();

    expect(qrPromiseResolved).toBeCalled();
    expect(await qrPromise).toEqual({ result: "canceled" });
  });

  it("can go to next step and back", async () => {
    const steps: WizardSteps = [
      {
        title: "Step 1",
        name: "step1",
      },
      {
        title: "Step 2",
        name: "step2",
      },
    ];

    const testProps = $state({
      steps,
      ...props,
    });

    render(QrWizardModal, { props: testProps });

    expect(getCurrentStep(testProps).name).toEqual("step1");

    goToNextStep(testProps);
    await runResolvedPromises();
    expect(getCurrentStep(testProps).name).toEqual("step2");

    goToPreviousStep(testProps);
    await runResolvedPromises();
    expect(getCurrentStep(testProps).name).toEqual("step1");
  });

  it("scanQrCode returns to original step when canceled", async () => {
    const steps: WizardSteps = [
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

    const testProps = $state({
      steps,
      ...props,
    });

    const { getByTestId } = render(QrWizardModal, { props: testProps });

    expect(getCurrentStep(testProps).name).toEqual("step1");

    goToNextStep(testProps);
    await runResolvedPromises();
    expect(getCurrentStep(testProps).name).toEqual("step2");

    scanQrCode({
      props: testProps,
      requiredToken: ICPToken,
    });
    await runResolvedPromises();

    expect(getCurrentStep(testProps).name).toEqual("QRCode");

    const cancelButton = getByTestId("transaction-qrcode-button-cancel");
    fireEvent.click(cancelButton);
    await runResolvedPromises();

    expect(getCurrentStep(testProps).name).toEqual("step2");
  });
});
