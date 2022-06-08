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
        const imageName = `${app}:${localTag}`
  
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
                  warning(`${app} image is not created`)
                  break;
                case "error":
                  error(`${app} image is not created`)
                  break;
                default:
              }
        }
    }
  }
