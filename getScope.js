module.exports = {
  forProgram: forProgram,
  forFunction: forFunction
}

//+ @type Node = { type: String }
//+ @type AST = Node
//+ @type Scope = Object
//+ @type Index = String | Number

var fu = require('fu')

function traverse(object, visitor) {
  function walkTree(key) {
    var child = object[key]
    var type = toString.call(child)
    return type == '[object Object]' || type == '[object Array]'
      ? traverse(child, visitor)
      : null
  }
  return fu.compact(
    [visitor(object)].concat(
      fu.concatMap(walkTree, Object.keys(object))))
}

function getPropertyValue(x) {
  return x.name || x.value
}

function array_replace(arr, index, value) {
  var xarr = arr.slice()
  xarr[index] = value
  return xarr
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

//+ fromProperties :: [Node] -> Object
function fromProperties(obj) {
  return fu.intoObject(fu.map(function (x) {
    return [getPropertyValue(x.key), x.value]
  }, obj))
}

//+ toProperties :: Object -> [Node]
// Note:
// toProperties does not export a Mozilla parse API compatible AST!
// In the case where one assigns a property to an ArrayExpression
//   eg: var a = []; a['hello'] = 'world'
// this will be condensed into the following object:
//   { type: 'ArrayExpression',
//     elements: [hello: { type: 'Literal', value: 'world' }] }
// this property can then be accessed by using `obj.elements.hello`
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

//+ lookupChain :: Node -> [Node]
function lookupChain(node) {
  return node.type == 'MemberExpression'
    ? [node.property].concat(lookupChain(node.object))
    : node
}

//+ replaceOrAdd :: Node, Index, Node -> Node
function replaceOrAdd(node, index, value) {
  switch (node.type) {
    case 'ArrayExpression':
      return {
        type: 'ArrayExpression',
        elements: array_replace(node.elements, index, value)
      }
    case 'ObjectExpression':
      return {
        type: 'ObjectExpression',
        properties: toProperties(fu.merge(
          fromProperties(node.properties),
          fu.intoObject([[index, value]])
        ))
      }
    default:
      throw new TypeError('Invalid type specified: ' + node.type)
  }
}

//+ getValueFromIndex :: Node, Index -> Maybe Node
function getValueFromIndex(node, index) {
  switch (node.type) {
    case 'ArrayExpression':
      return node.elements[index]
    case 'ObjectExpression':
      return fromProperties(node.properties)[index]
    default:
      throw new TypeError('Invalid type specified: ' + node.type)
  }
}

//+ setCollectionValue :: Node, [Index], Node -> Node
function setCollectionValue(node, indices, value) {
  if (!node || !indices.length) {
    return value
  }

  var index = fu.head(indices)
  var rest = fu.tail(indices)

  return replaceOrAdd(
    node,
    index,
    setCollectionValue(getValueFromIndex(node, index), rest, value)
  )
}

//+ parseAssignment :: Scope, Node, Node -> [String, Node]
function parseAssignment(scope, node, value) {
  var obj = lookupChain(node)
  var ref = fu.last(obj).name

  if (!scope.hasOwnProperty(ref)) {
    throw new Error('Undefined variable ' + ref)
  }

  var indices = fu.map(getPropertyValue, fu.init(obj).reverse())

  return [ref, setCollectionValue(scope[ref], indices, value)]
}

//+ parseNode :: Node, Scope -> Maybe [String, Node]
function parseNode(node, scope) {
  switch (node.type) {
    case 'ExpressionStatement':
      return parseNode(node.expression, scope)
    case 'VariableDeclarator':
      return [node.id.name, node.init]
    case 'AssignmentExpression':
      return node.left.type == 'Identifier'
        ? [node.left.name, node.right]
        : parseAssignment(scope, node.left, node.right)
    case 'FunctionDeclaration':
      return [node.id.name, node]
  }
}

//+ forProgram :: AST, Scope -> Scope
function forProgram(ast, globalScope) {
  globalScope = globalScope || {}

  if (ast.type != 'Program') {
    throw new Error('forProgram is for getting global scope')
  }

  var scope = fu.merge({}, globalScope)

  var localScope = fu.foldl(function (scope, node) {
    var self = []

    // XXX what if var declarations are hidden inside an if statement or something?
    switch (node.type) {
      case 'VariableDeclaration':
        self = fu.map(function (x) {
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

    return fu.merge(scope, fu.intoObject(self))
  }, ast.body, {})

  return fu.merge(globalScope, localScope)
}

//+ forFunction :: AST, Scope, [AST] -> Scope
function forFunction(ast, globalScope, params) {
  globalScope = globalScope || {}

  if (!isFunction(ast)) {
    throw new Error('forFunction is for getting function scope')
  }

  var paramScope = fu.intoObject(fu.zipWith(function (node, value) {
    return [node.name, value]
  }, ast.params, params))

  var scope = fu.merge(globalScope, paramScope)

  var functionBodyNodes = traverse(ast, function (node) {
    switch (node.type) {
      case 'ExpressionStatement':
      case 'VariableDeclarator':
      case 'AssignmentExpression':
      case 'FunctionDeclaration':
        return node
      default:
        return null
    }
  })

  return fu.foldl(function (scope, node) {
    var localScope = fu.intoObject([parseNode(node, scope)])
    return fu.merge(scope, localScope)
  }, functionBodyNodes, scope)
}
