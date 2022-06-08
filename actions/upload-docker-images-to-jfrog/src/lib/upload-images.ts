import { exec } from '@actions/exec';
import { error, warning } from '@actions/core';
import type { Inputs } from '@src/types';


export async function uploadImages({
    apps,
    localTag,
    remoteTag,
    registryUrl,
    actionIfMissing
  }: Inputs): Promise<void> {
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
                  warning(`${app.name} image is not created`)
                  break;
                case "error":
                  error(`${app.name} image is not created`)
                  break;
                default:
              }
        }
    }
  }
