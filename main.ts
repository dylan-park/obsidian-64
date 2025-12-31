import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, Menu } from 'obsidian';

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

		// Encode selected text to Base64
		this.addCommand({
			id: 'encode-to-base64',
			name: 'Encode Selected Text to Base64',
			icon: 'lock',
			editorCallback: (editor: Editor) => {
				try {
					const selection = editor.getSelection();
					if (!selection) {
						new Notice('No text selected');
						return;
					}

					const encoded = this.encodeText(selection);
					editor.replaceSelection(encoded);
				} catch (error) {
					new Notice('Error encoding to Base64: ' + error.message);
				}
			}
		});

		// Decode selected text from Base64
		this.addCommand({
			id: 'decode-from-base64',
			name: 'Decode Selected Text from Base64',
			icon: 'unlock',
			editorCallback: (editor: Editor) => {
				try {
					const selection = editor.getSelection();
					if (!selection) {
						new Notice('No text selected');
						return;
					}

					const decoded = this.decodeText(selection);
					editor.replaceSelection(decoded);
				} catch (error) {
					new Notice('Error decoding from Base64: ' + error.message);
				}
			}
		});

		// Encode current file to Base64
		this.addCommand({
			id: 'encode-current-file',
			name: 'Encode Current File to Base64',
			icon: 'lock',
			callback: async () => {
				const file = this.app.workspace.getActiveFile();
				if (!file) {
					new Notice('No active file');
					return;
				}

				if (file.extension !== 'md') {
					new Notice('This command only works with markdown files');
					return;
				}

				const confirmed = await this.confirmAction('encode', file.name);
				if (!confirmed) return;

				try {
					await this.encodeFile(file);
					new Notice('File encoded successfully');
				} catch (error) {
					new Notice('Error encoding file: ' + error.message);
				}
			}
		});

		// Decode current file from Base64
		this.addCommand({
			id: 'decode-current-file',
			name: 'Decode Current File from Base64',
			icon: 'unlock',
			callback: async () => {
				const file = this.app.workspace.getActiveFile();
				if (!file) {
					new Notice('No active file');
					return;
				}

				if (file.extension !== 'md') {
					new Notice('This command only works with markdown files');
					return;
				}

				const confirmed = await this.confirmAction('decode', file.name);
				if (!confirmed) return;

				try {
					await this.decodeFile(file);
					new Notice('File decoded successfully');
				} catch (error) {
					new Notice('Error decoding file: ' + error.message);
				}
			}
		});

		// Add file menu options (right-click context menu)
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu: Menu, file: TFile) => {
				if (file.extension === 'md') {
					menu.addItem((item) => {
						item
							.setTitle('Encode File to Base64')
							.setIcon('lock')
							.onClick(async () => {
								const confirmed = await this.confirmAction('encode', file.name);
								if (!confirmed) return;

								try {
									await this.encodeFile(file);
									new Notice('File encoded successfully');
								} catch (error) {
									new Notice('Error encoding file: ' + error.message);
								}
							});
					});

					menu.addItem((item) => {
						item
							.setTitle('Decode File from Base64')
							.setIcon('unlock')
							.onClick(async () => {
								const confirmed = await this.confirmAction('decode', file.name);
								if (!confirmed) return;

								try {
									await this.decodeFile(file);
									new Notice('File decoded successfully');
								} catch (error) {
									new Notice('Error decoding file: ' + error.message);
								}
							});
					});
				}
			})
		);

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

	// Encode text with current iteration settings
	encodeText(text: string): string {
		let encoded = text;

		// If iterations is 1, just do simple Base64 encoding
		if (this.settings.iterations === 1) {
			encoded = btoa(encoded);
		} else {
			// Encode (iterations - 1) times
			for (let i = 0; i < this.settings.iterations - 1; i++) {
				encoded = btoa(encoded);
			}

			// Add the marker at the end before the final encoding
			encoded = `${encoded}::${this.settings.iterations}`;

			// Encode one final time
			encoded = btoa(encoded);
		}

		return encoded;
	}

	// Decode text, auto-detecting iteration count
	decodeText(text: string): string {
		// Remove any whitespace characters that might have been added
		const cleanText = text.replace(/\s/g, '');

		// Decode once to check for iteration marker
		let decoded = atob(text);

		// Check if the decoded text contains our marker at the end
		const markerMatch = decoded.match(/::(\d+)$/);
		if (markerMatch) {
			const iterations = parseInt(markerMatch[1], 10);
			// Remove the marker
			decoded = decoded.replace(/::(\d+)$/, '');
			// Decode the remaining (iterations - 1) times
			for (let i = 0; i < iterations - 1; i++) {
				decoded = atob(decoded);
			}
		}
		// If no marker found, we already decoded once (backwards compatible)

		return decoded;
	}

	// Encode entire file
	async encodeFile(file: TFile): Promise<void> {
		const content = await this.app.vault.read(file);
		const { frontmatter, body } = this.splitFrontmatter(content);
		const encoded = this.encodeText(body);
		const finalContent = frontmatter ? `${frontmatter}\n${encoded}` : encoded;
		await this.app.vault.modify(file, finalContent);
	}

	// Decode entire file
	async decodeFile(file: TFile): Promise<void> {
		const content = await this.app.vault.read(file);
		const { frontmatter, body } = this.splitFrontmatter(content);
		const trimmedBody = body.trim();
		const decoded = this.decodeText(trimmedBody);
		const finalContent = frontmatter ? `${frontmatter}\n${decoded}` : decoded;
		await this.app.vault.modify(file, finalContent);
	}

	// Split frontmatter from body content
	splitFrontmatter(content: string): { frontmatter: string | null, body: string } {
		// Check if content starts with frontmatter (---)
		if (content.startsWith('---\n') || content.startsWith('---\r\n')) {
			// Find the closing ---
			const lines = content.split('\n');
			let endIndex = -1;

			for (let i = 1; i < lines.length; i++) {
				if (lines[i].trim() === '---') {
					endIndex = i;
					break;
				}
			}

			if (endIndex !== -1) {
				// Found valid frontmatter
				const frontmatter = lines.slice(0, endIndex + 1).join('\n');
				const body = lines.slice(endIndex + 1).join('\n').trimStart();
				return { frontmatter, body };
			}
		}

		// No frontmatter found
		return { frontmatter: null, body: content };
	}

	// Show confirmation modal
	async confirmAction(action: string, fileName: string): Promise<boolean> {
		return new Promise((resolve) => {
			const modal = new ConfirmationModal(
				this.app,
				`${action === 'encode' ? 'Encode' : 'Decode'} entire file?`,
				`Are you sure you want to ${action} the entire contents of "${fileName}"? This will replace all file content.`,
				resolve
			);
			modal.open();
		});
	}
}

class ConfirmationModal extends Modal {
	private title: string;
	private message: string;
	private resolve: (value: boolean) => void;

	constructor(app: App, title: string, message: string, resolve: (value: boolean) => void) {
		super(app);
		this.title = title;
		this.message = message;
		this.resolve = resolve;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h2', { text: this.title });
		contentEl.createEl('p', { text: this.message });

		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });

		const confirmButton = buttonContainer.createEl('button', { text: 'Confirm', cls: 'mod-cta' });
		confirmButton.addEventListener('click', () => {
			this.resolve(true);
			this.close();
		});

		const cancelButton = buttonContainer.createEl('button', { text: 'Cancel' });
		cancelButton.addEventListener('click', () => {
			this.resolve(false);
			this.close();
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
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