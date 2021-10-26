import { PBACFunction, PBACStatement, PermissionCheck } from './types';
import { StringLike } from './utils';

export class PBAC {
  private _statements: PBACStatement[];

  constructor(statements?: PBACStatement[]) {
    this._statements = statements ?? [];
  }

  /**
   * Add policies from pbac statements {effect, actions, resources}
   * example about statement: {effect: "deny", actions: "*", resources: "user"}
   *
   * @param {PBACStatement[]} statements
   * @memberof PBAC
   */
  addFromStatements(statements: PBACStatement[]): void {
    this._statements = this._statements.concat(statements);
  }

  /**
   * Add policies from function matrix {allow, action, resource}
   * example about function: {allow: true, action: "add", resource: "user"}
   * it will convert to PBAC statement by grouping actions and resources
   *
   * @param {PBACFunction[]} functions
   * @memberof PBAC
   */
  addFromFunctionMatrix(functions: PBACFunction[]): void {
    const mapping: Record<
      string,
      {
        allow: string[];
        deny: string[];
      }
    > = {};

    functions.forEach((func) => {
      const r = func.resource;
      if (!mapping[r]) mapping[r] = { allow: [], deny: [] };
      if (func.allow) mapping[r].allow.push(func.action);
      else mapping[r].deny.push(func.action);
    });

    // remap with wildcard
    const results: PBACStatement[] = [];

    Object.keys(mapping).forEach((key: string) => {
      const m = mapping[key];
      let r1: PBACStatement | null = null;
      let r2: PBACStatement | null = null;

      if (m.allow.length === 0) {
        r1 = {
          resources: [key],
          actions: ['*'],
          effect: 'deny',
        };
      } else if (m.deny.length === 0) {
        r1 = {
          resources: [key],
          actions: ['*'],
          effect: 'allow',
        };
      } else if (m.allow.length > m.deny.length) {
        r1 = {
          resources: [key],
          actions: ['*'],
          effect: 'allow',
        };
        r2 = {
          resources: [key],
          actions: m.deny,
          effect: 'deny',
        };
      } else if (m.deny.length > m.allow.length) {
        r1 = {
          resources: [key],
          actions: ['*'],
          effect: 'deny',
        };
        r2 = {
          resources: [key],
          actions: m.allow,
          effect: 'allow',
        };
      } else {
        r1 = {
          resources: [key],
          actions: m.deny,
          effect: 'deny',
        };
        r2 = {
          resources: [key],
          actions: m.allow,
          effect: 'allow',
        };
      }

      // find result with same action, resource
      if (r1) {
        const sample = results.find((item) => item.effect === r1?.effect && item.actions[0] === '*');
        if (sample) {
          sample.resources.push(r1.resources[0]);
        } else {
          results.push(r1);
        }
        if (r2) results.push(r2);
      }
    });

    // sort results depend on wildcard
    this._statements = results.sort((item) => (item.actions.indexOf('*') > -1 ? 0 : 1));
  }

  /**
   * Evaluate the permission if match with policies
   *
   * @param {PermissionCheck} permission
   * @returns {boolean}
   * @memberof PBAC
   */
  evaluate(permission: PermissionCheck): boolean {
    let r = false;

    this._statements.forEach((statement) => {
      const matchResource =
        statement.resources && this.evaluateResource(statement.resources, permission.resource, permission.context);
      const matchAction = statement.actions && this.evaluateAction(statement.actions, permission.action);
      if (matchResource && matchAction) {
        r = statement.effect === 'allow';
      }
    });

    return r;
  }

  /**
   * Evaluate the multi permissions if match with policies
   *
   * @param {PermissionCheck[]} permissions
   * @returns {PBACFunction[]}
   * @memberof PBAC
   */
  evaluateMulti(permissions: PermissionCheck[]): PBACFunction[] {
    const r = permissions.map((func) => ({
      ...func,
      allow: this.evaluate(func),
    }));
    return r;
  }

  get statements(): PBACStatement[] {
    return this._statements;
  }

  private interpolateValue(value: string, variables?: Record<string, Record<string, string>>): string {
    return value.replace(/\${(.+?)}/g, (match, variable) => this.getVariableValue(variable, variables));
  }

  private getVariableValue(variable: string, variables?: Record<string, Record<string, string>>): string {
    const parts = variable.split(':');
    if (variables?.[parts[0]] && variables[parts[0]][parts[1]] !== undefined) return variables[parts[0]][parts[1]];
    return variable;
  }

  private evaluateAction(actions: string[], reference: string): string | undefined {
    return actions.find((action) => StringLike.call(this, reference, action));
  }

  private evaluateResource(
    resources: string[],
    reference: string,
    context?: Record<string, Record<string, string>>
  ): string | undefined {
    return resources.find((resource) => {
      const value = this.interpolateValue(resource, context);
      return StringLike.call(this, reference, value);
    });
  }
}
