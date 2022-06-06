function uploadImages(core, envVariables) {
    const { apps, remoteTag, localTag, registry, ifImageMissing } = envVariables;

    for (const app of apps) {
        const name = app.name
        const imageName = `${name}:${localTag}`

        let imageId = "";

        const options = {
            listeners: {
                stdout: (data) => {
                    imageId += data.toString();
                }
            }
        };

        await exec.exec("docker", ["images", "-q", imageName], options)

        if (imageId !== "") {
            await exec.exec("docker", ["tag", imageName, `${registry}/${name}:${remoteTag}`]);
            await exec.exec("docker", ["push", `${registry}/${name}:${remoteTag}`]);
        } else {
            switch(ifImageMissing) {
                case "warning":
                  // code block
                  core.warning(`${app.name} image is not created`)
                  break;
                case "error":
                  // code block
                  core.error(`${app.name} image is not created`)
                  break;
                default:
                  // code block
              }
        }
    }
}
module.exports = {
    uploadImages,
};