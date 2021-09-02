import 'package:core/core.dart';
import 'package:dfinity_wallet/data/icp.dart';
import 'package:dfinity_wallet/ui/_components/constants.dart';

class BalanceDisplayWidget extends StatelessWidget {
  final ICP amount;
  final int amountSize;
  final int icpLabelSize;
  final String locale;
  final String? amountLabelSuffix;

  const BalanceDisplayWidget(
      {Key? key,
      required this.amount,
      required this.amountSize,
      required this.icpLabelSize,
      required this.locale,
      this.amountLabelSuffix})
      : super(key: key);

  // Temporary method until all callers are not using doubles.
  // String getAmount() {
  //   return "${amount.asString(this.locale)}${amountLabelSuffix ?? ""}";
  // }
  // Temporary method until all callers are not using doubles.
  // This is using swiss german 'de-CH' for the currency representation.
  //Change this is have to take the passed locale parameter if you want
  //currency to be represented based on language.
  String getAmount() {
    return "${amount.asString(true)}${amountLabelSuffix ?? ""}";
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          getAmount(),
          style: TextStyle(
            color: AppColors.white,
            fontFamily: Fonts.circularBold,
            fontSize: amountSize.toDouble(),
          ),
        ),
        SizedBox(
          width: 7,
        ),
        if (icpLabelSize != 0)
          Text("ICP",
              style: TextStyle(
                  color: AppColors.gray200,
                  fontFamily: Fonts.circularBook,
                  fontSize: amountSize.toDouble() * 0.4))
      ],
    );
  }
}

class LabelledBalanceDisplayWidget extends StatelessWidget {
  final ICP amount;
  final int amountSize;
  final int icpLabelSize;
  final Text text;

  const LabelledBalanceDisplayWidget(
      {Key? key,
      required this.amount,
      required this.amountSize,
      required this.icpLabelSize,
      required this.text})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final myLocale = Localizations.localeOf(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        BalanceDisplayWidget(
          amount: amount,
          amountSize: amountSize,
          icpLabelSize: icpLabelSize,
          locale: myLocale.languageCode,
        ),
        SizedBox(height: 5),
        text
      ],
    );
  }
}

class RowBalanceDisplayWidget extends StatelessWidget {
  final ICP amount;
  final int amountSize;
  final int amountDecimalPlaces;
  final int icpLabelSize;
  final Text text;

  const RowBalanceDisplayWidget(
      {Key? key,
      required this.amount,
      required this.amountSize,
      required this.amountDecimalPlaces,
      required this.icpLabelSize,
      required this.text})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        text,
        SizedBox(width: 5),
        Text(
          amount.asDouble().toStringAsFixed(amountDecimalPlaces),
          style: TextStyle(
            color: AppColors.white,
            fontFamily: Fonts.circularBold,
            fontSize: amountSize.toDouble(),
          ),
        ),
      ],
    );
  }
}
