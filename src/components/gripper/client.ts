import { type JsonValue, create, fromJson } from '@bufbuild/protobuf';
import { StructSchema } from '@bufbuild/protobuf/wkt';
import type { Struct } from '@bufbuild/protobuf/wkt';
import type { CallOptions, Client } from '@connectrpc/connect';
import { GripperService } from '../../gen/component/gripper/v1/gripper_pb';

import {
  GrabRequestSchema,
  IsMovingRequestSchema,
  OpenRequestSchema,
  StopRequestSchema,
} from '../../gen/component/gripper/v1/gripper_pb';

import type { RobotClient } from '../../robot';
import type { Options } from '../../types';
import { doCommandFromClient } from '../../utils';
import type { Gripper } from './gripper';
import { GetGeometriesRequestSchema } from '../../gen/common/v1/common_pb';

/**
 * A gRPC-web client for the Gripper component.
 *
 * @group Clients
 */
export class GripperClient implements Gripper {
  private client: Client<typeof GripperService>;
  public readonly name: string;
  private readonly options: Options;
  public callOptions: CallOptions = { headers: {} as Record<string, string> };

  constructor(client: RobotClient, name: string, options: Options = {}) {
    this.client = client.createServiceClient(GripperService);
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

  async open(extra = {}, callOptions = this.callOptions) {
    const request = create(OpenRequestSchema, {
      name: this.name,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    await this.client.open(request, callOptions);
  }

  async grab(extra = {}, callOptions = this.callOptions) {
    const request = create(GrabRequestSchema, {
      name: this.name,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    await this.client.grab(request, callOptions);
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
}
