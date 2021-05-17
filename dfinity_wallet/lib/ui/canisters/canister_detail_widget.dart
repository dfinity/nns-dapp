import 'package:dfinity_wallet/ui/_components/confirm_dialog.dart';
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
  void didChangeDependencies() {
    super.didChangeDependencies();
    context.icApi.getCanister(widget.canister.identifier);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Canister"),
        backgroundColor: AppColors.background,
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: TextButton(
                onPressed: () {
                  OverlayBaseWidget.show(
                      context, ConfirmDialog(
                    title: 'Confirm Detach',
                    description: "This will remove the canister from your account, it does not change the controller.\n\If you control the canister, ensure you have it's identifier stored securely",
                    onConfirm: () async {
                      await context.callUpdate(() => context.icApi.detachCanister(widget.canister.identifier));
                      context.nav.replace(CanistersTabPage);
                    },
                  ));
                },
                child: Text(
                  "Detach",
                  style: context.textTheme.subtitle2,
                )),
          )
        ],
      ),
      body: Container(
          color: AppColors.lightBackground,
          child: StreamBuilder<Object>(
              stream: context.icApi.hiveBoxes.canisters.changes,
              builder: (context, snapshot) {
                final canister =
                    context.boxes.canisters[widget.canister.identifier]!;
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
                                            "Id: ${canister.identifier}",
                                            style: context.textTheme.subtitle2,
                                          )
                                        ],
                                      ),
                                    ),
                                  ),
                                ]),
                            if (canister.userIsController == null)
                              Card(
                                child: Center(
                                  child: Padding(
                                    padding: const EdgeInsets.all(16.0),
                                    child: Text("Fetching canister details"),
                                  ),
                                ),
                              ),
                            if (canister.userIsController == false)
                              Card(
                                child: Center(
                                  child: Padding(
                                    padding: const EdgeInsets.all(16.0),
                                    child: Text(
                                        "You are not the controller of this canister and cannot access it's details"),
                                  ),
                                ),
                              ),
                            if (canister.userIsController == true)
                              Card(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Padding(
                                      padding: const EdgeInsets.only(
                                          top: 24.0, left: 24),
                                      child: Text(
                                        "Cycles",
                                        style: context.textTheme.headline3,
                                      ),
                                    ),
                                    Center(
                                      child: Padding(
                                        padding: const EdgeInsets.all(24.0),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Text(
                                              canister.cyclesBalance?.toBigInt
                                                      .toString() ??
                                                  "-",
                                              style: TextStyle(
                                                  color: AppColors.white,
                                                  fontFamily:
                                                      Fonts.circularBold,
                                                  fontSize: 30),
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
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            if (canister.userIsController == true)
                              buildControllerCard(context, canister),
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
                                                    source: account,
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

  Card buildControllerCard(BuildContext context, Canister canister) {
    return Card(
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
            child: SelectableText(
              canister.controller ?? "",
              style: context.textTheme.subtitle2,
            ),
          ),
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
    ));
  }
}
