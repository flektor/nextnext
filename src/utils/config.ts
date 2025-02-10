import fs from 'fs';

function onRead(
  err: NodeJS.ErrnoException | null,
  data: string,
  resolve: (value: any) => void,
  reject: (reason?: any) => void
) {
  //
  if (err) {
    reject(err);
  }

  const config = JSON.parse(data) as ProjectConfig;

  resolve({
    ...config,
    url: getFullPath(config, 'url'),
    // out: getFullPath(config, 'out'),
  });
}

function getFullPath(config: ProjectConfig, type: 'url' | 'out') {
  if (!config.root) {
    throw 'project root is not specified';
  }

  if (config.root[config.root.length - 1] !== '/') {
    config.root += '/';
  }

  if (type === 'out') {
    return config.root + config.out;
  }
  
  return config.root + config.main;
}

export async function getConfig(): Promise<ProjectConfig> {
  return new Promise((resolve, reject) => {
    fs.readFile('./project.json', 'utf8', (err, data) => {
      onRead(err, data, resolve, reject);
    });
  });
}

export type ProjectConfig = {
  root: string;
  main: string;
  out: string;
  url: string;
};
