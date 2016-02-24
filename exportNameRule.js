"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Lint = require('tslint/lib/lint');
var ErrorTolerantWalker = require('./utils/ErrorTolerantWalker');
var Utils = require('./utils/Utils');
var SyntaxKind = require('./utils/SyntaxKind');
var AstUtils = require('./utils/AstUtils');
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ExportNameWalker(sourceFile, this.getOptions()));
    };
    Rule.getExceptions = function (options) {
        if (options.ruleArguments instanceof Array) {
            return options.ruleArguments[0];
        }
        if (options instanceof Array) {
            return options;
        }
        return null;
    };
    Rule.FAILURE_STRING = 'The exported module or identifier name must match the file name. Found: ';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var ExportNameWalker = (function (_super) {
    __extends(ExportNameWalker, _super);
    function ExportNameWalker() {
        _super.apply(this, arguments);
    }
    ExportNameWalker.prototype.visitSourceFile = function (node) {
        var _this = this;
        var exportedTopLevelElements = [];
        node.statements.forEach(function (element) {
            if (element.kind === SyntaxKind.current().ExportAssignment) {
                var exportAssignment = element;
                _this.validateExport(exportAssignment.expression.getText(), exportAssignment.expression);
            }
            else if (AstUtils.hasModifier(element.modifiers, SyntaxKind.current().ExportKeyword)) {
                exportedTopLevelElements.push(element);
            }
        });
        this.validateExportedElements(exportedTopLevelElements);
    };
    ExportNameWalker.prototype.validateExportedElements = function (exportedElements) {
        if (exportedElements.length === 1) {
            if (exportedElements[0].kind === SyntaxKind.current().ModuleDeclaration ||
                exportedElements[0].kind === SyntaxKind.current().ClassDeclaration ||
                exportedElements[0].kind === SyntaxKind.current().FunctionDeclaration) {
                this.validateExport(exportedElements[0].name.text, exportedElements[0]);
            }
            else if (exportedElements[0].kind === SyntaxKind.current().VariableStatement) {
                var variableStatement = exportedElements[0];
                if (variableStatement.declarationList.declarations.length === 1) {
                    var variableDeclaration = variableStatement.declarationList.declarations[0];
                    this.validateExport(variableDeclaration.name.text, variableDeclaration);
                }
            }
        }
    };
    ExportNameWalker.prototype.validateExport = function (exportedName, node) {
        var regex = new RegExp(exportedName + '\..*');
        if (!regex.test(this.getFilename())) {
            if (!this.isSuppressed(exportedName)) {
                var failureString = Rule.FAILURE_STRING + this.getSourceFile().fileName + ' and ' + exportedName;
                var failure = this.createFailure(node.getStart(), node.getWidth(), failureString);
                this.addFailure(failure);
            }
        }
    };
    ExportNameWalker.prototype.getFilename = function () {
        var filename = this.getSourceFile().fileName;
        var lastSlash = filename.lastIndexOf('/');
        if (lastSlash > -1) {
            return filename.substring(lastSlash + 1);
        }
        return filename;
    };
    ExportNameWalker.prototype.isSuppressed = function (exportedName) {
        var allExceptions = Rule.getExceptions(this.getOptions());
        return Utils.exists(allExceptions, function (exception) {
            return new RegExp(exception).test(exportedName);
        });
    };
    return ExportNameWalker;
}(ErrorTolerantWalker));
exports.ExportNameWalker = ExportNameWalker;
//# sourceMappingURL=exportNameRule.js.map