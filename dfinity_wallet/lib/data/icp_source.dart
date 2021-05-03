import 'package:dfinity_wallet/dfinity.dart';

abstract class ICPSource {
  String get address;
  int? get subAccountId;
  ICPSourceType get type;
  String get balance;
  double get icpBalance => balance.toBigInt.toICPT;
}
const DOMS_TO_ICPT = 100000000;

enum ICPSourceType {
  ACCOUNT, HARDWARE_WALLET, NEURON
}

extension ToDoms on double {
  BigInt get toE8s {
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