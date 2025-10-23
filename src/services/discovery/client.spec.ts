// @vitest-environment happy-dom

import { createClient, createRouterTransport } from '@connectrpc/connect';
import { create } from '@bufbuild/protobuf';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiscoveryService } from '../../gen/service/discovery/v1/discovery_pb';
import { DiscoverResourcesResponseSchema } from '../../gen/service/discovery/v1/discovery_pb';
import { RobotClient } from '../../robot';
import { DiscoveryClient } from './client';
import { ComponentConfigSchema } from '../../gen/app/v1/robot_pb';
import type { ComponentConfig } from '../../gen/app/v1/robot_pb';
vi.mock('../../robot');
vi.mock('../../gen/service/discovery/v1/discovery_pb_service');

const discoveryClientName = 'test-discovery';

let discovery: DiscoveryClient;

const discoveries: ComponentConfig = create(ComponentConfigSchema);

describe('DiscoveryClient Tests', () => {
  beforeEach(() => {
    const mockTransport = createRouterTransport(({ service }) => {
      service(DiscoveryService, {
        discoverResources: () =>
          create(DiscoverResourcesResponseSchema, { discoveries: [discoveries] }),
      });
    });

    RobotClient.prototype.createServiceClient = vi
      .fn()
      .mockImplementation(() => createClient(DiscoveryService, mockTransport));
    discovery = new DiscoveryClient(
      new RobotClient('host'),
      discoveryClientName
    );
  });

  describe('Discovery Resources Tests', () => {
    it('returns resources from a machine', async () => {
      const expected = [discoveries];

      await expect(discovery.discoverResources()).resolves.toStrictEqual(
        expected
      );
    });
  });
});
