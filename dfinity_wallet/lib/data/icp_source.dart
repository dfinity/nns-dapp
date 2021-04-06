abstract class ICPSource {
  String get address;
  BigInt? get subAccountId;

  BigInt get balance;
  double get icpBalance => balance.toICPT;

  //
  // set icpBalance(double value) {
  //   final floored = value.floor();
  //   final remainder = value - floored;
  //   final domsInt = (BigInt.from(DOMS_TO_ICPT) * BigInt.from(floored)) +
  //       BigInt.from(remainder * DOMS_TO_ICPT);
  //   domsBalance = domsInt;
  // }
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

extension ToICPT on BigInt {
  double get toICPT => this / BigInt.from(DOMS_TO_ICPT);
}