# get-scope

[![Build Status](https://secure.travis-ci.org/goatslacker/get-scope.png)](http://travis-ci.org/goatslacker/get-scope)
[![NPM version](https://badge.fury.io/js/get-scope.png)](http://badge.fury.io/js/get-scope)

## Install

    npm install get-scope

## Usage

    var esprima = require('esprima')
    var getScope = require('get-scope')

    var ast = esprima.parse('var a = 1')

    getScope.forProgram(ast) // { a: { type: 'Literal', value: 1 } }

## License

[MIT](http://josh.mit-license.org)
