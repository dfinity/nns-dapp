import 'package:intl/intl.dart';

import '../../dfinity.dart';

class BalanceDisplayWidget extends StatelessWidget {
    final double amount;
    final int amountSize;
    final int icpLabelSize;
    final Axis direction;

    const BalanceDisplayWidget({Key? key, required this.amount, required this.amountSize, required this.icpLabelSize, this.direction = Axis.vertical})
            : super(key: key);

    @override
    Widget build(BuildContext context) {
        var f = NumberFormat("###,###.#", "en_US");
        return Flex(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            direction: direction,
            children: [
                Text(
                    f.format(amount),
                    style: TextStyle(color: AppColors.white, fontFamily: Fonts.circularBold, fontSize: amountSize.toDouble()),
                ),
                SizedBox(
                    width: 7,
                ),
                Text("ICP",
                        style: TextStyle(color: AppColors.gray200, fontFamily: Fonts.circularBook, fontSize: amountSize.toDouble()* 0.4))
            ],
        );
    }
}

class LabelledBalanceDisplayWidget extends StatelessWidget {

    final double amount;
    final int amountSize;
    final int icpLabelSize;
    final Text text;

  const LabelledBalanceDisplayWidget({Key? key, required this.amount, required this.amountSize, required this.icpLabelSize, required this.text}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
            BalanceDisplayWidget(
                amount: amount,
                amountSize: 30,
                icpLabelSize: 15),
            SizedBox(height: 5),
            text
        ],
    );
  }
}
