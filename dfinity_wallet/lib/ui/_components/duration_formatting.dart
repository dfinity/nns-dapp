
import 'package:dartx/dartx.dart';

const ONE_YEAR_SECONDS = (4 * 365 + 1) * ONE_DAY_SECONDS / 4;
const ONE_DAY_SECONDS = 24 * 60 * 60;

extension DurationFormatter on Duration {
  String yearsDayHourMinuteSecondFormatted() {
    final years = (inSeconds / ONE_YEAR_SECONDS).floor();
    final days = (inSeconds.remainder(ONE_YEAR_SECONDS) / ONE_DAY_SECONDS).floor();
    final nonZeroPeriods = [
      LabelledPeriod("Year", years),
      LabelledPeriod("Day", days),
      LabelledPeriod("Hour", this.inHours.remainder(24)),
      LabelledPeriod("Minute", this.inMinutes.remainder(60)),
      LabelledPeriod("Second", this.inSeconds.remainder(60))
    ].filter((element) => element.amount > 0).toList();
    if (nonZeroPeriods.isEmpty) {
      return "0";
    }

    return nonZeroPeriods.take(2).map((e) {
      return "${e.amount} ${e.label}${e.amount == 1 ? "" : "s"}";
    }).join(', ');
  }
}

class LabelledPeriod {
  final String label;
  final int amount;

  LabelledPeriod(this.label, this.amount);
}
