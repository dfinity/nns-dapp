import 'package:nns_dapp/data/icp.dart';
import 'package:nns_dapp/ui/_components/confirm_dialog.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:universal_html/js.dart' as js;
import '../../../nns_dapp.dart';

class HardwareListNeurons extends StatefulWidget {
  final List<NeuronInfoForHW> neurons;

  HardwareListNeurons({Key? key, required this.neurons}) : super(key: key);

  @override
  _HardwareListNeurons createState() => _HardwareListNeurons();
}

class _HardwareListNeurons extends State<HardwareListNeurons> {
  @override
  Widget build(BuildContext context) {
    var neurons = widget.neurons.filter((n) => n.amount != ICP.zero).toList();

    return Column(
      children: [
        Expanded(
          child: Center(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  Padding(
                      padding: const EdgeInsets.only(
                          top: 10.0, left: 42.0, right: 42.0, bottom: 10.0),
                      child: showNeurons(neurons, context)),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget showNeurons(List<NeuronInfoForHW> neurons, BuildContext context) {
    if (neurons.isEmpty) {
      return Text("No neurons found.");
    }

    return Column(children: [
      Text(
          "The following are neurons controlled by the hardware wallet. You can optionally add the NNS dapp as a hotkey to these neurons, which allows you to manage the neurons directly from the Neurons tab."),
      TallFormDivider(),
      Table(
          defaultVerticalAlignment: TableCellVerticalAlignment.middle,
          children: [
                TableRow(children: [
                  Padding(
                      padding: const EdgeInsets.only(bottom: 5.0),
                      child: Text('Neuron ID',
                          style: TextStyle(fontFamily: Fonts.circularBold))),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 5.0),
                    child: Text('Stake Amount',
                        style: TextStyle(fontFamily: Fonts.circularBold)),
                  ),
                  Text("")
                ])
              ] +
              neurons
                  .map((neuron) => getNeuronWidget(neuron, context))
                  .toList()),
    ]);
  }

  TableRow getNeuronWidget(NeuronInfoForHW neuron, BuildContext context) {
    final principal = context.icApi.getPrincipal();
    return TableRow(children: [
      Padding(
        padding: const EdgeInsets.only(bottom: 7.0),
        child: Text(neuron.id.toString()),
      ),
      Padding(
        padding: const EdgeInsets.only(bottom: 7.0),
        child: Text("${neuron.amount.asString()} ICP"),
      ),
      if (!neuron.hotkeys.contains(principal))
        Padding(
            padding: const EdgeInsets.only(bottom: 7.0),
            child: ElevatedButton(
              onPressed: () {
                OverlayBaseWidget.show(
                    context,
                    ConfirmDialog(
                        title: "Confirm Addition of Hotkey",
                        description:
                            "This action will add your NNS dapp principal as a hotkey to neuron ${neuron.id.toString()}.\n\nYour NNS dapp principal is: ${principal}.\n\nAre you sure you want to continue?",
                        onConfirm: () async {
                          final res = await context.callUpdate(() =>
                              context.icApi.addHotkeyForHW(
                                  neuronId: neuron.id.asBigInt(),
                                  principal: context.icApi.getPrincipal()));

                          res.when(
                              ok: (unit) {
                                // Update the neuron's hotkeys and refresh the UI.
                                neuron.hotkeys.add(principal);
                                setState(() {});
                              },
                              err: (err) =>
                                  js.context.callMethod("alert", ["$err"]));
                        }));
              },
              child: Text("Add to NNS dapp"),
              style: ButtonStyle(
                  textStyle:
                      MaterialStateProperty.all(TextStyle(fontSize: 14.0))),
            ))
      else
        Padding(
            padding: const EdgeInsets.only(bottom: 9.0),
            child: Text(
              "Added to NNS dapp",
              textAlign: TextAlign.center,
            ))
    ]);
  }
}
