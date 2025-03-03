import fs from 'fs';
import ts from 'typescript';
import { createElement } from '../../element';
import { parseJSX } from '../jsxParser';
import { off } from 'process';

interface FunctionDetails {
    name: string;
    params: string[];
    returnStatements: JSX[];
    body: string;
    containsJSX: boolean;
}

/**
 * Checks if a node contains JSX elements and replaces them.
 * @param node - TypeScript AST node.
 * @returns Transformed node text if JSX is found.
 */
function transformJSX(node: ts.Node | string): JSX {
    if(typeof node === 'string') {
        return node
    }

    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {

        const parsedCode = parseJSX(node.getText())
        console.log(parsedCode)
    return `createElement(${JSON.stringify(parsedCode)})`
        // const element = parsedCode && createElement(parsedCode)
        // return element
    }
}

/**
 * Extracts function details from a function node.
 * @param node - TypeScript AST function node.
 */
function extractFunctionDetails(node: ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression, funcName: string): FunctionDetails {
    const params: string[] = node.parameters.map(param => {
        if (ts.isIdentifier(param.name)) {
            return param.name.text;
        } else if (ts.isObjectBindingPattern(param.name) || ts.isArrayBindingPattern(param.name)) {
            return param.name.getText();
        }
        return '';
    });

    let returnStatements: JSX[] = [];
    let body: string = node.body ? node.body.getText() : '';
    let jsxFound = false;

    function findReturnStatements(node: ts.Node): void {
        if (ts.isReturnStatement(node) && node.expression) {
            const transformedJSX = transformJSX(node.expression) ||transformJSX(node.expression.getText()) ;
            console.log({return: transformedJSX})
            // modifiedContent = modifiedContent.replace(decl.initializer.getText(), JSON.stringify(transformedJSX));

            // returnStatements.push(transformedJSX);

            if (transformedJSX) {
                returnStatements.push(transformedJSX);
                // jsxFound = true;
            } else {
                console.log({eee:node.expression.getText()})
                returnStatements.push(node.expression.getText());
            }
        }
        ts.forEachChild(node, findReturnStatements);
    }

    ts.forEachChild(node, findReturnStatements);

    return { name: funcName, params, returnStatements, body, containsJSX: jsxFound };
}

type JSX = HTMLElement | Text | string | undefined

/**
 * Reads a JS file and extracts function definitions, their parameters, return values, and body.
 * Also detects if any variable declarations contain JSX and replaces them.
 * @param filePath - Path to the JS file.
 * @returns List of extracted function details and variables containing JSX.
 */
export function parseJSFile(filePath: string): { functions: FunctionDetails[], jsxVariables: string[], modifiedContent: string } {
    let fileContent: string = fs.readFileSync(filePath, 'utf8');

    // Parse the file content into AST
    const sourceFile = ts.createSourceFile(
        filePath,
        fileContent,
        ts.ScriptTarget.ESNext,
        true
    );
    const functions: FunctionDetails[] = [];
    const jsxVariables: string[] = [];
    let modifiedContent = fileContent;

    function visit(node: ts.Node): void {
        if (ts.isFunctionDeclaration(node) && node.name) {

            // modify content here
            functions.push(extractFunctionDetails(node, node.name.text));
            ts.forEachChild(node, visit);
            return
        } 
        
        if (ts.isVariableStatement(node)) {
            node.declarationList.declarations.forEach(decl => {
                if (ts.isIdentifier(decl.name) && decl.initializer) {
                    const transformedJSX = transformJSX(decl.initializer);
                    console.log(transformedJSX)

                    if (transformedJSX) {
                        jsxVariables.push(decl.name.text);
                        modifiedContent = modifiedContent.replace(decl.initializer.getText(), JSON.stringify(transformedJSX));
                    }
                    if (ts.isArrowFunction(decl.initializer)) {
                        functions.push(extractFunctionDetails(decl.initializer, decl.name.text));
                    }
                }
            });
        }
        
        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    return { functions, jsxVariables, modifiedContent };
}
