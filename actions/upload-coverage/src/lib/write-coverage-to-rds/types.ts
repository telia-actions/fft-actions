import { RushPackage } from '@src/types';

export type WriteToRDSOptions = {
  rushProjects: RushPackage[];
  region: string;
  secretArn: string;
  resourceArn: string;
  database: string;
  table: string;
};
