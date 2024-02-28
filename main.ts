import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

export default class Obsidan64 extends Plugin {

	async onload() {
		
		// This allows for encoding to Base64
		this.addCommand({
			id: 'encode-to-base64',
			name: 'Encode to Base64',
			icon: 'lock',
			editorCallback: (editor: Editor) => {
				const selection = editor.getSelection();
				editor.replaceSelection(btoa(selection));
			}
		});
		
		// This allows for decoding from Base64
		this.addCommand({
			id: 'decode-from-base64',
			name: 'Decode From Base64',
			icon: 'unlock',
			editorCallback: (editor: Editor) => {
				const selection = editor.getSelection();
				editor.replaceSelection(atob(selection));
			}
		});
	}

	onunload() {

	}
}
