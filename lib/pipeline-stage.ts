import { CdkWorkshopStack } from './cdk-workshop-stack';
import { Stage, Construct, StageProps, CfnOutput } from '@aws-cdk/core';

export class WorkshopPipelineStage extends Stage {
  // exposed outputs
  public readonly hcViewerUrl: CfnOutput;
  public readonly hcEndpoint: CfnOutput;

  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const cdkWorkshopStack = new CdkWorkshopStack(this, 'WebService');

    this.hcEndpoint = cdkWorkshopStack.hcEndpoint
    this.hcViewerUrl = cdkWorkshopStack.hcViewerUrl
  }
}
