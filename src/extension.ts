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

        const cpTemplate = config.get<boolean>("enableCPTemplate", false);

        // ---------- C++ ----------
        if (lang === "cpp") {

            if (cpTemplate) {

                template =
`#include <bits/stdc++.h>
using namespace std;

int main() {

    ios::sync_with_stdio(false);
    cin.tie(nullptr);




    
    return 0;
}
`;

            } else {

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
        }

        // ---------- C ----------
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

    // file open
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(async (doc) => {
            await tryInsert(doc);
        })
    );

    // editor change
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(async (editor) => {
            if (!editor) return;
            await tryInsert(editor.document);
        })
    );

    // config change (CP template bật → clear C++ libs)
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(async (event) => {

            if (event.affectsConfiguration("ccAutoTemplate.enableCPTemplate")) {

                const config = vscode.workspace.getConfiguration("ccAutoTemplate");
                const cpEnabled = config.get<boolean>("enableCPTemplate");

                if (cpEnabled) {

                    await config.update(
                        "cppLibraries",
                        [],
                        vscode.ConfigurationTarget.Global
                    );

                    vscode.window.showInformationMessage(
                        "Competitive Programming Template enabled. C++ libraries cleared."
                    );
                }
            }
        })
    );

    // run when extension starts
    if (vscode.window.activeTextEditor) {
        tryInsert(vscode.window.activeTextEditor.document);
    }
}

export function deactivate() {}