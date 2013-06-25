module.exports = {
  array: function (getScope, assert, ast) {
    var globalScope = getScope.forProgram(ast.array)
    assert.equal(globalScope.a.type, 'ArrayExpression')
    assert.equal(globalScope.a.elements[0].value, 0)
  }
}
