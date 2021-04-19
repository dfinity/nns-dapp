import 'package:intl/intl.dart';

final format = DateFormat('E MMM dd yyyy');

extension FormatDateTime on DateTime {
  String get dayFormat => format.format(this);
}
