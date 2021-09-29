import 'package:nns_dapp/data/icp.dart';
import 'package:nns_dapp/ui/_components/confirm_dialog.dart';
import 'package:nns_dapp/ui/_components/constants.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';
import 'package:nns_dapp/ui/neurons/tab/neuron_row.dart';
import 'package:nns_dapp/ui/transaction/wallet/confirm_transactions_widget.dart';
import 'package:nns_dapp/ui/transaction/wallet/select_destination_wallet_page.dart';
import 'package:nns_dapp/ui/transaction/wallet/select_neuron_top_up_source_wallet_page.dart';
import 'package:nns_dapp/ui/transaction/wizard_overlay.dart';
import '../../../nns_dapp.dart';
import '../increase_dissolve_delay_widget.dart';
import 'package:universal_html/js.dart' as js;

GlobalKey _toolTipKey = GlobalKey();

class NeuronStateCard extends StatelessWidget {
  final Neuron neuron;

  const NeuronStateCard({Key? key, required this.neuron}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var buttonGroup = [
      // adds left-padding when non-mobile
      if (!Responsive.isMobile(context))
        Expanded(
          child: Container(),
        ),
      ElevatedButton(
          onPressed: () {
            OverlayBaseWidget.show(
              context,
              WizardOverlay(
                rootTitle: "Select Source Account",
                rootWidget: SelectNeuronTopUpSourceWallet(
                  neuron: neuron,
                ),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Text(
              "Increase Neuron Stake",
              style:
                  TextStyle(fontSize: Responsive.isMobile(context) ? 14 : 16),
            ),
          )),
      // adds left-padding when non-mobile
      // creates vertical or horizontal gap based on viewport size
      if (Responsive.isMobile(context))
        SizedBox(height: 8)
      else
        SizedBox(width: 8),
      ElevatedButton(
          onPressed: () {
            OverlayBaseWidget.show(
                context,
                WizardOverlay(
                    rootTitle: "Increase Dissolve Delay",
                    rootWidget: IncreaseDissolveDelayWidget(
                        neuron: neuron,
                        onCompleteAction: (context) {
                          OverlayBaseWidget.of(context)?.dismiss();
                        })));
          }.takeIf((e) => context.icApi.isNeuronControllable(neuron)),
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Text(
              "Increase Dissolve Delay",
              style:
                  TextStyle(fontSize: Responsive.isMobile(context) ? 14 : 16),
            ),
          )),
      // creates vertical or horizontal gap based on viewport size
      if (Responsive.isMobile(context))
        SizedBox(height: 8)
      else
        SizedBox(width: 8),
      buildStateButton(context),
    ];
    return Card(
      color: AppColors.mediumBackground,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            NeuronRow(neuron: neuron),
            RichText(
                text: TextSpan(style: context.textTheme.subtitle2, children: [
              TextSpan(
                  text: neuron.createdTimestampSeconds
                      .secondsToDateTime()
                      .dayFormat,
                  style: context.textTheme.subtitle2),
              TextSpan(text: " - Staked"),
            ])),
            if (neuron.dissolveDelaySeconds > SIX_MONTHS_IN_SECONDS)
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  RowBalanceDisplayWidget(
                    amount: neuron.votingPower,
                    amountDecimalPlaces: 2,
                    amountSize: Responsive.isMobile(context) ? 15 : 20,
                    icpLabelSize: 0,
                    text: Text("Voting Power :"),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(4.0),
                    child: GestureDetector(
                      onTap: () {
                        final dynamic _toolTip = _toolTipKey.currentState;
                        _toolTip.ensureTooltipVisible();
                      },
                      child: Tooltip(
                        key: _toolTipKey,
                        padding: EdgeInsets.all(16),
                        margin: Responsive.isMobile(context)
                            ? EdgeInsets.only(
                                left: MediaQuery.of(context).size.width * 0.35,
                                right: 50.0)
                            : Responsive.isTablet(context)
                                ? EdgeInsets.only(
                                    left: MediaQuery.of(context).size.width *
                                        0.25,
                                    right: 300.0)
                                : EdgeInsets.only(
                                    left: MediaQuery.of(context).size.width *
                                        0.35,
                                    right: 600.0),
                        textStyle: Responsive.isMobile(context)
                            ? context.textTheme.headline5
                            : context.textTheme.headline4,
                        message:
                            " Calculated as : \n ICP stake x Dissolve Delay Bonus x Age Bonus : \n"
                            " (${neuron.stake.asDouble().toStringAsFixed(3)}) x (${neuron.dissolveDelayMultiplier.toStringAsFixed(3)}) x (${neuron.ageBonusMultiplier.toStringAsFixed(3)})",
                        child: Icon(
                          Icons.info,
                          color: context.textTheme.bodyText1?.color,
                          size: Responsive.isMobile(context) ? 15 : 18,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            VerySmallFormDivider(),
            if (Responsive.isMobile(context))
              Center(
                child: Column(
                  children: buttonGroup,
                ),
              )
            else
              Row(children: buttonGroup),
          ],
        ),
      ),
    );
  }

  ElevatedButton buildStateButton(BuildContext context) {
    final icApi = context.icApi;
    switch (neuron.state) {
      case NeuronState.DISSOLVING:
        return ElevatedButton(
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Text(
                "Stop Dissolving",
                style:
                    TextStyle(fontSize: Responsive.isMobile(context) ? 14 : 16),
              ),
            ),
            style: ButtonStyle(
                backgroundColor: MaterialStateProperty.all(AppColors.blue600)),
            onPressed: () async {
              final res = await context
                  .callUpdate(() => icApi.stopDissolving(neuron: neuron));

              res.when(
                  ok: (unit) => {}, // Do nothing.
                  err: (err) => js.context.callMethod("alert", ["$err"]));
            }.takeIf((e) => icApi.isNeuronControllable(neuron)));
      case NeuronState.LOCKED:
        return ElevatedButton(
            style: ButtonStyle(
              backgroundColor: neuron.isCurrentUserController
                  ? MaterialStateProperty.all(AppColors.yellow500)
                  : null,
            ),
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Text(
                "Start Dissolving",
                style:
                    TextStyle(fontSize: Responsive.isMobile(context) ? 14 : 16),
              ),
            ),
            onPressed: () {
              OverlayBaseWidget.show(
                  context,
                  ConfirmDialog(
                    title: "Confirm Start Dissolving",
                    description:
                        "This will cause your neuron to lose its age bonus.\n"
                        "Are you sure you wish to continue?",
                    onConfirm: () async {
                      final res = await context.callUpdate(
                          () => icApi.startDissolving(neuron: neuron));

                      res.when(
                          ok: (unit) => {}, // Do nothing.
                          err: (err) =>
                              js.context.callMethod("alert", ["$err"]));
                    },
                  ));
            }.takeIf((e) => icApi.isNeuronControllable(neuron)));
      case NeuronState.UNLOCKED:
        final disburseEnabled = icApi.isNeuronControllable(neuron);
        return ElevatedButton(
            style: ButtonStyle(
              backgroundColor: MaterialStateProperty.all(
                  disburseEnabled ? AppColors.yellow500 : AppColors.gray400),
            ),
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Text(
                "Disburse",
                style:
                    TextStyle(fontSize: Responsive.isMobile(context) ? 14 : 16),
              ),
            ),
            onPressed: () {
              if (neuron.controller != icApi.getPrincipal()) {
                // This is a disburse for a HW wallet account.
                // Currently, disbursing is only supported to the neuron's controller.
                // TODO(EXC-452): Remove this restriction once NNS1-680 is deployed.
                OverlayBaseWidget.show(
                    context,
                    WizardOverlay(
                        rootTitle: "Review Transaction",
                        rootWidget: ConfirmTransactionWidget(
                            // if we're disbursing, no fee?
                            fee: ICP.zero,
                            amount: this.neuron.stake,
                            source: this.neuron,
                            destination:
                                "Self (${icApi.principalToAccountIdentifier(neuron.controller)}")));
              } else {
                OverlayBaseWidget.show(
                    context,
                    WizardOverlay(
                      rootTitle: 'Disburse Neuron',
                      rootWidget: SelectDestinationAccountPage(
                        source: neuron,
                      ),
                    ));
              }
            }.takeIf((e) => disburseEnabled));
      case NeuronState.UNSPECIFIED:
        return ElevatedButton(child: Text(""), onPressed: () {});
    }
  }
}
