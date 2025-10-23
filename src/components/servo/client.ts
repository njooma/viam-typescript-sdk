import { type JsonValue, create, fromJson } from '@bufbuild/protobuf';
import { StructSchema } from '@bufbuild/protobuf/wkt';
import type { Struct } from '@bufbuild/protobuf/wkt';
import type { CallOptions, Client } from '@connectrpc/connect';
import { ServoService } from '../../gen/component/servo/v1/servo_pb';

import {
  GetPositionRequestSchema,
  IsMovingRequestSchema,
  MoveRequestSchema,
  StopRequestSchema,
} from '../../gen/component/servo/v1/servo_pb';

import type { RobotClient } from '../../robot';
import type { Options } from '../../types';
import { doCommandFromClient } from '../../utils';
import type { Servo } from './servo';

/**
 * A gRPC-web client for the Servo component.
 *
 * @group Clients
 */
export class ServoClient implements Servo {
  private client: Client<typeof ServoService>;
  public readonly name: string;
  private readonly options: Options;
  public callOptions: CallOptions = { headers: {} as Record<string, string> };

  constructor(client: RobotClient, name: string, options: Options = {}) {
    this.client = client.createServiceClient(ServoService);
    this.name = name;
    this.options = options;
  }

  async move(angleDeg: number, extra = {}, callOptions = this.callOptions) {
    const request = create(MoveRequestSchema, {
      name: this.name,
      angleDeg,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    await this.client.move(request, callOptions);
  }

  async getPosition(extra = {}, callOptions = this.callOptions) {
    const request = create(GetPositionRequestSchema, {
      name: this.name,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    const resp = await this.client.getPosition(request, callOptions);
    return resp.positionDeg;
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
