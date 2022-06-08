# update-ecs-services

Github action to update ECS services, such as those running in Fargate.
This will force the listed ECS services to pull updated images and redeploy.

## Inputs

### AWS Credentials

Required. Provided as three separate inputs:

- aws_access_key_id
- aws_secret_access_key
- aws_session_token

### env_name

Required. Should match the environment name given when setting up the services using `fft-actions/pull-request-infrastructure`.

### service_names

Required. A stringified (JSON) array of service names.

If you are passing a literal array in YAML, make sure to add quotes so that it is actually a string.

### region

AWS region. Defaults to eu-north-1.

### dry_run

Whether to echo commands instead of running them. Defaults to false.
