import { exec } from '@actions/exec';
import { setFailed, error, warning } from '@actions/core';
import { getInputs } from './util/github/get-inputs';

export async function run(): Promise<void> {
  try {
    const { apps, remoteTag, localTag, registryUrl, actionIfMissing } = getInputs();

    for (const app of apps) {
      const name = app.name
      const imageName = `${name}:${localTag}`

      let imageId = "";

      const options = {
          listeners: {
              stdout: (data: any) => {
                  imageId += data.toString();
              }
          }
      };

      await exec("docker", ["images", "-q", imageName], options)

      if (imageId !== "") {
          await exec("docker", ["tag", imageName, `${registryUrl}/${name}:${remoteTag}`]);
          await exec("docker", ["push", `${registryUrl}/${name}:${remoteTag}`]);
      } else {
          switch(actionIfMissing) {
              case "warning":
                // code block
                warning(`${app.name} image is not created`)
                break;
              case "error":
                // code block
                error(`${app.name} image is not created`)
                break;
              default:
                // code block
            }
      }
  }
  } catch (error) {
    setFailed(error as Error);
  }
}
