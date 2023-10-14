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

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}
}
