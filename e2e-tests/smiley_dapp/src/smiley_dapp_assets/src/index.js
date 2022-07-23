import { smiley_dapp } from "../../declarations/smiley_dapp";


let updates=true;

async function subscribeToUpdates() {
  // Interact backend  actor, calling the get params method
  const bgcolor = await smiley_dapp.getBackgroundColor();
  const smileyChar = await smiley_dapp.getSmileyChar();

  document.body.style.backgroundColor = bgcolor;
  document.getElementById("icon").innerHTML = "&#x" + smileyChar;

  // Call subscribe() again to get the next message
  if(updates) {
    await subscribeToUpdates();
  }
}

subscribeToUpdates();

document.addEventListener('visibilitychange', function (event) {
    if (document.hidden) {
        updates = false;
    } else {
	if(updates==false) {
	  updates = true;
          subscribeToUpdates();
        }
    }
});
