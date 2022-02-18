export type StaticAppConfig = {
  name: string;
  port: number;
  health_check: string;
  routes: string[];
};

export type PreviewEnvConfig = {
  static_apps: StaticAppConfig[];
};
