import { BatchExecuteStatementCommandOutput, SqlParameter } from '@aws-sdk/client-rds-data';

export type AwsRdsClient = {
  executeBatchStatement: (
    options: ExecuteBatchStatementOptions
  ) => Promise<BatchExecuteStatementCommandOutput>;
};

export type CreateAwsRdsClientOptions = {
  region: string;
  secretArn: string;
  resourceArn: string;
  database: string;
};

export type ExecuteBatchStatementOptions = {
  sql: string;
  parameterSets?: ParameterSet[];
};

export type ParameterSet = SqlParameter[];
