export const checkEnvVars = (envVars: (string | undefined)[]): string[] => {
  return envVars.map((env) => {
    if (!env) throw new Error(`${env} is missing!`);
    if (process.env[env]) {
      return process.env[env] as string;
    } else {
      throw new Error(`${env} is missing!`);
    }
  });
};
