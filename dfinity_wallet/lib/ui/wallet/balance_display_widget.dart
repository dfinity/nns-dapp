import 'package:core/core.dart';
import 'package:dfinity_wallet/data/icp.dart';

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
  String getAmount() {
    return "${amount.asString(this.locale)}${amountLabelSuffix ?? ""}";
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
          amountSize: 30,
          icpLabelSize: icpLabelSize,
          locale: myLocale.languageCode,
        ),
        SizedBox(height: 5),
        text
      ],
    );
  }
}
