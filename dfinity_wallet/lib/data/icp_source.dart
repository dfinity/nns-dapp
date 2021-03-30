abstract class ICPSource {
  String get name;

  String get address;

  abstract String domsBalance;

  double get icpBalance =>
      BigInt.parse(domsBalance) / BigInt.from(DOMS_TO_ICPT);

  set icpBalance(double value) {
    final floored = value.floor();
    final remainder = value - floored;
    final domsInt = (BigInt.from(DOMS_TO_ICPT) * BigInt.from(floored)) +
        BigInt.from(remainder * DOMS_TO_ICPT);
    domsBalance = domsInt.toString();
  }
}

const DOMS_TO_ICPT = 100000000;

extension ToDoms on double {
  BigInt get toDoms {
    final floored = this.floor();
    final remainder = this - floored;
    final domsInt = (BigInt.from(DOMS_TO_ICPT) * BigInt.from(floored)) +
        BigInt.from(remainder * DOMS_TO_ICPT);
    return domsInt;
  }
}
