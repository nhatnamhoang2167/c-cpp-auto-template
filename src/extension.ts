import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    async function tryInsert(doc: vscode.TextDocument) {

        const lang = doc.languageId;

        if (doc.getText().trim().length !== 0) return;
        if (lang !== "c" && lang !== "cpp") return;

        const editor = vscode.window.activeTextEditor;
        if (!editor) return;
        if (editor.document.uri.toString() !== doc.uri.toString()) return;

        const config = vscode.workspace.getConfiguration("ccAutoTemplate");

        let libs: string[] = [];
        let template = "";

        if (lang === "cpp") {

            libs = config.get<string[]>("cppLibraries", ["iostream"]);
            const includes = libs.map(lib => `#include <${lib}>`).join("\n");

            template =
`${includes}

using namespace std;


int main() {
    
    

    return 0;
}
`;
        }

        if (lang === "c") {

            libs = config.get<string[]>("cLibraries", ["stdio.h"]);
            const includes = libs.map(lib => `#include <${lib}>`).join("\n");

            template =
`${includes}


int main() {
    
    

    return 0;
}
`;
        }

        await editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(0, 0), template);
        });
    }

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(async (doc) => {
            await tryInsert(doc);
        })
    );

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(async (editor) => {
            if (!editor) return;
            await tryInsert(editor.document);
        })
    );

    if (vscode.window.activeTextEditor) {
        tryInsert(vscode.window.activeTextEditor.document);
    }
}

export function deactivate() {}