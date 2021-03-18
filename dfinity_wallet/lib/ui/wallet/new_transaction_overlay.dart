import '../../dfinity.dart';

class NewTransactionOverlay extends StatefulWidget {
  @override
  _NewTransactionOverlayState createState() => _NewTransactionOverlayState();
}

class _NewTransactionOverlayState extends State<NewTransactionOverlay> {
  @override
  Widget build(BuildContext context) {
    return Card(
      color: AppColors.background,
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            ListTile(
              title: Text("Where would you like to send the ICP?", style: context.textTheme.headline3,),
            ),
            ListTile(
              title: Text("Canister", style: context.textTheme.bodyText2,),
            ),
            ListTile(
              title: Text("Wallet", style: context.textTheme.bodyText2,),
            ),
            ListTile(
              title: Text("Neuron", style: context.textTheme.bodyText2,),
            )
          ],
        ),
      ),
    );
  }
}



