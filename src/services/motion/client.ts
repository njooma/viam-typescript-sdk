import { type JsonValue, create, fromJson } from '@bufbuild/protobuf';
import { StructSchema } from '@bufbuild/protobuf/wkt';
import type { Struct } from '@bufbuild/protobuf/wkt';
import type { CallOptions, Client } from '@connectrpc/connect';
import { MotionService } from '../../gen/service/motion/v1/motion_pb';

import {
  GetPlanRequestSchema,
  GetPoseRequestSchema,
  ListPlanStatusesRequestSchema,
  MoveOnGlobeRequestSchema,
  MoveOnMapRequestSchema,
  MoveRequestSchema,
  StopPlanRequestSchema,
} from '../../gen/service/motion/v1/motion_pb';

import type { RobotClient } from '../../robot';
import type {
  GeoGeometry,
  GeoPoint,
  Geometry,
  Options,
  Pose,
  PoseInFrame,
  Transform,
  WorldState,
} from '../../types';
import { doCommandFromClient } from '../../utils';
import type { Motion } from './motion';
import { type Constraints, type MotionConfiguration } from './types';

/**
 * A gRPC-web client for a Motion service.
 *
 * @group Clients
 */
export class MotionClient implements Motion {
  private client: Client<typeof MotionService>;
  public readonly name: string;
  private readonly options: Options;
  public callOptions: CallOptions = { headers: {} as Record<string, string> };

  constructor(client: RobotClient, name: string, options: Options = {}) {
    this.client = client.createServiceClient(MotionService);
    this.name = name;
    this.options = options;
  }

  async move(
    destination: PoseInFrame,
    componentName: string,
    worldState?: WorldState,
    constraints?: Constraints,
    extra = {},
    callOptions = this.callOptions
  ) {
    const request = create(MoveRequestSchema, {
      name: this.name,
      destination,
      componentName,
      worldState,
      constraints,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    const resp = await this.client.move(request, callOptions);
    return resp.success;
  }

  async moveOnMap(
    destination: Pose,
    componentName: string,
    slamServiceName: string,
    motionConfig?: MotionConfiguration,
    obstacles?: Geometry[],
    extra = {},
    callOptions = this.callOptions
  ) {
    const request = create(MoveOnMapRequestSchema, {
      name: this.name,
      destination,
      componentName,
      slamServiceName,
      motionConfiguration: motionConfig,
      obstacles,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    const resp = await this.client.moveOnMap(request, callOptions);
    return resp.executionId;
  }

  async moveOnGlobe(
    destination: GeoPoint,
    componentName: string,
    movementSensorName: string,
    heading?: number,
    obstaclesList?: GeoGeometry[],
    motionConfig?: MotionConfiguration,
    boundingRegionsList?: GeoGeometry[],
    extra = {},
    callOptions = this.callOptions
  ) {
    const request = create(MoveOnGlobeRequestSchema, {
      name: this.name,
      destination,
      componentName,
      movementSensorName,
      heading,
      obstacles: obstaclesList,
      boundingRegions: boundingRegionsList,
      motionConfiguration: motionConfig,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    const resp = await this.client.moveOnGlobe(request, callOptions);
    return resp.executionId;
  }

  async stopPlan(
    componentName: string,
    extra = {},
    callOptions = this.callOptions
  ) {
    const request = create(StopPlanRequestSchema, {
      name: this.name,
      componentName,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    await this.client.stopPlan(request, callOptions);
    return null;
  }

  async getPlan(
    componentName: string,
    lastPlanOnly?: boolean,
    executionId?: string,
    extra = {},
    callOptions = this.callOptions
  ) {
    const request = create(GetPlanRequestSchema, {
      name: this.name,
      componentName,
      lastPlanOnly,
      executionId,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    return this.client.getPlan(request, callOptions);
  }

  async listPlanStatuses(
    onlyActivePlans?: boolean,
    extra = {},
    callOptions = this.callOptions
  ) {
    const request = create(ListPlanStatusesRequestSchema, {
      name: this.name,
      onlyActivePlans,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    return this.client.listPlanStatuses(request, callOptions);
  }

  async getPose(
    componentName: string,
    destinationFrame: string,
    supplementalTransforms: Transform[],
    extra = {},
    callOptions = this.callOptions
  ) {
    const request = create(GetPoseRequestSchema, {
      name: this.name,
      componentName,
      destinationFrame,
      supplementalTransforms,
      extra: fromJson(StructSchema, extra),
    });

    this.options.requestLogger?.(request);

    const response = await this.client.getPose(request, callOptions);

    const result = response.pose;

    if (!result) {
      throw new Error('no pose');
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
