import * as cdk from '@aws-cdk/core';
import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as lambda from '@aws-cdk/aws-lambda';

import { HitCounter } from '../lib/hit-counter';

test('DynamoDB Table Created With Encryption', () => {
  const stack = new cdk.Stack();

  new HitCounter(stack, 'MyTestConstruct', {
    downstream: new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'lambda.handler',
      code: lambda.Code.fromInline('test'),
    }),
  });

  expectCDK(stack).to(
    haveResource('AWS::DynamoDB::Table', {
      SSESpecification: {
        SSEEnabled: true,
      },
    }),
  );
});

test('DynamoDB Table read capacity can be configured', () => {
  const stack = new cdk.Stack();

  expect(() => {
    new HitCounter(stack, 'MyTestConstruct', {
      downstream: new lambda.Function(stack, 'TestFunction', {
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'lambda.handler',
        code: lambda.Code.fromInline('test'),
      }),
      readCapacity: 3,
    });
  }).toThrowError(/readCapacity must be between 5 and 20 \(inclusive\)/);
});

test('Lambda Has Environment Variables', () => {
  const stack = new cdk.Stack();

  new HitCounter(stack, 'MyTestConstruct', {
    downstream: new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'lambda.handler',
      code: lambda.Code.fromInline('test'),
    }),
  });

  expectCDK(stack).to(
    haveResource('AWS::Lambda::Function', {
      Environment: {
        Variables: {
          HITS_TABLE_NAME: {
            Ref: 'MyTestConstructHits24A357F0',
          },
          HITS_TABLE_HITS_COLUMN_NAME: 'hits',
          DOWNSTREAM_FUNCTION_NAME: {
            Ref: 'TestFunction22AD90FC',
          },
        },
      },
    }),
  );
});
