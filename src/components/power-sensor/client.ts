import { type JsonValue, create, fromJson } from '@bufbuild/protobuf';
import { StructSchema } from '@bufbuild/protobuf/wkt';
import type { Struct } from '@bufbuild/protobuf/wkt';
import type { CallOptions, Client } from '@connectrpc/connect';
import { GetReadingsRequestSchema } from '../../gen/common/v1/common_pb';
import { PowerSensorService } from '../../gen/component/powersensor/v1/powersensor_pb';
import { GetCurrentRequestSchema, GetPowerRequestSchema, GetVoltageRequestSchema } from '../../gen/component/powersensor/v1/powersensor_pb';
import type { RobotClient } from '../../robot';
import type { Options } from '../../types';
import { doCommandFromClient } from '../../utils';
import type { PowerSensor } from './power-sensor';

/**
 * A gRPC-web client for the PowerSensor component.
 *
 * @group Clients
 */

export class PowerSensorClient implements PowerSensor {
  private client: Client<typeof PowerSensorService>;
  public readonly name: string;
  private readonly options: Options;
  public callOptions: CallOptions = { headers: {} as Record<string, string> };

  constructor(client: RobotClient, name: string, options: Options = {}) {
    this.client = client.createServiceClient(PowerSensorService);
    this.name = name;
    this.options = options;
  }

  async getVoltage(extra = {}, callOptions = this.callOptions) {
    const request = create(GetVoltageRequestSchema, {
      name: this.name,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    const response = await this.client.getVoltage(request, callOptions);

    return [response.volts, response.isAc] as const;
  }

  async getCurrent(extra = {}, callOptions = this.callOptions) {
    const request = create(GetCurrentRequestSchema, {
      name: this.name,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    const response = await this.client.getCurrent(request, callOptions);

    return [response.amperes, response.isAc] as const;
  }

  async getPower(extra = {}, callOptions = this.callOptions) {
    const request = create(GetPowerRequestSchema, {
      name: this.name,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    const resp = await this.client.getPower(request, callOptions);
    return resp.watts;
  }

  async getReadings(extra = {}, callOptions = this.callOptions) {
    const request = create(GetReadingsRequestSchema, {
      name: this.name,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    const response = await this.client.getReadings(request, callOptions);

    const result: Record<string, JsonValue> = {};
    for (const key of Object.keys(response.readings)) {
      const value = response.readings[key];
      if (!value) {
        continue;
      }
      result[key] = value.toJson();
    }
    return result;
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
