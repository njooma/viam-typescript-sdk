import {
  BaseClient,
  StreamClient,
  createRobotClient,
  createViamClient,
  type AccessToken,
  type Credential,
  type Credentials,
  type RobotClient,
  type ViamClient,
} from '@viamrobotics/sdk';

/**
 * Given a set of credentials, get a robot client.
 *
 * @param credentials Robot URL and location secret
 * @returns A connected client
 */
export const getRobotClient = async (
  hostname: string,
  credentials: Credential | AccessToken
): Promise<RobotClient> => {
  return createRobotClient({
    host: hostname,
    credentials,
    signalingAddress: 'https://app.viam.com:443',
    iceServers: [{ urls: 'stun:global.stun.twilio.com:3478' }],
  });
};

/**
 * Given a set of app credentials, get a viam client.
 *
 * @param credentials To connect to app.viam.com
 * @returns A viam client
 */
export const getViamClient = async (
  credentials: Credentials
): Promise<ViamClient> => {
  return createViamClient({
    credentials,
  });
};

/**
 * StreamClient factory
 *
 * @param client A connected RobotClient
 * @returns A connected stream client
 */
export const getStreamClient = (client: RobotClient): StreamClient => {
  return new StreamClient(client);
};

/**
 * BaseClient factory
 *
 * @param client A connected RobotClient
 * @returns A connected base client
 */
export const getBaseClient = (client: RobotClient): BaseClient => {
  return new BaseClient(client, 'viam_base');
};
