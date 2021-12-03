import { ICPTs } from "../proto/ledger_pb";

const E8S_PER_ICP = BigInt(100000000);

export class ICP {
  private constructor(private e8s: bigint) {}

  public static fromE8s(amount: bigint): ICP {
    return new ICP(amount);
  }

  /**
   * Initialize from a string. Accepted formats:
   *
   * 1234567.8901
   * 1'234'567.8901
   * 1,234,567.8901
   */
  public static fromString(amount: string): ICP | FromStringError {
    // Remove all instances of "," and "'".
    amount = amount.trim().replace(/[,']/g, "");

    // Verify that the string is of the format 1234.5678
    const regexMatch = amount.match(/\d*(\.\d*)?/);
    if (!regexMatch || regexMatch[0] !== amount) {
      return FromStringError.INVALID_FORMAT;
    }

    const [integral, fractional] = amount.split(".");

    let e8s = BigInt(0);

    if (integral) {
      try {
        e8s += BigInt(integral) * E8S_PER_ICP;
      } catch {
        return FromStringError.INVALID_FORMAT;
      }
    }

    if (fractional) {
      if (fractional.length > 8) {
        return FromStringError.FRACTIONAL_MORE_THAN_8_DECIMALS;
      }
      try {
        e8s += BigInt(fractional.padEnd(8, "0"));
      } catch {
        return FromStringError.INVALID_FORMAT;
      }
    }

    return new ICP(e8s);
  }

  public toE8s(): bigint {
    return this.e8s;
  }

  public toProto(): ICPTs {
    const proto = new ICPTs();
    proto.setE8s(this.e8s.toString());
    return proto;
  }
}

export enum FromStringError {
  FRACTIONAL_MORE_THAN_8_DECIMALS,
  INVALID_FORMAT,
}
