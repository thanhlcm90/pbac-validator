export type StatementEffect = 'allow' | 'deny';

export type PBACStatement = {
  effect: StatementEffect;
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
};
