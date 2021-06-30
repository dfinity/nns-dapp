import 'package:core/core.dart';

class PercentageDisplayWidget extends StatelessWidget {
  final double amount;
  final int amountSize;
  final String locale;

  const PercentageDisplayWidget(
      {Key? key,
      required this.amount,
      required this.amountSize,
      required this.locale})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          "${amount.toStringAsFixed(3)}%",
          style: TextStyle(
            color: AppColors.white,
            fontFamily: Fonts.circularBold,
            fontSize: amountSize.toDouble(),
          ),
        ),
        SizedBox(
          width: 7,
        )
      ],
    );
  }
}
