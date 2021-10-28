import * as cdk from "@aws-cdk/core";
import * as ecs from "@aws-cdk/aws-ecs";

interface Props {
  serviceName: string;
  port: number;
  assetFolder: string;
  environment: string;
  cluster: ecs.Cluster;
  desiredCount: number;
  envVars?: {
    [key: string]: string;
  };
}


export class FargateConstruct extends cdk.Construct {
  /**
   * 
   * @serviceName : Unique service name for fargate stack.
   * @port : Container port.
   * 
   */

  taskDef: ecs.FargateTaskDefinition;
  service: ecs.FargateService;
  container: ecs.ContainerDefinition;

  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id);
    const defaultId = `${props.environment}-${props.serviceName}`;

    // create our task definition, container, and add port mappings
    this.taskDef = new ecs.FargateTaskDefinition(
      this,
      defaultId + "-taskdef",
      {
        cpu: 256,
        memoryLimitMiB: 512,
      }
    );

    // attach container to task def
    this.container = this.taskDef.addContainer(
      defaultId + "-container",
      {
        image: ecs.ContainerImage.fromAsset(props.assetFolder),
        environment: props.envVars,
        logging: new ecs.AwsLogDriver({
          streamPrefix: defaultId,
          mode: ecs.AwsLogDriverMode.NON_BLOCKING,
        }),
      }
    );

    this.container.addPortMappings({
      hostPort: 0,
      containerPort: props.port,
    });

    // create services
    this.service = new ecs.FargateService(this, defaultId + "svc", {
      cluster: props.cluster,
      taskDefinition: this.taskDef,
      desiredCount: props.desiredCount,
      serviceName: props.serviceName,
    });
  }
}
