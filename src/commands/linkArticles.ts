import { App, Editor } from "obsidian";
import { Template, WikipediaSearchSettings } from "../settings";
import { Article } from "src/utils/searchModal";
import { SearchModal } from "src/utils/searchModal";
import { TemplateModal } from "src/utils/templateModal";
import { generateInsert } from "src/utils/generateInsert";
import { createNoteInFolder } from "src/utils/createNote";

export class LinkArticleModal extends SearchModal {
	async onChooseSuggestion(article: Article) {
		if (this.settings.templates.length > 1) {
			new LinkArticleTemplateModal(app, this.settings, this.editor!, article).open();
		} else {
			insertLink(app, this.editor!, this.settings, article, this.settings.templates[0]);
		}
	}
}

class LinkArticleTemplateModal extends TemplateModal {
	async onChooseSuggestion(template: Template) {
		insertLink(app, this.editor, this.settings, this.article, template);
	}
}

async function insertLink(
	app: App,
	editor: Editor,
	settings: WikipediaSearchSettings,
	article: Article,
	template: Template
) {
	let insert = await generateInsert(settings, article, template.templateString, editor.getSelection());

	if (template.createNote) {
		const path = await createNoteInFolder(
			app,
			article.title,
			insert,
			template.customPath === "" ? settings.defaultNotePath : template.customPath,
			settings.overrideFiles
		);
		if (path == null) return;

		insert = `[[${path}|${
			settings.prioritizeArticleTitle || editor.getSelection() === "" ? article.title : editor.getSelection()
		}]]`;
	}

	const cursorPosition = editor.getCursor();
	editor.replaceSelection(insert);
	if (settings.placeCursorInfrontOfInsert) editor.setCursor(cursorPosition);
}
