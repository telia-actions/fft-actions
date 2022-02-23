export interface Inputs {
  rushProjects: ProjectInput[];
  repositoryUrl: string;
  username: string;
  password: string;
  buildIdentifier: string;
}

export interface ProjectInput {
  packageName: string;
  projectFolder: string;
}

export interface ProjectPlan extends ProjectInput {
  destination: string;
  tarfile: string;
  files: string[];
}

export type UploadInputs = Pick<Inputs, 'repositoryUrl' | 'username' | 'password'> &
  Pick<ProjectPlan, 'tarfile' | 'destination'>;
