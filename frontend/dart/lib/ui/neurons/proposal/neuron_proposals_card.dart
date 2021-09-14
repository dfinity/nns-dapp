import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';

import '../../../nns_dapp.dart';

class NeuronProposalsCard extends StatelessWidget {
  final Neuron neuron;

  const NeuronProposalsCard({Key? key, required this.neuron}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text("Proposals",
                      style: Responsive.isMobile(context)
                          ? context.textTheme.headline6
                          : context.textTheme.headline3),
                ),
              ],
            ),
            ...neuron.proposals.map((e) => Container(
                  padding: EdgeInsets.all(8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        e.summary.toString(),
                        style: context.textTheme.headline4,
                      ),
                      Text(e.url, style: context.textTheme.bodyText1),
                    ],
                  ),
                )),
            SmallFormDivider(),
            Align(
              alignment: Alignment.bottomRight,
              child: ElevatedButton(
                  onPressed: () async {
                    await context.performLoading(() => context.icApi
                        .makeDummyProposals(neuronId: neuron.id.toBigInt));
                  },
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Text(
                      "Make Dummy Proposals",
                      style: TextStyle(
                          fontSize: Responsive.isMobile(context) ? 14 : 16),
                    ),
                  )),
            )
          ],
        ),
      ),
    );
  }
}
