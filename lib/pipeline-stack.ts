import * as cdk from '@aws-cdk/core';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import { CdkPipeline, SimpleSynthAction } from '@aws-cdk/pipelines';

export class WorkshopPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Defines the artifact representing the sourcecode
    const sourceArtifact = new codepipeline.Artifact();

    // Define the source action for GitHub
    const sourceAction = new codepipeline_actions.GitHubSourceAction({
      actionName: 'Github',
      output: sourceArtifact,
      owner: 'agrudkow',
      repo: 'cdk-workshop',
      oauthToken: cdk.SecretValue.secretsManager('github-token'),
      branch: 'develop',
    });

    // Defines the artifact representing the cloud assembly
    // (cloudformation template + all other assets)
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    // Define the synth action
    const synthAction = SimpleSynthAction.standardNpmSynth({
      sourceArtifact,
      cloudAssemblyArtifact,
      buildCommand: 'npm run build',
    });

    // The basic pipeline declaration. This sets the initial structure of our pipeline
    const pipeline = new CdkPipeline(this, 'Pipeline', {
      pipelineName: 'WorkshopPipeline',
      cloudAssemblyArtifact,
      sourceAction,
      synthAction,
    });
  }
}
