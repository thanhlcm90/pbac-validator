[![npm](http://img.shields.io/npm/v/pbac-validator.svg?style=flat-square)](https://npmjs.org/package/pbac) [![npm](http://img.shields.io/npm/dm/pbac-validator.svg?style=flat-square)](https://npmjs.org/package/pbac-validator) [![Build Status](https://img.shields.io/travis/thanhlcm90/pbac-validator/master.svg?style=flat-square)](https://travis-ci.org/thanhlcm90/pbac-validator) ![license](https://img.shields.io/badge/license-mit-blue.svg?style=flat-square)

# Policy Based Access Control

**This library will be like AWS IAM Policy inspired and (mostly) compatible evaluation engine**

Use the power and flexibility of the AWS IAM Policy syntax in your own application to manage access control. For more details on AWS IAM Policies have a look at https://docs.aws.amazon.com/IAM/latest/UserGuide/policies_overview.html.

## Installation

```
npm install pbac-validator
```

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
Contents

- [Synopsis](#synopsis)
- [Constructor](#constructor)
  - [Properties](#properties)
- [Methods](#methods)
  - [evaluate(params)](#evaluateparams)
  - [validate(policy)](#validatepolicy)
- [Reference](#reference)
  - [Context](#context)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Statements

```typescript
import {PBAC, PBACStatement} from "pbac-validator";

const statements: PBACStatement[] = [
  {
    effect: "allow",
    action: ["iam:CreateUser", "iam:UpdateUser", "iam:DeleteUser"],
    resource: ["arn:aws:iam:::user/${req:UserName}"],
  },
];

const pbac = new PBAC(statements);

// returns true
pbac.evaluate({
  action: "iam:CreateUser",
  resource: "arn:aws:iam:::user/testuser",
  context: {
    req: {
      UserName: "testuser",
    },
  },
});
```

## Constructor

```typescript
const pbac = new PBAC(statements);
```

Constructs a policy evaluator.

### Properties


* **`statements`** (Array|Object)
  Either an array of policy statement. Have a look at https://docs.aws.amazon.com/IAM/latest/UserGuide/AccessPolicyLanguage_ElementDescriptions.html for a description of the policy statement syntax.

## Methods


### evaluate(params)

Tests an object against the policies and determines if the object passes.
The method will first try to find a policy with an explicit `deny` for the combination of
`resource`, `action` and `condition` (matching policy). If such policy exists, `evaluate` returns false.
If there is no explicit deny the method will look for a matching policy with an explicit `Allow`.
`evaluate` will return `true` if such a policy is found. If no matching can be found at all,
`evaluate` will return `false`. Please find a more thorough explanation of this process at https://docs.aws.amazon.com/IAM/latest/UserGuide/AccessPolicyLanguage_EvaluationLogic.html.

```typescript
pbac.evaluate({
  action: 'iam:CreateUser',
  resource: 'arn:aws:iam:::user/testuser',
  context: {
    req: {
      IpAddress: '10.0.20.51',
      UserName: 'testuser',
    }
  }
});
```

**Parameters**

* **`params`** (Object)
    * `action` (String) - Action to validate
    * `resource` (String) - Resource to validate
    * `context` (Object) - Nested object of context for interpolation of policy context. See [Context](#context).

**Returns**: `boolean`, Returns `true` if `params` passes the policies, `false` otherwise

### evaluateMulti(params)

Tests many objects against the policies and determines if the each object passes.

**Parameters**

* **`params`** (Array)
  Array of policy object

**Returns**: `boolean[]`

### addFromFunctionMatrix(params)

Add the function matrix and convert thems to policy statements by grouping the action and resource

**Parameters**

* **`params`** (Array) Array of function matric
    * `action` (String) - Action to validate
    * `resource` (String) - Resource to validate
    * `allow` (Boolean) - allow the action on resource

```typescript
const functions = [
  {
    resource: "employee",
    action: "create",
    allow: true,
  },
  {
    resource: "employee",
    action: "update",
    allow: true,
  },
  {
    resource: "employee",
    action: "list",
    allow: true,
  },
  {
    resource: "employee",
    action: "remove",
    allow: true,
  },
  {
    resource: "employee",
    action: "invite",
    allow: false,
  },
  {
    resource: "org",
    action: "create",
    allow: true,
  },
  {
    resource: "org",
    action: "remove",
    allow: false,
  },
  {
    resource: "workspace",
    action: "create",
    allow: false,
  },
  {
    resource: "workspace",
    action: "remove",
    allow: false,
  },
];

pbac.addFromFunctionMatrix(functions);
console.log(pbac.statements);
/*
It will be
[
  {
    effect: "allow",
    actions: ["*"],
    resources: ["employee"],
  },
  {
    effect: "deny",
    actions: ["invite"],
    resources: ["employee"],
  },
  {
    effect: "deny",
    actions: ["remove"],
    resources: ["org"],
  },
  {
    effect: "allow",
    actions: ["create"],
    resources: ["org"],
  },
  {
    effect: "deny",
    actions: ["*"],
    resources: ["workspace"],
  },
];
*/
```


## Reference

### Context

Have a look at https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition.html to understand what policy context are, where they can be used and how they are interpreted. The `evaluate` method expects a `context` parameter which is a nested object that translates to colon-separated context.

**Example:**

```typescript
var context = {
    req: {
      IpAddress: '10.0.20.51',
      UserName: 'testuser',
    },
    session: {
      LoggedInDate: '2015-09-29T15:12:42Z',
  },
};
```

This would translate to the context `req:IpAddress`, `req:UserName` and `session:LoggedInDate`.


* * *
The MIT License (MIT)

Copyright (c) 2018 Moritz Onken

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
