import 'package:flutter/services.dart';
import 'number_formatter.dart';

final _e8sPerICP = BigInt.from(100000000);

/// A class for representing units of ICP.
class ICP {
  final BigInt _e8s;

  /// Initialize ICP from the amount of e8s.
  static ICP fromE8s(BigInt e8s) {
    return new ICP._(e8s);
  }

  /// Returns an ICP instance with zero e8s.
  static ICP get zero {
    return new ICP._(BigInt.zero);
  }

  /// Returns an ICP instance whose value is 1 ICP.
  static ICP get one {
    return new ICP._(_e8sPerICP);
  }

  /// Initialize ICP from a string.
  static ICP fromString(String s) {
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

    final integralString = splits[0];
    final integral =
        integralString.isEmpty ? BigInt.zero : BigInt.parse(integralString);

    var fractionalString = (splits.length > 1) ? splits[1] : "";
    if (fractionalString.length > 8) {
      throw new FormatException("Fractional can have at most 8 decimal places");
    }

    // Pad the fractionalString to be 8 digits for easier conversion to BigInt.
    fractionalString = fractionalString.padRight(8, '0');

    final fractional = BigInt.parse(fractionalString);

    BigInt value = (integral * _e8sPerICP) + fractional;
    return new ICP._(value);
  }

  /// Private constructor.
  ICP._(this._e8s);

  BigInt asE8s() {
    return this._e8s;
  }

  String asString(
      {bool withSeparators = true, int minDecimals = 2, int maxDecimals = 8}) {
    return format(this._e8s, 8, minDecimals, maxDecimals, withSeparators);
  }

  /// Returns the number of ICP as a double. Warning - this can result in loss
  /// of precision!
  double asDouble() {
    return this._e8s / _e8sPerICP;
  }

  ICP operator +(ICP other) {
    return ICP.fromE8s(_e8s + other._e8s);
  }

  ICP operator -(ICP other) {
    return ICP.fromE8s(_e8s - other._e8s);
  }

  bool operator ==(Object other) {
    if (other is ICP) {
      return _e8s == other._e8s;
    } else {
      return false;
    }
  }

  @override
  int get hashCode {
    return this._e8s.hashCode;
  }
}

class ICPTextInputFormatter extends TextInputFormatter {
  final RegExp pattern = RegExp(r'^[\d]*(\.[\d]{0,8})?$');

  ICPTextInputFormatter();

  @override
  TextEditingValue formatEditUpdate(
      TextEditingValue oldValue, TextEditingValue newValue) {
    return this.pattern.hasMatch(newValue.text) ? newValue : oldValue;
  }
}
