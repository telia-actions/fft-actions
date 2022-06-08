export interface Inputs {
  apps: AppsInput[];
  registryUrl: string;
  localTag: string;
  remoteTag: string;
  actionIfMissing: string;
}

export interface AppsInput {
  name: string;
}
