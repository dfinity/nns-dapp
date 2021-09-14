import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nns_dapp/data/icp.dart';
import 'package:nns_dapp/ui/wallet/balance_display_widget.dart';

void main() {
  testWidgets('Display ICP', (WidgetTester tester) async {
    await tester.pumpWidget(Directionality(
      child: MediaQuery(
        data: MediaQueryData(),
        child: BalanceDisplayWidget(
          amount: ICP.fromString("1.23"),
          amountSize: 50,
          icpLabelSize: 9,
          amountLabelSuffix: " ICP",
        ),
      ),
      textDirection: TextDirection.ltr,
    ));

    expect(find.text("1.23 ICP"), findsOneWidget);
  });

  testWidgets('Display double with suffix', (WidgetTester tester) async {
    await tester.pumpWidget(Directionality(
      child: MediaQuery(
        data: MediaQueryData(),
        child: BalanceDisplayWidget(
          amount: ICP.fromString("1.23"),
          amountSize: 50,
          icpLabelSize: 9,
          amountLabelSuffix: " SUFFIX",
        ),
      ),
      textDirection: TextDirection.ltr,
    ));

    expect(find.text("1.23 SUFFIX"), findsOneWidget);
  });

  testWidgets('Display double without suffix', (WidgetTester tester) async {
    await tester.pumpWidget(Directionality(
      child: MediaQuery(
        data: MediaQueryData(),
        child: BalanceDisplayWidget(
          amount: ICP.fromString("1.23"),
          amountSize: 50,
          icpLabelSize: 9,
        ),
      ),
      textDirection: TextDirection.ltr,
    ));

    expect(find.text("1.23"), findsOneWidget);
  });
}
