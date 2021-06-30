import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:dfinity_wallet/ui/neurons/tab/neuron_row.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';
import 'package:dfinity_wallet/ui/transaction/wallet/select_destination_wallet_page.dart';

import '../../../dfinity.dart';
import '../increase_dissolve_delay_widget.dart';

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
                    rootTitle: "Increase Dissolve Delay",
                    rootWidget: IncreaseDissolveDelayWidget(
                        neuron: neuron,
                        onCompleteAction: (context) {
                          OverlayBaseWidget.of(context)?.dismiss();
                        })));
          }.takeIf((e) => neuron.isCurrentUserController),
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Text(
              "Increase Dissolve Delay",
              textScaleFactor: Responsive.isMobile(context) ? 0.75 : 1,
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
    switch (neuron.state) {
      case NeuronState.DISSOLVING:
        return ElevatedButton(
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Text("Lockup",
                  textScaleFactor: Responsive.isDesktop(context) ? 1 : 0.75),
            ),
            style: ButtonStyle(
                backgroundColor: MaterialStateProperty.all(AppColors.blue600)),
            onPressed: () async {
              context.callUpdate(() =>
                  context.icApi.stopDissolving(neuronId: neuron.id.toBigInt));
            }.takeIf((e) => neuron.isCurrentUserController));
      case NeuronState.LOCKED:
        return ElevatedButton(
            style: ButtonStyle(
              backgroundColor: neuron.isCurrentUserController
                  ? MaterialStateProperty.all(AppColors.yellow500)
                  : null,
            ),
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Text("Start Unlock",
                  textScaleFactor: Responsive.isDesktop(context) ? 1 : 0.75),
            ),
            onPressed: () {
              context.callUpdate(() =>
                  context.icApi.startDissolving(neuronId: neuron.id.toBigInt));
            }.takeIf((e) => neuron.isCurrentUserController));
      case NeuronState.UNLOCKED:
        return ElevatedButton(
            style: ButtonStyle(
              backgroundColor: MaterialStateProperty.all(AppColors.yellow500),
            ),
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Text("Disburse",
                  textScaleFactor: Responsive.isDesktop(context) ? 1 : 0.75),
            ),
            onPressed: () {
              OverlayBaseWidget.show(
                  context,
                  WizardOverlay(
                    rootTitle: 'Disburse Neuron',
                    rootWidget: SelectDestinationAccountPage(
                      source: neuron,
                    ),
                  ));
            }.takeIf((e) => neuron.isCurrentUserController));
      case NeuronState.UNSPECIFIED:
        return ElevatedButton(child: Text(""), onPressed: () {});
    }
  }
}
