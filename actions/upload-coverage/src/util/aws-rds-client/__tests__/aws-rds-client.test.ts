import * as clientRdsData from '@aws-sdk/client-rds-data';
import * as nodeHttpHandler from '@aws-sdk/node-http-handler';
import * as proxyClient from '@src/util/proxy-client';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { createAwsRdsClient } from '@src/util/aws-rds-client';
import { mockPartial } from '@src/util/mocks';

jest.mock('@aws-sdk/client-rds-data');
jest.mock('@aws-sdk/node-http-handler');
jest.mock('@src/util/proxy-client');

describe('createAwsRdsClient', () => {
  const database = 'database';
  const region = 'region';
  const secretArn = 'secretArn';
  const resourceArn = 'resourceArn';

  const RDSDataClientSpy = jest.spyOn(clientRdsData, 'RDSDataClient');
  const BatchExecuteStatementCommandSpy = jest.spyOn(clientRdsData, 'BatchExecuteStatementCommand');
  const NodeHttpHandlerSpy = jest.spyOn(nodeHttpHandler, 'NodeHttpHandler');
  const createProxyAgentSpy = jest.spyOn(proxyClient, 'createProxyAgent');

  const rdsDataClient = mockPartial<clientRdsData.RDSDataClient>({
    send: jest.fn(),
  });
  const command = mockPartial<clientRdsData.BatchExecuteStatementCommand>({});
  const requestHandler = mockPartial<nodeHttpHandler.NodeHttpHandler>({});
  const proxyAgent = mockPartial<HttpsProxyAgent>({});

  beforeEach(() => {
    RDSDataClientSpy.mockReturnValue(rdsDataClient);
    BatchExecuteStatementCommandSpy.mockReturnValue(command);
    NodeHttpHandlerSpy.mockReturnValue(requestHandler);
    createProxyAgentSpy.mockReturnValue(proxyAgent);
  });

  describe('create', () => {
    it('should return aws rds client', async () => {
      const result = createAwsRdsClient({
        database,
        region,
        secretArn,
        resourceArn,
      });

      expect(createProxyAgentSpy).toHaveBeenCalledTimes(1);

      expect(RDSDataClientSpy).toHaveBeenCalledTimes(1);
      expect(RDSDataClientSpy).toHaveBeenCalledWith({
        region,
        requestHandler,
      });

      expect(NodeHttpHandlerSpy).toHaveBeenCalledTimes(1);
      expect(NodeHttpHandlerSpy).toHaveBeenCalledWith({
        httpsAgent: proxyAgent,
      });

      expect(result.executeBatchStatement).toStrictEqual(expect.any(Function));
    });
  });

  describe('create', () => {
    it('should return aws rds client', async () => {
      const result = createAwsRdsClient({
        database,
        region,
        secretArn,
        resourceArn,
      });

      expect(result.executeBatchStatement).toStrictEqual(expect.any(Function));
    });
  });

  describe('executeBatchStatement', () => {
    it('should send batch command to rds client', async () => {
      const result = createAwsRdsClient({
        database,
        region,
        secretArn,
        resourceArn,
      });

      const sql = 'sql';

      await result.executeBatchStatement({ sql });

      expect(BatchExecuteStatementCommandSpy).toHaveBeenCalledTimes(1);
      expect(BatchExecuteStatementCommandSpy).toHaveBeenCalledWith({
        secretArn,
        resourceArn,
        database,
        sql,
      });

      expect(rdsDataClient.send).toHaveBeenCalledTimes(1);
      expect(rdsDataClient.send).toHaveBeenCalledWith(command);
    });
  });
});
