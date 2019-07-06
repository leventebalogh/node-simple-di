const isNumber = require('lodash/isNumber');
const isObject = require('lodash/isObject');
const isNull = require('lodash/isNull');
const isBoolean = require('lodash/isBoolean');
const isString = require('lodash/isString');
const isEmpty = require('lodash/isEmpty');
const isUndefined = require('lodash/isUndefined');
const isFunction = require('lodash/isFunction');
const partial = require('lodash/partial');

const STRATEGY = {
    PARTIAL: 'PARTIAL',
    CONSTANT: 'CONSTANT',
    RETURN: 'RETURN',
    CALL: 'CALL',
    NEW: 'NEW'
};

module.exports = {
    getContainer,
    STRATEGY
};

function getContainer (config) {
    const cache = {};

    return {
        get: partial(get, cache, config),
        set: partial(set, cache, config)
    };
}

function get (cache = {}, config, name) {
    const cached = cache[name];

    if (!isUndefined(cached)) {
        return cached;
    }

    cache[name] = instantiateService(config, name, cache);

    return cache[name];
}

function set (cache, config, name, definition) {
    delete cache[name];

    config[name] = definition;
}

function instantiateService (config, serviceName, cache) {
    const serviceDefinition = config[serviceName];

    if (isUndefined(serviceDefinition)) {
        return null;
    }

    if (isSimpleValue(serviceDefinition)) {
        return serviceDefinition;
    }

    const { module } = serviceDefinition;
    const strategy = getStrategy(serviceDefinition);
    const args = resolveArgs(config, serviceName, cache);

    switch (strategy) {
        case STRATEGY.PARTIAL:
            return instantiatePartial(module, args);

        case STRATEGY.CALL:
            return instantiateCall(module, args);

        case STRATEGY.NEW:
            return instantiateNew(module, args);

        case STRATEGY.RETURN:
            return module;

        case STRATEGY.CONSTANT:
            return serviceDefinition;

        default:
            return instantiatePartial(module, args);
    }
}

function isSimpleValue (value) {
    if (
        isString(value) ||
        isBoolean(value) ||
        isNumber(value) ||
        isNull(value)
    ) {
        return true;
    }

    return false;
}

function resolveArgs (config, serviceName, cache) {
    const args = config[serviceName].args;

    if (isEmpty(args)) {
        return [];
    }

    return args.map(arg => resolveArg(config, arg, cache));
}

function resolveArg (config, arg, cache) {
    if (!isUndefined(config[arg])) {
        return get(cache, config, arg);
    }

    return arg;
}

function instantiatePartial (module, args) {
    return partial(module, ...args);
}

function instantiateCall (module, args) {
    return module(...args);
}

function instantiateNew (module, args) {
    return new module(...args);
}

function getStrategy (serviceDefinition) {
    const { module, strategy } = serviceDefinition;

    if (strategy) {
        return strategy;
    }

    if (isNumber(serviceDefinition) || isString(serviceDefinition) || isFunction(serviceDefinition)) {
        return STRATEGY.CONSTANT;
    }

    if (isFunction(module)) {
        return STRATEGY.PARTIAL;
    }

    return STRATEGY.RETURN;
}
