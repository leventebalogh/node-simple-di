# node-simple-di

A simple Dependency Injection container built for Node.js where **the configuration between modules is described in a single file.**

## Table of Contents
- [Install](#install)
- [Basic Usage](#basic-usage)
- [Configuration](#configuration)
- [API](#API)
- [Registering a Singleton](#registering-a-singleton)
- [Registering Constants](#registering-constants)
- [Return a new instance](#return-a-new-instance)
- [Return module as it is](#return-module-as-it-is)
- [Return a partially applied module](#return-a-partially-applied-module)
- [Return the result of a callable module](#return-the-result-of-a-callable-module)
- [Overwrite a service](#overwrite-a-service)
- [Add a new service](#add-a-new-service)

## Install

```bash
# Using NPM
$ npm install node-simple-di

# Using Yarn
$ yarn add node-simple-di
```

## Basic usage
```javascript
const { getContainer, STRATEGY } = require('node-simple-di');

// The configuration for the DI container
const configuration = {
    // Injectable parameters
    host: 'localhost',
    port: 8080,
    // Injectable module
    app: {
        // The constructor function of the module
        module: function App (host, port) {
            this.host = host;
            this.port = port;
            this.start = () => {
                // some more logic...
            }
        },
        // Names of the parameters or modules that should be injected
        // as parameters to the module's constructor function
        args: ['host', 'port'],
        // Strategy to use when creating "app"
        strategy: STRATEGY.NEW
    }
}

const container = getContainer(configuration);

container.get('app').start();
```

## Configuration

The configuration file is a simple javascript object.
A small sample:

```javascript
const config = {
    // This service will be resolved to a partially applied function.
    // foo() => 10
    foo: {
        // The "module" can be a String, Number, Function, or a Class.
        module: a => a * 2,
        // Args can be any kind of values.
        // If an arg is a string, and it matches any existing service,
        // the service will be injected instead of the value.
        args: ['a']
    },
    // Shorthand syntax: "a" will always resolve to 10
    a: 10
};
```

## API

The API is really simple, there are only two functions that you can use.
Most of the API comes by interacting with the config itself.

```javascript
const { getContainer, STRATEGY } = require('node-simple-di');
const container = getContainer({ /* ... */ });

// Returns a service with all the dependencies resolved.
// @param { String } serviceName
container.get('<service-name>');

// Adds / Updates a service to the container.
// @param { String } serviceName
// @param { Object | Number | String | Function } serviceDefinition
container.set('<service-name>', 10);
container.set('<service-name>', 'Foo Bar.');
container.set('<service-name>', {
    module: (a, b) => a + b,
    args: ['a', 'b']
});
```

## Registering a Singleton
As the container uses an inner cache for resolved services, actually everything which is returning
an instance returns a singleton.

```javascript
// config.js
const { getContainer, STRATEGY } = require('node-simple-di');

const container = getContainer({
    m: 10,
    foo: {
        module: function Foo (m) {
            this.m = m;
            this.getM = () => m;
        },
        args: ['m'],
        strategy: STRATEGY.NEW
    }
});
const foo = container.get('foo');

foo.getM(); // 10
foo.m = 15;
container.get('foo').getM(); // 15
```

## Registering Constants
You can register any kind of injectable values with the container.
These values can be injected in any other service using `args`.

```javascript
const config = {
    someFunction: (a, b) => a + b,
    someNumber: 10,
    someString: 'Foo bar...',
    someObject: {
        module: {
            foo: 'bar',
            bar: 'foo'
        }
    },
    foo: {
        module: (someNumber, someString) => someNumber + someString),
        args: ['someNumber', 'someString']
    },
    bar: {
        module: (someObject) => someObject.foo,
        args: ['someObject']
    }
};
```

## Return a new instance
You can register a constructor function or an ES6 class with
the container and command it to instantiate it when it is requested
directly or in other services.<br>
Use the `strategy: STRATEGY.NEW` setting for it.<br>
Heads up! This will give back a Singleton.

```javascript
const { STRATEGY } = require('node-simple-di');

const config = {
    foo: {
        module: function Foo () {
            this.name = 'Bob';
        },
        strategy: STRATEGY.NEW
    }
};
```

## Return module as it is
So it's just the same as [registering constants](#registering-constants).<br>
If you skip the config object boilerplate then the services will
resolve to the value that you defined for them.

```javascript
const config = {
    someFunction: (a, b) => a + b,
    someNumber: 10,
    someString: 'Foo bar...',
    someObject: {
        module: {
            foo: 'bar',
            bar: 'foo'
        }
    }
};
```

## Return a partially applied module
By default function services are resolved as a partially applied function.
What it means is that you can compose functions that already have certain
dependencies injected.

```javascript
const config = {
    apiBaseUrl: '/api/v2/',
    fetch: {
        module: (apiBaseUrl, url) => {
            // fetch data
        },
        args: ['apiBaseUrl']
    },
    someService: {
        module: fetch => {
            const users = fetch('users');
        },
        args: ['fetch']
    }
};
```

## Return the result of a callable module
It can happen that you would like to return the result of a function
as a service.<br>
You can use `strategy: STRATEGY.CALL` for this.

```javascript
const config = {
    host: 'localhost',
    port: 8080,
    // baseUrl will resolve to "http://localhost:8080"
    baseUrl: {
        module: (host, port) => {
            return `http://${ host }:${ port }`;
        },
        args: ['host', 'port']
    },
    someService: {
        module: baseUrl => {
            console.log(baseUrl); // "http://localhost:8080"
        },
        args: ['baseUrl']
    }
};
```

## Overwrite / Add service
You can dynamically overwrite a service or add a new one easily.

```javascript
import { getContainer } from 'node-simple-di';

const container = getContainer({
    host: 'localhost',
    port: 8080,
});

container.add('someService', {
    module: (host, port) => {
        return `http://${ host }:${ port }`;
    },
    args: ['host', 'port']
});

container.get('someService'); // "http://localhost:8080"
```