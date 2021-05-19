import 'package:intl/intl.dart';

final _e8sPerICP = BigInt.from(100000000);

/// A class for representing units of ICP.
class ICP {
  final BigInt _e8s;

  /// Initialize ICP from a string.
  static fromString(String s) {
    // First try to parse the string as a double to ensure the input is sane.
    {
      final doubleValue = double.parse(s);
      if (doubleValue < 0) {
        throw new FormatException("ICP value cannot be negative: $s");
      }
    }

    final splits = s.split(".");
    if (splits.length > 2) {
      // This should never happen, since we already know the string parses as a double.
      throw new FormatException("Invalid format for ICP: $s");
    }

    final integral = splits[0];
    var fractional = (splits.length > 1) ? splits[1] : "";
    if (fractional.length > 8) {
      throw new FormatException("Fractional can have at most 8 decimal places");
    }

    // Pad the fractional to be 8 digits for easier conversion to BigInt.
    fractional = fractional.padRight(8, '0');

    BigInt value =
        (BigInt.parse(integral) * _e8sPerICP) + BigInt.parse(fractional);
    return new ICP._(value);
  }

  /// Private constructor.
  ICP._(this._e8s);

  BigInt asE8s() {
    return this._e8s;
  }

  String asString(String locale) {
    // Convert ICP to double for formatting.
    final icpDouble = this._e8s / _e8sPerICP;
    return NumberFormat("###,##0.00######", locale).format(icpDouble);
  }
}
