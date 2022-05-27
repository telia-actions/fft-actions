export default {
  apps: [
    {
      name: 'app1',
      port: 3000,
      health_check: '/app1',
      routes: [],
    },
    {
      name: 'app2',
      port: 3001,
      health_check: '/app2',
      routes: [],
    },
    {
      name: 'app3',
      health_check: '/app3',
      port: 3002,
      routes: [],
    },
    {
      name: 'app4',
      health_check: '/app4',
      port: 3003,
      routes: [],
    },
  ],
};
