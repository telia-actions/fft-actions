import { AwsRdsClient, CreateAwsRdsClientOptions, ExecuteBatchStatementOptions } from './types';
import {
  BatchExecuteStatementCommand,
  BatchExecuteStatementCommandOutput,
  RDSDataClient,
} from '@aws-sdk/client-rds-data';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { createProxyAgent } from '@src/util/proxy-client';

export const createAwsRdsClient = ({
  database,
  region,
  secretArn,
  resourceArn,
}: CreateAwsRdsClientOptions): AwsRdsClient => {
  const client = new RDSDataClient({
    region,
    requestHandler: new NodeHttpHandler({
      httpsAgent: createProxyAgent(),
    }),
  });

  const executeBatchStatement = async (
    options: ExecuteBatchStatementOptions
  ): Promise<BatchExecuteStatementCommandOutput> => {
    const command = new BatchExecuteStatementCommand({
      secretArn,
      resourceArn,
      database,
      ...options,
    });

    return await client.send(command);
  };

  return { executeBatchStatement };
};
