import 'package:intl/intl.dart';

final _oneTrillion = BigInt.from(1000000) * BigInt.from(1000000);

/// A class for representing units of Cycles.
class Cycles {
  final BigInt _cycles;

  /// Private constructor.
  Cycles._(this._cycles);

  BigInt get amount {
    return _cycles;
  }

  static Cycles fromBigInt(BigInt cycles) {
    return Cycles._(cycles);
  }

  static Cycles fromTs(double amountTs) {
    return Cycles._(BigInt.from(amountTs * _oneTrillion.toDouble()));
  }

  double asTs() {
    return _cycles / _oneTrillion;
  }

  String asStringT(String locale) {
    return NumberFormat("###,##0.00####", locale).format(asTs());
  }
}
