export type PBACStatement = {
  effect: string;
  actions: string[];
  resources: string[];
};

export type PBACFunction = {
  allow: boolean;
  action: string;
  resource: string;
};

export type PermissionCheck = {
  action: string;
  resource: string;
  context?: Record<string, Record<string, string>>;
};
