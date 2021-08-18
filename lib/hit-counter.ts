import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { throws } from 'assert';

export interface HitCounterProps {
  /**
   * the funditon for which we want to count the url hits
   */
  downstream: lambda.IFunction;

  /**
   * The read capacity units for the table
   *
   * Must be greater than 5 and lower than 20
   *
   * @default 5
   */
  readCapacity?: number;
}

export class HitCounter extends cdk.Construct {
  public readonly handler: lambda.Function;
  public readonly hitsTable: dynamodb.Table;
  public readonly hitsTableHitsCoulumnName: string = 'hits';

  constructor(scope: cdk.Construct, id: string, { downstream, readCapacity = 5 }: HitCounterProps) {
    super(scope, id);

    // Validate readCapacity
    this.validateReadCapacity(readCapacity)
    
    this.hitsTable = new dynamodb.Table(this, 'Hits', {
      partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      readCapacity: readCapacity,
    });

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hit-counter.handler',
      code: lambda.Code.fromAsset('lambda', { exclude: ['*.ts'] }),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: downstream.functionName,
        HITS_TABLE_NAME: this.hitsTable.tableName,
        HITS_TABLE_HITS_COLUMN_NAME: this.hitsTableHitsCoulumnName,
      },
    });

    // grant read/write persmissions for table Hits for lambda func
    this.hitsTable.grantWriteData(this.handler);

    // grant invoke persmissions
    downstream.grantInvoke(this.handler);
  }

  private validateReadCapacity = (readCapacity: number): void | never => {
    if (readCapacity > 20 || readCapacity < 5)
      throw new Error('readCapacity must be between 5 and 20 (inclusive)')
  }
}

// api gateway -> lambda -> labda
//                  .
//                  dynamodb