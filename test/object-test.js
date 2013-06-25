module.exports = function (getScope, assert, ast) {
  function assertObj(node) {
    assert.equal(node.type, 'ObjectExpression')
  }

  function hasProp(obj, key, value) {
    assert.ok(obj.properties.filter(function (prop) {
      return (prop.key.name || prop.key.value) == key &&
        prop.value.value === value
    }).pop(), 'Error: for key `' + key + '` value ' + value)
  }

  function hasProps(obj, vals) {
    Object.keys(vals).forEach(function (key) {
      hasProp(obj, key, vals[key])
    })
  }

  var scope = getScope.forProgram(ast.object)

  return {
    'are all of type ObjectExpression': function () {
      assertObj(scope.x)
      assertObj(scope.y)
      assertObj(scope.z)
      assertObj(scope.a)
      assertObj(scope.b)
    },

    'objects have properties': function () {
      hasProps(scope.x, {
        a: 1,
        b: 4,
        c: 3
      })
      hasProps(scope.y, { a: 2 })
      hasProps(scope.z, { a: 1 })
      hasProps(scope.a, { '1': 1 })
      hasProps(scope.b, {
        c: 'dc',
        '4': '12'
      })
    }
  }
}
