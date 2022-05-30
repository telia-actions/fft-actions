export type AppConfig = {
  name: string;
  port: number;
  health_check: string;
  routes: string[];
};

export type EnvironmentConfig = {
  apps: AppConfig[];
};
