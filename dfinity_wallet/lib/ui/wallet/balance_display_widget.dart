import 'package:core/core.dart';
import 'package:dfinity_wallet/data/icp.dart';
import 'package:intl/intl.dart';

class BalanceDisplayWidget extends StatelessWidget {
  // Made dynamic for temporary compatibility with the callers.
  final dynamic amount;
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

  // Temporary method until all callers are not using doubles.
  String getAmount() {
    // TODO(NU-58): Use a standard formatting for all locales. For now, en_US is
    // used.
    final String languageCode = "en_US";
    if (amount is ICP) {
      return "${amount.asString(languageCode)}${amountLabelSuffix ?? ""}";
    } else if (amount is double) {
      return "${NumberFormat("###,##0.00######", languageCode).format(amount)}${amountLabelSuffix ?? ""}";
    } else {
      throw FormatException("Expected amount to be of type double or ICP");
    }
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
  final double amount;
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
          amountSize: 30,
          icpLabelSize: icpLabelSize,
        ),
        SizedBox(height: 5),
        text
      ],
    );
  }
}
