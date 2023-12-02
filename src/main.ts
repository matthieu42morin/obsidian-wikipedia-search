import { Editor, Notice, Plugin, addIcon } from "obsidian";
import { LinkArticleModal } from "./commands/linkArticles";
import {
	DEFAULT_SETTINGS,
	DEFAULT_TEMPLATE,
	WikipediaSearchSettings,
	WikipediaSearchSettingTab,
} from "./settings";
import { OpenArticleModal } from "./commands/openArticles";
import { wikipediaIcon } from "./utils/wikipediaIcon";
import { CreateArticleNoteModal } from "./commands/createArticleNotes";

export default class WikipediaSearchPlugin extends Plugin {
	settings: WikipediaSearchSettings;

	async onload() {
		console.log("loading wikipedia-search plugin");

		await this.loadSettings();

		this.addCommand({
			id: "link-article",
			name: "Link Article",
			editorCallback: (editor: Editor) => {
				new LinkArticleModal(this.app, this.settings, editor).open();
			},
		});

		this.addCommand({
			id: "open-article",
			name: "Open Article",
			callback: () => new OpenArticleModal(this, this.settings).open(),
		});

		this.addCommand({
			id: "create-article-note",
			name: "Create Article Note",
			callback: () => {
				if (this.settings.templates.filter((template) => template.createNote).length === 0) {
					new Notice("To use this command you have to create a note template first!");
					return;
				}
				new CreateArticleNoteModal(this.app, this.settings).open();
			},
		});

		addIcon("wikipedia", wikipediaIcon);
		this.addRibbonIcon("wikipedia", "Open Article", () => new OpenArticleModal(this, this.settings).open());

		this.addSettingTab(new WikipediaSearchSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		const settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

		// Data migration
		if ("defaultTemplate" in settings) {
			settings.templates.unshift(
				Object.assign(DEFAULT_TEMPLATE, { templateString: settings.defaultTemplate })
			);
			Object.keys(settings).forEach((key) => {
				if (!(key in DEFAULT_SETTINGS)) delete settings[key];
			});
		}

		this.settings = settings;
		this.saveSettings();
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
