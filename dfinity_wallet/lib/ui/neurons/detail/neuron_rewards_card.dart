import 'package:dfinity_wallet/ui/_components/confirm_dialog.dart';
import 'package:dfinity_wallet/ui/_components/overlay_base_widget.dart';
import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:dfinity_wallet/ui/wallet/percentage_display_widget.dart';
import '../../../dfinity.dart';

class NeuronRewardsCard extends StatelessWidget {
  final Neuron neuron;

  const NeuronRewardsCard({Key? key, required this.neuron}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final myLocale = Localizations.localeOf(context);
    return Card(
      color: AppColors.background,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            "Maturity",
                            style: context.textTheme.headline3?.copyWith(
                                fontSize: Responsive.isMobile(context)
                                    ? 16
                                    : context.textTheme.headline3?.fontSize),
                          ),
                          Tooltip(
                            padding: const EdgeInsets.all(16.0),
                            textStyle: context.textTheme.headline3?.copyWith(
                                fontSize: Responsive.isMobile(context)
                                    ? 16
                                    : context.textTheme.headline3?.fontSize),
                            message:
                                "When your neuron votes, its maturity increases. This allows you to spawn a new neuron containing newly minted ICP. Increases in maturity can occur up to 3 days after voting took place.",
                            child: Icon(
                              Icons.info,
                              color: context.textTheme.bodyText1?.color,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                SizedBox(
                  width: 24,
                ),
                IntrinsicHeight(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      NeuronRewardDisplayWidget(
                          neuron: neuron, myLocale: myLocale),
                      Expanded(
                          child: ConstrainedBox(
                              constraints: BoxConstraints(minHeight: 40),
                              child: Container())),
                      Align(
                        alignment: Alignment.bottomRight,
                        child: ElevatedButton(
                            onPressed: () {
                              OverlayBaseWidget.show(
                                  context,
                                  ConfirmDialog(
                                    title: "Really Spawn Neuron",
                                    description:
                                        "Are you sure you wish to spawn a new neuron?",
                                    onConfirm: () async {
                                      context.callUpdate(() async {
                                        final newNeuron = await context.icApi
                                            .spawnNeuron(
                                                neuronId:
                                                    neuron.identifier.toBigInt);
                                        context.nav.push(
                                            NeuronPageDef.createPageConfig(
                                                newNeuron));
                                      });
                                    },
                                  ));
                            }.takeIf((e) =>
                                neuron.maturityICPEquivalent.asE8s() >
                                    BigInt.from(E8S_PER_ICP) &&
                                neuron.isCurrentUserController),
                            child: Padding(
                              padding: const EdgeInsets.all(12.0),
                              child: Text(
                                "Spawn Neuron",
                                textScaleFactor:
                                    Responsive.isDesktop(context) ? 1 : 0.75,
                              ),
                            )),
                      )
                    ],
                  ),
                )
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class NeuronRewardDisplayWidget extends StatefulWidget {
  const NeuronRewardDisplayWidget({
    Key? key,
    required this.neuron,
    required this.myLocale,
  }) : super(key: key);

  final Neuron neuron;
  final Locale myLocale;

  @override
  _NeuronRewardDisplayWidgetState createState() =>
      _NeuronRewardDisplayWidgetState();
}

enum MaturityViewMode { PERCENTAGE, INT }

class _NeuronRewardDisplayWidgetState extends State<NeuronRewardDisplayWidget> {
  bool showIntMode = false;
  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Row(
          children: [
            Text("Percentage"),
            Switch(value: showIntMode, onChanged: onChanged,activeColor: AppColors.white,),
            Text("ICP"),
          ],
        ),
        if (showIntMode)
          Text(
            widget.neuron.maturityICPEquivalent.asDouble().toString(),
            style: TextStyle(
              color: AppColors.white,
              fontFamily: Fonts.circularBold,
              fontSize: 30,
            ),
          )
        else
          PercentageDisplayWidget(
            amount: widget.neuron.stake.asE8s() > BigInt.zero
                ? (100 *
                    (widget.neuron.maturityICPEquivalent.asE8s() /
                        widget.neuron.stake.asE8s()))
                : 0,
            amountSize: 30,
            locale: widget.myLocale.languageCode,
          ),
      ],
    );
  }

  void onChanged(bool value) {
    setState(() {
      showIntMode = value;
    });
  }
}
