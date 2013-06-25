module.exports = {
  forProgram: forProgram,
  forFunction: forFunction
}

var fn = require('fn')

function traverse(object, visitor) {
  function walkTree(key) {
    var child = object[key]
    var type = fn.toString(child)
    return type == '[object Object]' || type == '[object Array]'
      ? traverse(child, visitor)
      : null
  }
  return fn.compact(
    [visitor(object)].concat(
      fn.concatMap(walkTree, Object.keys(object))))
}

function merge(arr) {
  return fn.foldl(function (scope, x) {
    return fn.mergeInto(scope, x)
  }, arr, {})
}

function isFunction(node) {
  switch (node.type) {
    case 'FunctionExpression':
    case 'FunctionDeclaration':
      return true
    default:
      return false
  }
}

function fromProperties(obj) {
  return fn.toMap(fn.map(function (x) {
    return [x.key.name, x.value]
  }, obj))
}

function toProperties(obj) {
  return Object.keys(obj).map(function (key) {
    return {
      type: 'Property',
      key: { type: 'Identifier', name: key },
      value: obj[key],
      kind: 'init'
    }
  })
}

//function lookup(scope, node) {
//  switch (node.type) {
//    case 'Identifier':
//      if (!scope.hasOwnProperty(node.name)) {
//        console.error(node)
//        throw new Error('undefined ' + node.name)
//      }
//      return scope[node.name]
//    case 'MemberExpression':
//      console.log('step', node)
//      return lookup(scope, node.object)
//    default:
//      throw new Error('WTF')
//  }
//}

// XXX write tests for Arrays, Objects, and both Chained
// eg: a[0] = 4
// a.b = 2
// a.b.c.d = 4
// a[0][1] = 3
// XXX TODO chained...eg: x.a.b.c.d = 4
function assign(scope, node, value) {
  var ref = node.object.name

  if (!scope.hasOwnProperty(ref)) {
    throw new Error('undefined ' + ref)
  }

  // XXX can be another object!
  var key = node.property

  switch (scope[ref].type) {
    case 'ObjectExpression':
      return [ref, {
        type: 'ObjectExpression',
        properties: toProperties(merge([
          fromProperties(scope[ref].properties),
          fn.toMap([[key.name, value]])
        ]))
      }]
    case 'ArrayExpression':
      var elements = scope[ref].elements.slice()
      elements[key.value] = value
      return [ref, {
        type: 'ArrayExpression',
        elements: elements
      }]
    default:
      throw new Error('WTF')
  }
}

function parseNode(node, scope) {
  switch (node.type) {
    case 'ExpressionStatement':
      return parseNode(node.expression, scope)
    case 'VariableDeclarator':
      return [node.id.name, node.init]
      break
    case 'AssignmentExpression':
      return node.left.type == 'Identifier'
        ? [node.left.name, node.right]
        : assign(scope, node.left, node.right)
      break
    case 'FunctionDeclaration':
      return [node.id.name, node]
      break
    default:
      return null
  }
}

// XXX this is tricky because `a = 4` without declaring `a` locally is a global
// so what i have to do is check for any CallExpressions and then go through those functions
// inside those functions if there are any AssignmentExpressions where there aren't any local variables set then it's a global
function forProgram(ast, globalScope) {
  globalScope = globalScope || {}

  if (ast.type != 'Program') {
    throw new Error('forProgram is for getting global scope')
  }

  var scope = merge([{}, globalScope])

  var localScope = fn.foldl(function parseProgramNode(scope, node) {
    var self = []

    switch (node.type) {
      case 'VariableDeclaration':
        self = fn.map(function (x) {
          return x.type == 'VariableDeclarator'
            ? [x.id.name, x.init]
            : []
        }, node.declarations)
        break
      default:
        var value = parseNode(node, scope)
        self = value == null
          ? []
          : [value]
    }

    return merge([scope, fn.toMap(self)])
  }, ast.body, {})

  return merge([globalScope, localScope])
}

function forFunction(ast, globalScope, params) {
  globalScope = globalScope || {}

  if (!isFunction(ast)) {
    throw new Error('forFunction is for getting function scope')
  }

  var paramScope = fn.toMap(fn.zipWith(function (node, value) {
    return [node.name, value]
  }, ast.params, params))

  var scope = merge([globalScope, paramScope])

  var localScope = fn.toMap(fn.compact(traverse(ast, function (node) {
    return parseNode(node, scope)
  })))

  return merge([scope, localScope])
}
