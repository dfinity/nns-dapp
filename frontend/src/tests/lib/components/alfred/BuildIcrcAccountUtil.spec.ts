import BuildIcrcAccountUtil from "$lib/components/alfred/BuildIcrcAccountUtil.svelte";
import { hexStringToUint8Array } from "@dfinity/utils";
import { SubAccount } from "@icp-sdk/canisters/ledger/icp";
import { encodeIcrcAccount } from "@icp-sdk/canisters/ledger/icrc";
import { Principal } from "@icp-sdk/core/principal";
import { fireEvent, render } from "@testing-library/svelte";
import { tick } from "svelte";

describe("BuildIcrcAccountUtil", () => {
  const testPrincipal = "rrkah-fqaaa-aaaaa-aaaaq-cai";
  const testHexSubaccount =
    "ff0c0b36afefffd0c7a4d85c0bcea366acd6d74f45f7703d0783cc6448899c68";

  const getPrincipalInput = (container: HTMLElement): HTMLInputElement =>
    container.querySelector(
      '[data-tid="alfred-util-principal"]'
    ) as HTMLInputElement;

  const getSubaccountInput = (container: HTMLElement): HTMLInputElement =>
    container.querySelector(
      '[data-tid="alfred-util-subaccount"]'
    ) as HTMLInputElement;

  const getOutput = (container: HTMLElement): HTMLElement | null =>
    container.querySelector('[data-tid="alfred-util-hex-output"]');

  const getError = (container: HTMLElement): HTMLElement | null =>
    container.querySelector(".error-message");

  const setInputValues = async (
    container: HTMLElement,
    { principal, subaccount }: { principal: string; subaccount: string }
  ) => {
    const principalInput = getPrincipalInput(container);
    const subaccountInput = getSubaccountInput(container);

    await fireEvent.input(principalInput, { target: { value: principal } });
    await fireEvent.input(subaccountInput, { target: { value: subaccount } });
    await tick();
  };

  const expectedIcrcAccount = ({
    principal,
    subaccountBytes,
  }: {
    principal: string;
    subaccountBytes: Uint8Array;
  }): string =>
    encodeIcrcAccount({
      owner: Principal.fromText(principal),
      subaccount: subaccountBytes,
    });

  it("should render principal and subaccount inputs", () => {
    const { container } = render(BuildIcrcAccountUtil);

    expect(getPrincipalInput(container)).not.toBeNull();
    expect(getSubaccountInput(container)).not.toBeNull();
  });

  it("should not show output when inputs are empty", () => {
    const { container } = render(BuildIcrcAccountUtil);

    expect(getOutput(container)).toBeNull();
    expect(getError(container)).toBeNull();
  });

  it("should encode with a numeric subaccount ID", async () => {
    const { container } = render(BuildIcrcAccountUtil);

    await setInputValues(container, {
      principal: testPrincipal,
      subaccount: "0",
    });

    const output = getOutput(container);
    expect(output).not.toBeNull();
    expect(output?.textContent).toBe(
      expectedIcrcAccount({
        principal: testPrincipal,
        subaccountBytes: SubAccount.fromID(0).toUint8Array(),
      })
    );
  });

  it("should encode with a larger numeric subaccount ID", async () => {
    const { container } = render(BuildIcrcAccountUtil);

    await setInputValues(container, {
      principal: testPrincipal,
      subaccount: "12345",
    });

    const output = getOutput(container);
    expect(output).not.toBeNull();
    expect(output?.textContent).toBe(
      expectedIcrcAccount({
        principal: testPrincipal,
        subaccountBytes: SubAccount.fromID(12345).toUint8Array(),
      })
    );
  });

  it("should encode a decimal subaccount ID above MAX_SAFE_INTEGER as decimal", async () => {
    const { container } = render(BuildIcrcAccountUtil);

    // 99999999999999999 is 0x016345785d89ffff.
    const bigDigitString = "99999999999999999";
    expect(Number(bigDigitString)).toBeGreaterThan(Number.MAX_SAFE_INTEGER);

    await setInputValues(container, {
      principal: testPrincipal,
      subaccount: bigDigitString,
    });

    const output = getOutput(container);
    expect(output).not.toBeNull();
    expect(output?.textContent).toBe(
      expectedIcrcAccount({
        principal: testPrincipal,
        subaccountBytes: hexStringToUint8Array(
          "016345785d89ffff".padStart(64, "0")
        ),
      })
    );
  });

  it("should not read a decimal subaccount ID as hex", async () => {
    const { container } = render(BuildIcrcAccountUtil);

    const bigDigitString = "18446744073709551615";
    await setInputValues(container, {
      principal: testPrincipal,
      subaccount: bigDigitString,
    });

    const uint64MaxBytes = new Uint8Array(32);
    uint64MaxBytes.fill(0xff, 24);

    const output = getOutput(container);
    expect(output).not.toBeNull();
    expect(output?.textContent).toBe(
      expectedIcrcAccount({
        principal: testPrincipal,
        subaccountBytes: uint64MaxBytes,
      })
    );
    expect(output?.textContent).not.toBe(
      expectedIcrcAccount({
        principal: testPrincipal,
        subaccountBytes: hexStringToUint8Array(
          bigDigitString.padStart(64, "0")
        ),
      })
    );
  });

  it("should show error for a decimal subaccount ID above 32 bytes", async () => {
    const { container } = render(BuildIcrcAccountUtil);

    await setInputValues(container, {
      principal: testPrincipal,
      subaccount: "9".repeat(78),
    });

    expect(getOutput(container)).toBeNull();
    expect(getError(container)).not.toBeNull();
  });

  it("should show error for a very long digit string", async () => {
    const { container } = render(BuildIcrcAccountUtil);

    await setInputValues(container, {
      principal: testPrincipal,
      subaccount: "1".repeat(100000),
    });

    expect(getOutput(container)).toBeNull();
    expect(getError(container)).not.toBeNull();
  });

  it("should ignore leading zeros in a decimal subaccount ID", async () => {
    const { container } = render(BuildIcrcAccountUtil);

    await setInputValues(container, {
      principal: testPrincipal,
      subaccount: "0".repeat(100) + "12345",
    });

    const output = getOutput(container);
    expect(output).not.toBeNull();
    expect(output?.textContent).toBe(
      expectedIcrcAccount({
        principal: testPrincipal,
        subaccountBytes: SubAccount.fromID(12345).toUint8Array(),
      })
    );
  });

  it("should encode with a 32-byte hex subaccount", async () => {
    const { container } = render(BuildIcrcAccountUtil);

    await setInputValues(container, {
      principal: testPrincipal,
      subaccount: testHexSubaccount,
    });

    const hexBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      hexBytes[i] = parseInt(testHexSubaccount.slice(i * 2, i * 2 + 2), 16);
    }

    const output = getOutput(container);
    expect(output).not.toBeNull();
    expect(output?.textContent).toBe(
      expectedIcrcAccount({
        principal: testPrincipal,
        subaccountBytes: hexBytes,
      })
    );
  });

  it("should encode with a 0x-prefixed hex subaccount", async () => {
    const { container } = render(BuildIcrcAccountUtil);

    await setInputValues(container, {
      principal: testPrincipal,
      subaccount: `0x${testHexSubaccount}`,
    });

    const hexBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      hexBytes[i] = parseInt(testHexSubaccount.slice(i * 2, i * 2 + 2), 16);
    }

    const output = getOutput(container);
    expect(output).not.toBeNull();
    expect(output?.textContent).toBe(
      expectedIcrcAccount({
        principal: testPrincipal,
        subaccountBytes: hexBytes,
      })
    );
  });

  it("should show error for invalid principal", async () => {
    const { container } = render(BuildIcrcAccountUtil);

    await setInputValues(container, {
      principal: "not-a-principal",
      subaccount: "0",
    });

    expect(getOutput(container)).toBeNull();
    expect(getError(container)).not.toBeNull();
  });

  it("should encode short hex subaccount with zero-padding", async () => {
    const { container } = render(BuildIcrcAccountUtil);

    await setInputValues(container, {
      principal: testPrincipal,
      subaccount: "ff0c0b36",
    });

    const output = getOutput(container);
    expect(output).not.toBeNull();
    expect(output?.textContent).toBe(
      expectedIcrcAccount({
        principal: testPrincipal,
        subaccountBytes: hexStringToUint8Array("ff0c0b36".padStart(64, "0")),
      })
    );
  });

  it("should show error for invalid hex characters", async () => {
    const { container } = render(BuildIcrcAccountUtil);

    const invalidHex = "zz" + testHexSubaccount.slice(2);
    await setInputValues(container, {
      principal: testPrincipal,
      subaccount: invalidHex,
    });

    expect(getOutput(container)).toBeNull();
    expect(getError(container)).not.toBeNull();
  });

  it("should clear output when principal is cleared", async () => {
    const { container } = render(BuildIcrcAccountUtil);

    await setInputValues(container, {
      principal: testPrincipal,
      subaccount: "0",
    });
    expect(getOutput(container)).not.toBeNull();

    const principalInput = getPrincipalInput(container);
    await fireEvent.input(principalInput, { target: { value: "" } });
    await tick();

    expect(getOutput(container)).toBeNull();
    expect(getError(container)).toBeNull();
  });

  it("should clear output when subaccount is cleared", async () => {
    const { container } = render(BuildIcrcAccountUtil);

    await setInputValues(container, {
      principal: testPrincipal,
      subaccount: "0",
    });
    expect(getOutput(container)).not.toBeNull();

    const subaccountInput = getSubaccountInput(container);
    await fireEvent.input(subaccountInput, { target: { value: "" } });
    await tick();

    expect(getOutput(container)).toBeNull();
    expect(getError(container)).toBeNull();
  });

  it("should handle uppercase hex input", async () => {
    const { container } = render(BuildIcrcAccountUtil);

    const upperHex = testHexSubaccount.toUpperCase();
    await setInputValues(container, {
      principal: testPrincipal,
      subaccount: upperHex,
    });

    const hexBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      hexBytes[i] = parseInt(testHexSubaccount.slice(i * 2, i * 2 + 2), 16);
    }

    const output = getOutput(container);
    expect(output).not.toBeNull();
    expect(output?.textContent).toBe(
      expectedIcrcAccount({
        principal: testPrincipal,
        subaccountBytes: hexBytes,
      })
    );
  });
});
