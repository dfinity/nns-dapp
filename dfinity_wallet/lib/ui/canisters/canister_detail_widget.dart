import 'package:dfinity_wallet/ui/_components/constrain_width_and_center.dart';
import 'package:dfinity_wallet/ui/_components/footer_gradient_button.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/canisters/select_cycles_origin_widget.dart';
import 'package:dfinity_wallet/ui/canisters/top_up_cycles_amount_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';
import 'package:intl/intl.dart';

import '../../dfinity.dart';
import 'change_canister_controller_widget.dart';

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
                final canister =
                    context.boxes.canisters.get(widget.canister.identifier)!;
                return FooterGradientButton(
                    footerHeight: null,
                    body: SingleChildScrollView(
                      child: ConstrainWidthAndCenter(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          mainAxisAlignment: MainAxisAlignment.start,
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
                                            canister.name,
                                            style: context.textTheme.headline1,
                                          ),
                                          SizedBox(
                                            height: 10,
                                          ),
                                          SelectableText(
                                            canister.identifier,
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
                                              canister.cyclesRemaining.toDisplayICPT,
                                              style: TextStyle(
                                                  color: AppColors.white,
                                                  fontFamily:
                                                      Fonts.circularBold,
                                                  fontSize: 50),
                                            ),
                                            SizedBox(
                                              width: 7,
                                            ),
                                            Text("T Cycles",
                                                style: TextStyle(
                                                    color: AppColors.gray200,
                                                    fontFamily:
                                                        Fonts.circularBook,
                                                    fontSize: 50 * 0.4))
                                          ],
                                        ),
                                      )),
                                ]),
                            Card(
                                child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Padding(
                                    padding: const EdgeInsets.all(8.0),
                                    child: Text(
                                      "Controller",
                                      style: context.textTheme.headline3,
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.all(8.0),
                                    child: Text(canister.controller),
                                  ),
                                  // if (context.boxes.accounts.values.any(
                                  //     (element) =>
                                  //         element.identifier ==
                                  //         widget.canister.controller))
                                  Align(
                                    alignment: Alignment.bottomRight,
                                    child: ElevatedButton(
                                        onPressed: () {
                                          OverlayBaseWidget.show(
                                              context,
                                              ChangeCanisterControllerWidget(
                                                canister: canister,
                                              ));
                                        },
                                        child: Padding(
                                          padding: const EdgeInsets.all(8.0),
                                          child: Text("Change Controller"),
                                        )),
                                  )
                                ],
                              ),
                            ))
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
                                    WizardOverlay(
                                        rootTitle: "Top Up Canister",
                                        rootWidget: SelectCyclesOriginWidget(
                                          onSelected: (account, context) {
                                            WizardOverlay.of(context).pushPage(
                                                "Enter ICP Amount",
                                                TopUpCyclesAmountWidget(
                                                    origin: account,
                                                    destinationCanister:
                                                        canister));
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
