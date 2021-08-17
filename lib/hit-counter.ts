import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';

export interface HitCoutnerProps {
  /**
   * the funditon for which we want to count the url hits
   */
  downstream: lambda.IFunction;
}

export class Hitcounter extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, { downstream }: HitCoutnerProps) {
    super(scope, id);
  }
}
