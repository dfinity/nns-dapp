import 'icp.dart';

abstract class ICPSource {
  String get address;
  int? get subAccountId;
  ICPSourceType get type;
  ICP get balance;
}

const E8S_PER_ICP = 100000000;
const TRANSACTION_FEE_E8S = 10000;
//  Construct ICPTs from E8s,
//  10E8 E8s == 1 ICP

enum ICPSourceType { ACCOUNT, HARDWARE_WALLET, NEURON }

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
