
import 'package:dartx/dartx.dart';
import 'package:intl/intl.dart';

extension DurationFormatter on Duration {
  String yearsDayHourMinuteSecondFormatted() {
    this.toString();
    final years = (inDays / 365).floor();
    return [
      LabelledPeriod("Year", years),
      LabelledPeriod("Day", this.inDays.remainder(365)),
      LabelledPeriod("Hour", this.inHours.remainder(24)),
      LabelledPeriod("Minute", this.inMinutes.remainder(60)),
      LabelledPeriod("Second", this.inSeconds.remainder(60))
    ].filter((element) => element.amount > 0).take(2).map((e) {
      return "${e.amount} ${e.label}${e.amount == 1 ? "" : "s"}";
    }).join(', ');
  }
}

class LabelledPeriod {
  final String label;
  final int amount;

  LabelledPeriod(this.label, this.amount);
}
