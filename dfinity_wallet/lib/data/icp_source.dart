import 'package:dfinity_wallet/dfinity.dart';
import 'package:intl/intl.dart';

import 'icp.dart';

abstract class ICPSource {
  String get address;
  int? get subAccountId;
  ICPSourceType get type;
  ICP get icpBalance;
}

const E8S_PER_ICP = 100000000;
const TRANSACTION_FEE_ICP = 10000 / E8S_PER_ICP;
//  Construct ICPTs from E8s,
//  10E8 E8s == 1 ICP

enum ICPSourceType { ACCOUNT, HARDWARE_WALLET, NEURON }

extension ToDoms on double {
  BigInt get toE8s {
    final floored = this.floor();
    final remainder = this - floored;
    final domsInt = (BigInt.from(E8S_PER_ICP) * BigInt.from(floored)) +
        BigInt.from(remainder * E8S_PER_ICP);
    return domsInt;
  }
}

extension ToICPT on BigInt {
  double get toICPT => this / BigInt.from(E8S_PER_ICP);
}

/*
  * The format should be:
  * a “.” separating full ICP from fractional part
  * “ “ as a “thousands” separator in the “full” part
  * in the fractional part, show at least two digits (like “10.00” or “11.30”), otherwise cut trailing zeroes
  * Examples:
  *   10.00
  *   10.01
  *   10.10
  *   10.123
  *   20.00
  *   200.00
  *   2 000.00
  *   20 000.00
*/

extension DisplayICPTDouble on double {
  Function(String locale) get toDisplayICPT => (String locale) {
        return NumberFormat("###,##0.00######", locale).format(this);
      };
}
