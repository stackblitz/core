const ts = require('typescript');

module.exports = function parseImports(contents) {
  const paths = [];

  function findChildImports(node) {
    if (
      node.kind === ts.SyntaxKind.ImportDeclaration ||
      (node.kind === ts.SyntaxKind.ExportDeclaration && node.moduleSpecifier)
    ) {
      paths.push(node.moduleSpecifier.text);
    } else if (
      node.kind === ts.SyntaxKind.CallExpression &&
      node.arguments &&
      node.arguments.length
    ) {
      if (
        node.expression.text === 'require' &&
        node.arguments[0].kind === ts.SyntaxKind.StringLiteral
      ) {
        paths.push(node.arguments[0].text);
      }

      if (
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments[0].text
      ) {
        paths.push(node.arguments[0].text);
      }

      if (
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          node.expression.text === 'require') &&
        node.arguments[0].kind === ts.SyntaxKind.TemplateExpression &&
        node.arguments[0].head.kind === ts.SyntaxKind.TemplateHead
      ) {
        paths.push(node.arguments[0].head.text);
      }

      if (
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          node.expression.text === 'require') &&
        node.arguments[0].kind === ts.SyntaxKind.BinaryExpression &&
        node.arguments[0].left.kind === ts.SyntaxKind.StringLiteral
      ) {
        paths.push(node.arguments[0].left.text);
      }
    }
    ts.forEachChild(node, findChildImports);
  }

  ts.forEachChild(
    ts.createSourceFile(
      'any',
      contents,
      ts.ScriptTarget.ES2015,
      true,
      ts.ScriptKind.JSX
    ),
    findChildImports
  );

  return paths;
};
