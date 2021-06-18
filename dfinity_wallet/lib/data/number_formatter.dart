import 'package:intl/intl.dart';

/// For formatting ICP and Cycles values.
/// When formatting ICP, 1 atom = 1 e8.
/// When formatting Cycles, 1 atom = 1 cycle.
String format(BigInt atomCount, int atomsPerIntPow10, int minDecimals, int maxDecimals, String locale) {
  if (minDecimals < 0 || minDecimals > atomsPerIntPow10) {
    throw new ArgumentError.value(minDecimals, "minDecimals");
  }
  if (maxDecimals < 0 || maxDecimals > atomsPerIntPow10 || maxDecimals < minDecimals) {
    throw new ArgumentError.value(maxDecimals, "maxDecimals");
  }

  final atomsPerInt = BigInt.from(10).pow(atomsPerIntPow10);
  final integral = (atomCount / atomsPerInt).floor();
  final integralString = NumberFormat("###,##0", locale).format(integral);

  final fractional = (atomCount % atomsPerInt).toInt();
  var fractionalString = NumberFormat("#######0", locale).format(fractional);

  if (fractionalString.length < atomsPerIntPow10) {
    fractionalString = fractionalString.padLeft(atomsPerIntPow10, "0");
  }
  fractionalString = fractionalString.substring(0, maxDecimals);

  late int trimCount = 0;
  for (var i = fractionalString.length - 1; i >= minDecimals; i--) {
    if (fractionalString[i] != "0") {
      break;
    }
    trimCount++;
  }
  if (trimCount > 0) {
    fractionalString = fractionalString.substring(0, fractionalString.length - trimCount);
  }

  return fractionalString.length > 0
      ? integralString + "." + fractionalString
      : integralString;
}