import { type JsonValue, create, fromJson } from '@bufbuild/protobuf';
import { StructSchema } from '@bufbuild/protobuf/wkt';
import type { Struct } from '@bufbuild/protobuf/wkt';
import type { CallOptions, Client } from '@connectrpc/connect';
import { BaseService } from '../../gen/component/base/v1/base_pb';

import {
  GetPropertiesRequestSchema,
  IsMovingRequestSchema,
  MoveStraightRequestSchema,
  SetPowerRequestSchema,
  SetVelocityRequestSchema,
  SpinRequestSchema,
  StopRequestSchema,
} from '../../gen/component/base/v1/base_pb';

import type { RobotClient } from '../../robot';
import type { Options, Vector3 } from '../../types';
import { doCommandFromClient } from '../../utils';
import type { Base } from './base';
import { GetGeometriesRequestSchema } from '../../gen/common/v1/common_pb';

/**
 * A gRPC-web client for the Base component.
 *
 * @group Clients
 */
export class BaseClient implements Base {
  private client: Client<typeof BaseService>;
  public readonly name: string;
  private readonly options: Options;
  public callOptions: CallOptions = { headers: {} as Record<string, string> };

  constructor(client: RobotClient, name: string, options: Options = {}) {
    this.client = client.createServiceClient(BaseService);
    this.name = name;
    this.options = options;
  }

  async getGeometries(extra = {}, callOptions = this.callOptions) {
    const request = create(GetGeometriesRequestSchema, {
      name: this.name,
      extra: fromJson(StructSchema, extra),
    });

    const response = await this.client.getGeometries(request, callOptions);
    return response.geometries;
  }

  async moveStraight(
    distanceMm: number,
    mmPerSec: number,
    extra = {},
    callOptions = this.callOptions
  ) {
    const request = create(MoveStraightRequestSchema, {
      name: this.name,
      mmPerSec,
      distanceMm: distanceMm ? BigInt(distanceMm) : undefined,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    await this.client.moveStraight(request, callOptions);
  }

  async spin(
    angleDeg: number,
    degsPerSec: number,
    extra = {},
    callOptions = this.callOptions
  ) {
    const request = create(SpinRequestSchema, {
      name: this.name,
      angleDeg,
      degsPerSec,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    await this.client.spin(request, callOptions);
  }

  async setPower(
    linear: Vector3,
    angular: Vector3,
    extra = {},
    callOptions = this.callOptions
  ) {
    const request = create(SetPowerRequestSchema, {
      name: this.name,
      linear,
      angular,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    await this.client.setPower(request, callOptions);
  }

  async setVelocity(
    linear: Vector3,
    angular: Vector3,
    extra = {},
    callOptions = this.callOptions
  ) {
    const request = create(SetVelocityRequestSchema, {
      name: this.name,
      linear,
      angular,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    await this.client.setVelocity(request, callOptions);
  }

  async stop(extra = {}, callOptions = this.callOptions) {
    const request = create(StopRequestSchema, {
      name: this.name,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    await this.client.stop(request, callOptions);
  }

  async isMoving(callOptions = this.callOptions) {
    const request = create(IsMovingRequestSchema, {
      name: this.name,
    });

    this.options.requestLogger?.(request);

    const resp = await this.client.isMoving(request, callOptions);
    return resp.isMoving;
  }

  async doCommand(
    command: Struct,
    callOptions = this.callOptions
  ): Promise<JsonValue> {
    return doCommandFromClient(
      this.client.doCommand,
      this.name,
      command,
      this.options,
      callOptions
    );
  }

  async getProperties(extra = {}, callOptions = this.callOptions) {
    const request = create(GetPropertiesRequestSchema, {
      name: this.name,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    return this.client.getProperties(request, callOptions);
  }
}
