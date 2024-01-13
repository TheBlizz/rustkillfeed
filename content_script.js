// URL del webhook de Discord
const webhookUrl = 'https://discord.com/api/webhooks/1195592349590491176/0Gyp1qC9Izp8gKZoAOYT2Fx0NIPutp1aS6bKfQ4qJqiB6QuJBSRBzaud7kKWixj2AgkO';

let observer = null;

function sendCommandToConsole(message) {
  const textField = document.querySelector('#text-input__console-input-message');
  const sendButton = document.querySelector('#app > div:nth-child(2) > section > div.tw-px-4.tw-pb-10 > div > div > div.tw-relative > div > div.tw-flex.tw-max-h-max.tw-flex-col.tw-gap-6.tw-rounded-b-3xl.tw-px-8.md\\:tw-pl-20.md\\:tw-pr-12.tw-mb-6 > div:nth-child(2) > div.tw-flex.tw-flex-col.tw-gap-4.sm\\:tw-flex-row > div:nth-child(2) > button');
  
  if (textField && sendButton) {
    textField.value = message;
    var inputEvent = new Event('input', { bubbles: true });
    textField.dispatchEvent(inputEvent);
    setTimeout(() => {
      sendButton.click();
    }, 100);
    console.log('Command sent to the console:', message);
  } else {
    console.error('Console elements not found.');
  }
}

function sendToDiscord(textContent) {
  if (textContent.includes("was killed")) {
    const lastColonIndex = textContent.lastIndexOf(':');
    let messageToSend = textContent.slice(lastColonIndex + 1).trim();

    // Cambiar nombre si es numérico
    let parts = messageToSend.split(" was killed by ");
    if (parts.length === 2) {
      parts = parts.map(part => /^\d+$/.test(part.trim()) ? "Scientist" : part);
      messageToSend = `**${parts[0]} was killed by ${parts[1]}** 💀`;
    }

    const content = messageToSend.slice(0, 2000);
    const payload = { content: content };
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => console.log('Message sent to Discord:', data))
    .catch(error => console.error('Error sending message to Discord:', error));

    // Enviar mensaje a la consola
    let consoleMessage = `say "<b><color=#FF0000>${parts[0]}</color> <b><color=#FFFFFF>eliminated by</color></b> <b><color=#00FF00>${parts[1]}</color></b>"`;
    sendCommandToConsole(consoleMessage);
  } else {
    console.log('Text ignored, does not contain "was killed".');
  }
  // Lógica para eventos específicos
  const eventMappings = [
    { trigger: "assets/prefabs/npc/cargo plane/cargo_plane.prefab", message: "EVENT: AIRDROP INCOMING" },
    { trigger: "assets/content/vehicles/boats/cargoship/cargoshipdynamic2.prefab", message: "EVENT: CARGO SHIP APPROACHING" },
    { trigger: "assets/prefabs/npc/ch47/ch47scientists.entity.prefab", message: "EVENT: CARGO HELICOPTER IN THE AIR" },
    { trigger: "assets/prefabs/npc/patrol helicopter/patrolhelicopter.prefab", message: "EVENTO: PATROL HELICOPTER INCOMING" }
  ];

  eventMappings.forEach(event => {
    if (textContent.includes(event.trigger)) {
      let consoleMessage = `say "<b><color=#FF0000>${event.message}</color></b>"`;
      sendCommandToConsole(consoleMessage);
    }
  });
}

function startObserving() {
  const consoleContainer = document.querySelector('#app > div:nth-child(2) > section > div.tw-px-4.tw-pb-10 > div > div > div.tw-relative > div > div.tw-flex.tw-max-h-max.tw-flex-col.tw-gap-6.tw-rounded-b-3xl.tw-px-8.md\\:tw-pl-20.md\\:tw-pr-12.tw-mb-6 > div.tw-h-\\[28rem\\].tw-overflow-auto.tw-rounded-md.tw-bg-gp-midnight-1.tw-p-4.tw-shadow-3xl');
  if (!consoleContainer) {
    console.error('Console container not found.');
    return;
  }
  if (observer) observer.disconnect();
  observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE && node.innerText) {
          sendToDiscord(node.innerText);
        }
      });
    });
  });
  observer.observe(consoleContainer, { childList: true });
  console.log('Console observation started.');
}

function stopObserving() {
  if (observer) {
    observer.disconnect();
    observer = null;
    console.log('Console observation stopped.');
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'start_observing') {
    startObserving();
    sendResponse({status: 'Observing started'});
    alert('Observation started.'); // Muestra un mensaje de confirmación
  } else if (request.message === 'stop_observing') {
    stopObserving();
    sendResponse({status: 'Observing stopped'});
    alert('Close observation.'); // Muestra un mensaje de confirmación
  } else {
    sendResponse({status: 'No action taken'});
  }
});
