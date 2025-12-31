import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface Obsidian64Settings {
	iterations: number;
}

const DEFAULT_SETTINGS: Obsidian64Settings = {
	iterations: 1
}

export default class Obsidan64 extends Plugin {
	settings: Obsidian64Settings;

	async onload() {
		await this.loadSettings();

		// This allows for encoding to Base64
		this.addCommand({
			id: 'encode-to-base64',
			name: 'Encode to Base64',
			icon: 'lock',
			editorCallback: (editor: Editor) => {
				try {
					const selection = editor.getSelection();
					if (!selection) {
						new Notice('No text selected');
						return;
					}

					let encoded = selection;

					// Encode (iterations - 1) times
					for (let i = 0; i < this.settings.iterations - 1; i++) {
						encoded = btoa(encoded);
					}

					// Add the marker before the final encoding
					encoded = `[OBS64:${this.settings.iterations}]${encoded}`;

					// Encode one final time
					encoded = btoa(encoded);

					editor.replaceSelection(encoded);
				} catch (error) {
					new Notice('Error encoding to Base64: ' + error.message);
				}
			}
		});

		// This allows for decoding from Base64
		this.addCommand({
			id: 'decode-from-base64',
			name: 'Decode From Base64',
			icon: 'unlock',
			editorCallback: (editor: Editor) => {
				try {
					const selection = editor.getSelection();
					if (!selection) {
						new Notice('No text selected');
						return;
					}

					// Decode once to check for iteration marker
					let decoded = atob(selection);

					// Check if the decoded text contains our marker
					const markerMatch = decoded.match(/^\[OBS64:(\d+)\]/);
					if (markerMatch) {
						const iterations = parseInt(markerMatch[1], 10);
						// Remove the marker
						decoded = decoded.replace(/^\[OBS64:\d+\]/, '');
						// Decode the remaining (iterations - 1) times
						for (let i = 0; i < iterations - 1; i++) {
							decoded = atob(decoded);
						}
					}
					// If no marker found, we already decoded once (backwards compatible)

					editor.replaceSelection(decoded);
				} catch (error) {
					new Notice('Error decoding from Base64: ' + error.message);
				}
			}
		});

		// Add settings tab
		this.addSettingTab(new Obsidian64SettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class Obsidian64SettingTab extends PluginSettingTab {
	plugin: Obsidan64;

	constructor(app: App, plugin: Obsidan64) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Iterations')
			.setDesc('Number of times to encode text (1-15). Higher values provide more obfuscation but may impact performance.')
			.addSlider(slider => slider
				.setLimits(1, 15, 1)
				.setValue(this.plugin.settings.iterations)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.iterations = value;
					await this.plugin.saveSettings();
				}));
	}
}