import { PBAC, PBACStatement } from '.';

describe('Check PBAC', () => {
  const policies: { subject: string; statements: PBACStatement[] }[] = [
    {
      subject: 'group:owner',
      statements: [
        {
          effect: 'allow',
          actions: ['*'],
          resources: ['workspace', 'employee'],
        },
      ],
    },
    {
      subject: 'group:admin',
      statements: [
        {
          effect: 'allow',
          actions: ['*'],
          resources: ['*'],
        },
        {
          effect: 'deny',
          actions: ['*'],
          resources: ['workspace'],
        },
      ],
    },
    {
      subject: 'group:manager',
      statements: [
        {
          effect: 'allow',
          actions: ['*'],
          resources: ['*'],
        },
        {
          effect: 'deny',
          actions: ['*'],
          resources: ['workspace', 'employee'],
        },
        {
          effect: 'allow',
          actions: ['invite'],
          resources: ['employee'],
        },
      ],
    },
    {
      subject: 'group:employee',
      statements: [
        {
          effect: 'allow',
          actions: ['*'],
          resources: ['*'],
        },
        {
          effect: 'deny',
          actions: ['*'],
          resources: ['employee', 'workspace'],
        },
      ],
    },
  ];

  describe('Check group:owner', () => {
    const owner = new PBAC(policies[0].statements);
    it('should return true when access any action in resource employee', () => {
      const check = owner.evaluate({
        action: 'create',
        resource: 'employee',
      });
      expect(check).toEqual(true);
    });
    it('should return true when access any action in resource workspace', () => {
      const check = owner.evaluate({
        action: 'create',
        resource: 'workspace',
      });
      expect(check).toEqual(true);
    });
    it('should return false when access any action in resource org', () => {
      const check = owner.evaluate({
        action: 'create',
        resource: 'org',
      });
      expect(check).toEqual(false);
    });
  });

  describe('Check group:admin', () => {
    const admin = new PBAC(policies[1].statements);
    it('should return true when access any action in resource employee', () => {
      const check = admin.evaluate({
        action: 'create',
        resource: 'employee',
      });
      expect(check).toEqual(true);
    });
    it('should return false when access any action in resource workspace', () => {
      const check = admin.evaluate({
        action: 'create',
        resource: 'workspace',
      });
      expect(check).toEqual(false);
    });
  });

  describe('Check group:manager', () => {
    const manager = new PBAC(policies[2].statements);
    it('should return true when access any action in resource org', () => {
      const check = manager.evaluate({
        action: 'create',
        resource: 'org',
      });
      expect(check).toEqual(true);
    });
    it('should return false when access create action in resource employee', () => {
      const check = manager.evaluate({
        action: 'create',
        resource: 'employee',
      });
      expect(check).toEqual(false);
    });
    it('should return false when access create action in resource workspace', () => {
      const check = manager.evaluate({
        action: 'create',
        resource: 'workspace',
      });
      expect(check).toEqual(false);
    });
    it('should return true when access invite action in resource employee', () => {
      const check = manager.evaluate({
        action: 'invite',
        resource: 'employee',
      });
      expect(check).toEqual(true);
    });
  });

  describe('Check group:employee', () => {
    const employee = new PBAC(policies[3].statements);
    it('should return true when access any action in resource org', () => {
      const check = employee.evaluate({
        action: 'create',
        resource: 'org',
      });
      expect(check).toEqual(true);
    });
    it('should return false when access create action in resource employee', () => {
      const check = employee.evaluate({
        action: 'create',
        resource: 'employee',
      });
      expect(check).toEqual(false);
    });
    it('should return false when access create action in resource workspace', () => {
      const check = employee.evaluate({
        action: 'create',
        resource: 'workspace',
      });
      expect(check).toEqual(false);
    });
  });

  describe('Converting', () => {
    it('should return right function matrix from pbac statements', () => {
      const functions = [
        {
          resource: 'employee',
          action: 'create',
        },
        {
          resource: 'employee',
          action: 'update',
        },
        {
          resource: 'employee',
          action: 'list',
        },
        {
          resource: 'employee',
          action: 'remove',
        },
        {
          resource: 'employee',
          action: 'invite',
        },
        {
          resource: 'org',
          action: 'create',
        },
        {
          resource: 'org',
          action: 'remove',
        },
        {
          resource: 'workspace',
          action: 'create',
        },
        {
          resource: 'workspace',
          action: 'remove',
        },
      ];
      const result = [
        {
          resource: 'employee',
          action: 'create',
          allow: false,
        },
        {
          resource: 'employee',
          action: 'update',
          allow: false,
        },
        {
          resource: 'employee',
          action: 'list',
          allow: false,
        },
        {
          resource: 'employee',
          action: 'remove',
          allow: false,
        },
        {
          resource: 'employee',
          action: 'invite',
          allow: true,
        },
        {
          resource: 'org',
          action: 'create',
          allow: true,
        },
        {
          resource: 'org',
          action: 'remove',
          allow: true,
        },
        {
          resource: 'workspace',
          action: 'create',
          allow: false,
        },
        {
          resource: 'workspace',
          action: 'remove',
          allow: false,
        },
      ];

      const pbac = new PBAC(policies[2].statements);
      const check = pbac.evaluateMulti(functions);
      expect(check).toEqual(result);
    });

    it('should return right pbac statements from Function Matrix 1', () => {
      const functions = [
        {
          resource: 'employee',
          action: 'create',
          allow: true,
        },
        {
          resource: 'employee',
          action: 'update',
          allow: true,
        },
        {
          resource: 'employee',
          action: 'list',
          allow: true,
        },
        {
          resource: 'employee',
          action: 'remove',
          allow: true,
        },
        {
          resource: 'employee',
          action: 'invite',
          allow: false,
        },
        {
          resource: 'org',
          action: 'create',
          allow: true,
        },
        {
          resource: 'org',
          action: 'remove',
          allow: false,
        },
        {
          resource: 'workspace',
          action: 'create',
          allow: false,
        },
        {
          resource: 'workspace',
          action: 'remove',
          allow: false,
        },
      ];
      const statements = [
        {
          effect: 'allow',
          actions: ['*'],
          resources: ['employee'],
        },
        {
          effect: 'deny',
          actions: ['invite'],
          resources: ['employee'],
        },
        {
          effect: 'deny',
          actions: ['remove'],
          resources: ['org'],
        },
        {
          effect: 'allow',
          actions: ['create'],
          resources: ['org'],
        },
        {
          effect: 'deny',
          actions: ['*'],
          resources: ['workspace'],
        },
      ];
      const pbac = new PBAC();
      pbac.addFromFunctionMatrix(functions);

      expect(pbac.statements).toEqual(statements);
    });
  });
});
