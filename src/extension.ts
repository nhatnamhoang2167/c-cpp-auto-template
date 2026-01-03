import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    const templates: Record<string, string> = {
        c:
`#include <stdio.h>

int main() {
    



	return 0;
}
`,

        cpp:
`#include <iostream>
using namespace std;

int main() {
    

	
	return 0;
}
`
    };

    async function tryInsert(doc: vscode.TextDocument) {
        const lang = doc.languageId;

        // chỉ xử lý các ngôn ngữ mình có template
        if (!templates[lang]) return;

        // chỉ chèn nếu file trống
        if (doc.getText().trim().length !== 0) return;

        // lấy editor hiện tại
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;
        if (editor.document.uri.toString() !== doc.uri.toString()) return;

        await editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(0, 0), templates[lang]);
        });
    }

    // Khi mở file
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(async (doc) => {
            await tryInsert(doc);
        })
    );

    // Khi chuyển tab/editor
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(async (editor) => {
            if (!editor) return;
            await tryInsert(editor.document);
        })
    );

    // Khi extension vừa activate, check file đang mở
    if (vscode.window.activeTextEditor) {
        tryInsert(vscode.window.activeTextEditor.document);
    }
}

export function deactivate() {}
