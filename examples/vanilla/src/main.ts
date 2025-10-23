import * as VIAM from '@viamrobotics/sdk';

const HOST = import.meta.env.VITE_HOST;
const API_KEY_ID = import.meta.env.VITE_API_KEY_ID;
const API_KEY = import.meta.env.VITE_API_KEY;

const connectionStatusEl = <HTMLElement>(
  document.getElementById('connection-status')
);
const connectEl = <HTMLButtonElement>document.getElementById('connect');
const disconnectEl = <HTMLButtonElement>document.getElementById('disconnect');
const resourcesEl = <HTMLButtonElement>document.getElementById('resources');

let machine: VIAM.RobotClient | undefined = undefined;
const reconnectAbortSignal = { abort: false };

const handleConnectionStateChange = (event: unknown) => {
  updateConnectionStatus(
    (event as { eventType: VIAM.MachineConnectionEvent }).eventType
  );
};

const updateConnectionStatus = (eventType: VIAM.MachineConnectionEvent) => {
  switch (eventType) {
    case VIAM.MachineConnectionEvent.CONNECTING:
      connectionStatusEl.textContent = 'Connecting...';
      break;
    case VIAM.MachineConnectionEvent.CONNECTED:
      connectionStatusEl.textContent = 'Connected';
      break;
    case VIAM.MachineConnectionEvent.DISCONNECTING:
      connectionStatusEl.textContent = 'Disconnecting...';
      break;
    case VIAM.MachineConnectionEvent.DISCONNECTED:
      connectionStatusEl.textContent = 'Disconnected';
      break;
  }
};

const connect = async () => {
  const v = await VIAM.createViamClient({
    credentials: {
      type: 'api-key',
      payload: API_KEY,
      authEntity: API_KEY_ID,
    },
  });
  const x = new TextEncoder().encode(JSON.stringify({ a: 1 }));
  const fileId = await v.dataClient.fileUpload(
    x,
    'dd772657-5fdd-4f9c-9df1-3474508ab9f5',
    {
      fileName: 'naveedtest',
      fileExtension: '.json',
      tags: ['naveed-test'],
    }
  );
  console.log(`uploaded: ${fileId}`);

  if (machine) {
    await machine.connect();
    return;
  }

  reconnectAbortSignal.abort = false;
  updateConnectionStatus(VIAM.MachineConnectionEvent.CONNECTING);

  try {
    console.log(HOST, API_KEY, API_KEY_ID);
    machine = await VIAM.createRobotClient({
      host: HOST,
      credentials: {
        type: 'api-key',
        payload: API_KEY,
        authEntity: API_KEY_ID,
      },
      signalingAddress: 'https://app.viam.com:443',
      reconnectAbortSignal,
    });
    updateConnectionStatus(VIAM.MachineConnectionEvent.CONNECTED);
    machine.on('connectionstatechange', handleConnectionStateChange);
  } catch {
    updateConnectionStatus(VIAM.MachineConnectionEvent.DISCONNECTED);
  }
};

const disconnect = async () => {
  // If currently establishing initial connection, abort.
  reconnectAbortSignal.abort = true;

  if (!machine) {
    return;
  }

  await machine.disconnect();
};

const logResources = async () => {
  console.log(
    machine?.isConnected() ? await machine.resourceNames() : 'Not connected'
  );
};

async function main() {
  updateConnectionStatus(VIAM.MachineConnectionEvent.DISCONNECTED);

  connectEl.addEventListener('click', async () => {
    await connect();
  });
  disconnectEl.addEventListener('click', async () => {
    await disconnect();
  });
  resourcesEl.addEventListener('click', async () => {
    await logResources();
  });
}

main();
