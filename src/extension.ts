'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

//let curEditor;

class TDCP implements vscode.TextDocumentContentProvider {

    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    private ownUri:vscode.Uri;

    public setOwnUri(uri:vscode.Uri) {
        this.ownUri = uri;
    }

    public provideTextDocumentContent(uri:vscode.Uri): string {
        const curEditor = vscode.window.activeTextEditor;
        const docUri = curEditor.document.uri;
        const docExt = curEditor.document.fileName.search(".") > 0 ? curEditor.document.fileName.split(".").slice(-1)[0] : "";
        const docSymbols = this.enumSymbols(curEditor.document.getText());
        const mdText = this.toHTML(docSymbols,docUri);
        return mdText;
    }

    public update(uri:vscode.Uri) {
        this._onDidChange.fire(uri);
    }

    private toHTML(arr:Array<Object>,uri:vscode.Uri): string {
        return "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"UTF-8\">\n<title>Code Structure Preview</title>\n</head>\n<body>\n<ul>\n" +
            arr.map(obj=>"  <li/>"+obj["kind"]+" <a href=\""+uri.toString()+"#"+obj["line"]+","+obj["col"]+"\" target=_parent>"+obj["name"]+"</a>").join("\n") +
            "\n</body>\n</html>";
    }

    private enumSymbols(text:string) {
        // TODO: add symbols that are not functions
        // TODO: add languages / language symbol definitions / parsers
        var syms;
        let splitByLine = text.split(/\n/);
        let functionLines = [];
        for (let i=0; i<splitByLine.length; i++) {
            let fnd = splitByLine[i].match(/\bfunction\b\s+(.+)[\s(]/);
            if(fnd != null) {
                functionLines.push({"name":fnd[1],"line":i+1,"col":fnd.index+"function ".length,"kind":"function"});
            }
        }
        /*
        let splitByFunction = text.split(/function\s+/);
        if (splitByFunction.length>0) {
            let functionNames = splitByFunction.map(x=>x.split(/\s/)[0]).filter(x=>x.length>0);
            syms = functionNames.map(x=>{return {"name":x, "line":0, "col":0, "kind": "function"}}); // TODO: parse by lines, not by keyword
        } else {
            syms = {};
        }*/
        return functionLines;
    }

}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    //console.log('Congratulations, your extension "hello" is now active!');

    let previewUri = vscode.Uri.parse("code-structure://the/preview");

    let provider = new TDCP();
    provider.setOwnUri(previewUri);
    let registration = vscode.workspace.registerTextDocumentContentProvider("code-structure",provider);

    vscode.workspace.onDidChangeTextDocument((e:vscode.TextDocumentChangeEvent) => {
        if (e.document === vscode.window.activeTextEditor.document) {
            provider.update(previewUri);
        }
    });

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('code.preview', () => {
        return vscode.commands.executeCommand("vscode.previewHtml", previewUri, vscode.ViewColumn.Two, "Code Structure Preview").then((success)=>{
        }, (reason)=>{ vscode.window.showErrorMessage(reason); });

    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}