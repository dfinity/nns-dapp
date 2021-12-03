import { expect, describe, it } from "@jest/globals";
import { ICP } from ".";
import { FromStringError } from "./icp";

describe("ICP", () => {
  it("can be initialized from a whole number string", () => {
    expect(ICP.fromString("1")).toEqual(ICP.fromE8s(BigInt(100000000)));
    expect(ICP.fromString("1234")).toEqual(ICP.fromE8s(BigInt(123400000000)));
    expect(ICP.fromString("000001234")).toEqual(
      ICP.fromE8s(BigInt(123400000000))
    );
    expect(ICP.fromString(" 1")).toEqual(ICP.fromE8s(BigInt(100000000)));
    expect(ICP.fromString("1,000")).toEqual(ICP.fromE8s(BigInt(100000000000)));
    expect(ICP.fromString("1'000")).toEqual(ICP.fromE8s(BigInt(100000000000)));
    expect(ICP.fromString("1'000'000")).toEqual(
      ICP.fromE8s(BigInt(100000000000000))
    );
  });

  it("can be initialized from a fractional number string", () => {
    expect(ICP.fromString("0.1")).toEqual(ICP.fromE8s(BigInt(10000000)));
    expect(ICP.fromString("0.0001")).toEqual(ICP.fromE8s(BigInt(10000)));
    expect(ICP.fromString("0.00000001")).toEqual(ICP.fromE8s(BigInt(1)));
    expect(ICP.fromString("0.0000000001")).toEqual(
      FromStringError.FRACTIONAL_MORE_THAN_8_DECIMALS
    );
    expect(ICP.fromString(".01")).toEqual(ICP.fromE8s(BigInt(1000000)));
  });

  it("can be initialized from a mixed string", () => {
    expect(ICP.fromString("1.1")).toEqual(ICP.fromE8s(BigInt(110000000)));
    expect(ICP.fromString("1.1")).toEqual(ICP.fromE8s(BigInt(110000000)));
    expect(ICP.fromString("12,345.00000001")).toEqual(
      ICP.fromE8s(BigInt(1234500000001))
    );
    expect(ICP.fromString("12'345.00000001")).toEqual(
      ICP.fromE8s(BigInt(1234500000001))
    );
    expect(ICP.fromString("12345.00000001")).toEqual(
      ICP.fromE8s(BigInt(1234500000001))
    );
  });

  it("returns an error on invalid formats", () => {
    expect(ICP.fromString("1.1.1")).toBe(FromStringError.INVALID_FORMAT);
    expect(ICP.fromString("a")).toBe(FromStringError.INVALID_FORMAT);
    expect(ICP.fromString("3.a")).toBe(FromStringError.INVALID_FORMAT);
    expect(ICP.fromString("123asdf$#@~!")).toBe(FromStringError.INVALID_FORMAT);
  });

  it("rejects negative numbers", () => {
    expect(ICP.fromString("-1")).toBe(FromStringError.INVALID_FORMAT);
  });
});
