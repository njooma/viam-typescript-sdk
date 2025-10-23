import type { RobotClient } from '../../robot';
import type { Options } from '../../types';

import { type JsonValue, create, fromJson } from '@bufbuild/protobuf';
import { Duration, StructSchema } from '@bufbuild/protobuf/wkt';
import type { Duration, Struct } from '@bufbuild/protobuf/wkt';
import type { CallOptions, Client } from '@connectrpc/connect';
import { BoardService } from '../../gen/component/board/v1/board_pb';

import {
  GetDigitalInterruptValueRequestSchema,
  GetGPIORequestSchema,
  PWMFrequencyRequestSchema,
  PWMRequestSchema,
  ReadAnalogReaderRequestSchema,
  SetGPIORequestSchema,
  SetPWMFrequencyRequestSchema,
  SetPWMRequestSchema,
  SetPowerModeRequestSchema,
  StreamTicksRequestSchema,
  WriteAnalogRequestSchema,
} from '../../gen/component/board/v1/board_pb';

import { doCommandFromClient } from '../../utils';
import { type Board, type PowerMode, type Tick } from './board';

/**
 * A gRPC-web client for the Board component.
 *
 * @group Clients
 */
export class BoardClient implements Board {
  private client: Client<typeof BoardService>;
  public readonly name: string;
  private readonly options: Options;
  public callOptions: CallOptions = { headers: {} as Record<string, string> };

  constructor(client: RobotClient, name: string, options: Options = {}) {
    this.client = client.createServiceClient(BoardService);
    this.name = name;
    this.options = options;
  }

  async setGPIO(
    pin: string,
    high: boolean,
    extra = {},
    callOptions = this.callOptions
  ) {
    const request = create(SetGPIORequestSchema, {
      name: this.name,
      pin,
      high,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    await this.client.setGPIO(request, callOptions);
  }

  async getGPIO(pin: string, extra = {}, callOptions = this.callOptions) {
    const request = create(GetGPIORequestSchema, {
      name: this.name,
      pin,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    const resp = await this.client.getGPIO(request, callOptions);
    return resp.high;
  }

  async getPWM(pin: string, extra = {}, callOptions = this.callOptions) {
    const request = create(PWMRequestSchema, {
      name: this.name,
      pin,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    const resp = await this.client.pWM(request, callOptions);
    return resp.dutyCyclePct;
  }

  async setPWM(
    pin: string,
    dutyCyle: number,
    extra = {},
    callOptions = this.callOptions
  ) {
    const request = create(SetPWMRequestSchema, {
      name: this.name,
      pin,
      dutyCyclePct: dutyCyle,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    await this.client.setPWM(request, callOptions);
  }

  async getPWMFrequency(
    pin: string,
    extra = {},
    callOptions = this.callOptions
  ) {
    const request = create(PWMFrequencyRequestSchema, {
      name: this.name,
      pin,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    const resp = await this.client.pWMFrequency(request, callOptions);
    return Number(resp.frequencyHz);
  }

  async setPWMFrequency(
    pin: string,
    frequencyHz: number,
    extra = {},
    callOptions = this.callOptions
  ) {
    const request = create(SetPWMFrequencyRequestSchema, {
      name: this.name,
      pin,
      frequencyHz: frequencyHz ? BigInt(frequencyHz) : undefined,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    await this.client.setPWMFrequency(request, callOptions);
  }

  async readAnalogReader(
    analogReader: string,
    extra = {},
    callOptions = this.callOptions
  ) {
    const request = create(ReadAnalogReaderRequestSchema, {
      boardName: this.name,
      analogReaderName: analogReader,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    return this.client.readAnalogReader(request, callOptions);
  }

  async writeAnalog(
    pin: string,
    value: number,
    extra = {},
    callOptions = this.callOptions
  ) {
    const request = create(WriteAnalogRequestSchema, {
      name: this.name,
      pin,
      value,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    await this.client.writeAnalog(request, callOptions);
  }

  async getDigitalInterruptValue(
    digitalInterruptName: string,
    extra = {},
    callOptions = this.callOptions
  ) {
    const request = create(GetDigitalInterruptValueRequestSchema, {
      boardName: this.name,
      digitalInterruptName,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    const resp = await this.client.getDigitalInterruptValue(
      request,
      callOptions
    );
    return Number(resp.value);
  }

  async streamTicks(
    interrupts: string[],
    queue: Tick[],
    extra = {},
    callOptions = this.callOptions
  ) {
    const request = create(StreamTicksRequestSchema, {
      name: this.name,
      pinNames: interrupts,
      extra: fromJson(StructSchema, extra),
    });
    this.options.requestLogger?.(request);
    const stream = this.client.streamTicks(request, callOptions);

    for await (const latest of stream) {
      queue.push({
        pinName: latest.pinName,
        high: latest.high,
        time: latest.time ? Number(latest.time) : 0,
      });
    }
  }

  async setPowerMode(
    powerMode: PowerMode,
    duration?: Duration,
    extra = {},
    callOptions = this.callOptions
  ) {
    const request = create(SetPowerModeRequestSchema, {
      name: this.name,
      powerMode,
      duration,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    await this.client.setPowerMode(request, callOptions);
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
