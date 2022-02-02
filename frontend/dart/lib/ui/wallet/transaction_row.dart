import 'package:intl/intl.dart';
import 'package:flutter/material.dart';
import 'package:nns_dapp/data/icp.dart';
import 'package:nns_dapp/data/transaction_type.dart';
import 'package:nns_dapp/ui/_components/custom_auto_size.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';

import '../../nns_dapp.dart';

class TransactionRow extends StatelessWidget {
  final Transaction transaction;
  final Account currentAccount;

  const TransactionRow(
      {Key? key, required this.transaction, required this.currentAccount})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final dateFormatter = DateFormat.yMd().add_jm();
    final isReceive = transaction.from != currentAccount.accountIdentifier;
    final isSend = transaction.to != currentAccount.accountIdentifier;

    return Card(
      color: Color(0xff292a2e),
      child: Container(
        width: double.infinity,
        child: Padding(
          padding: Responsive.isMobile(context)
              ? const EdgeInsets.all(24.0)
              : const EdgeInsets.only(
                  top: 8.0, left: 24.0, right: 24.0, bottom: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Flexible(
                    child: AutoSizeText(
                      transaction.type.getName(isReceive),
                      wrapWords: true,
                      style: Responsive.isMobile(context)
                          ? context.textTheme.headline6
                          : context.textTheme.headline3,
                    ),
                  ),
                  Flexible(
                    flex: 2,
                    child: TransactionAmountDisplayWidget(
                      fee: transaction.fee,
                      amount: transaction.amount,
                      type: transaction.type,
                      isReceive: isReceive,
                    ),
                  ),
                ],
              ),
              VerySmallFormDivider(),
              Text(dateFormatter.format(transaction.date),
                  style: context.textTheme.bodyText1),
              VerySmallFormDivider(),
              if (isReceive)
                SelectableText("Source: ${transaction.from}",
                    style: context.textTheme.bodyText1),
              if (isSend)
                SelectableText(
                  "To: ${transaction.to}",
                  style: context.textTheme.bodyText1,
                ),
              SizedBox(
                width: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class TransactionAmountDisplayWidget extends StatelessWidget {
  final ICP amount;
  final ICP fee;
  final TransactionType type;
  final bool isReceive;

  const TransactionAmountDisplayWidget(
      {Key? key,
      required this.fee,
      required this.amount,
      required this.type,
      required this.isReceive})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final sign = isReceive ? "+" : "-";
    final color = isReceive ? AppColors.green500 : AppColors.gray50;
    final secondaryColor = isReceive ? AppColors.green600 : AppColors.gray200;

    final displayAmount =
        amount + (type.shouldShowFee(isReceive) ? this.fee : ICP.zero);
    return Padding(
      padding: Responsive.isMobile(context)
          ? const EdgeInsets.only(top: 10.0)
          : const EdgeInsets.only(top: 15.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          AutoSizeText(
            "$sign${(displayAmount).asString()}",
            style: TextStyle(
              color: color,
              fontFamily: Fonts.circularBold,
              fontSize: Responsive.isMobile(context) ? 20 : 30,
            ),
          ),
          SizedBox(
            width: 7,
          ),
          Text("ICP",
              style: TextStyle(
                  color: secondaryColor,
                  fontFamily: Fonts.circularBook,
                  fontSize: Responsive.isMobile(context) ? 14 : 20.0))
        ],
      ),
    );
  }
}
