import 'package:core/core.dart';
import 'package:nns_dapp/data/icp.dart';

class BalanceDisplayWidget extends StatelessWidget {
  final ICP amount;
  final int amountSize;
  final int icpLabelSize;
  final String? amountLabelSuffix;

  const BalanceDisplayWidget(
      {Key? key,
      required this.amount,
      required this.amountSize,
      required this.icpLabelSize,
      this.amountLabelSuffix})
      : super(key: key);

  String getAmount() {
    return "${amount.asString()}${amountLabelSuffix ?? ""}";
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
                  fontSize: amountSize.toDouble() * 0.6))
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        BalanceDisplayWidget(
          amount: amount,
          amountSize: amountSize,
          icpLabelSize: icpLabelSize,
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
