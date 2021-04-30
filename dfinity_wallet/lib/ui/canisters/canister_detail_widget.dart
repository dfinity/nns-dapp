import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/canisters/select_cycles_origin_widget.dart';
import 'package:dfinity_wallet/ui/canisters/top_up_cycles_amount_widget.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';
import 'package:intl/intl.dart';

import '../../dfinity.dart';

class CanisterDetailWidget extends StatefulWidget {
  final Canister canister;

  const CanisterDetailWidget(this.canister, {Key? key}) : super(key: key);

  @override
  _CanisterDetailWidgetState createState() => _CanisterDetailWidgetState();
}

class _CanisterDetailWidgetState extends State<CanisterDetailWidget> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Canister"),
        backgroundColor: AppColors.background,
      ),
      body: Container(
          color: AppColors.lightBackground,
          child: StreamBuilder<Object>(
              stream: context.icApi.hiveBoxes.canisters
                  .watch(key: widget.canister.identifier),
              builder: (context, snapshot) {
                return FooterGradientButton(
                  footerHeight: null,
                  body: SingleChildScrollView(
                      child: ConstrainWidthAndCenter(
                        child: Column(
                          children: [
                            Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Padding(
                                      padding: const EdgeInsets.all(24.0),
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            widget.canister.name,
                                            style: context.textTheme.headline1,
                                          ),
                                          SizedBox(
                                            height: 10,
                                          ),
                                          SelectableText(
                                            widget.canister.identifier,
                                            style: context.textTheme.subtitle2,
                                          )
                                        ],
                                      ),
                                    ),
                                  ),
                                  Padding(
                                      padding: EdgeInsets.all(24),
                                      child: Padding(
                                        padding: const EdgeInsets.all(24.0),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.end,
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Text(
                                              NumberFormat("###,###.########",
                                                      "en_US")
                                                  .format(widget.canister
                                                      .cyclesRemaining),
                                              style: TextStyle(
                                                  color: AppColors.white,
                                                  fontFamily:
                                                      Fonts.circularBold,
                                                  fontSize: 50),
                                            ),
                                            SizedBox(
                                              width: 7,
                                            ),
                                            Text("Cycles",
                                                style: TextStyle(
                                                    color: AppColors.gray200,
                                                    fontFamily:
                                                        Fonts.circularBook,
                                                    fontSize: 50 * 0.4))
                                          ],
                                        ),
                                      ))
                                ]),
                            SizedBox(
                              height: 200,
                            )
                          ],
                        ),
                      ),
                    ),
                    footer: Align(
                      alignment: Alignment.bottomCenter,
                      child: IntrinsicHeight(
                        child: Padding(
                          padding: const EdgeInsets.all(32.0),
                          child: ElevatedButton(
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: SizedBox(
                                  width: 400,
                                  child: Center(
                                    child: Text(
                                      "Add Cycles",
                                      style: context.textTheme.button
                                          ?.copyWith(fontSize: 24),
                                    ),
                                  ),
                                ),
                              ),
                              onPressed: () {
                                OverlayBaseWidget.show(
                                    context,
                                    NewTransactionOverlay(
                                        rootTitle: "Top Up Canister",
                                        rootWidget: SelectCyclesOriginWidget(
                                          onSelected: (account, context) {
                                            NewTransactionOverlay.of(context)
                                                .pushPage(
                                                    "Enter ICP Amount",
                                                    TopUpCyclesAmountWidget(
                                                        origin: account,
                                                        destinationCanister:
                                                            widget.canister));
                                          },
                                        )));
                              }),
                        ),
                      ),
                    ));
              })),
    );
  }
}
