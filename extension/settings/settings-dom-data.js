(() => {
	const log = document.getElementById("log");
	let timeout;
	function logMessage(message, duration = 5000) {
		if (!log) return;

		log.innerText = message;
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => log.innerText = "", duration);
	}

	let settingsP = browser.storage.local.get()
		.then(settings => settings.languages ? settings : browser.storage.local.set({ languages: { en: "English" } }))
		.catch(e => logMessage(`Failed to load settings: ${e.message}`));

	browser.storage.local.onChanged.addListener(changes => {
		const newSettings = Object.entries(changes).map(([key, values]) => [key, values.newValue]);
		settingsP = settingsP.then(settings => ({ ...settings, ...Object.fromEntries(newSettings)}));
		populateDomFromSettings();
	});
	populateDomFromSettings();

	async function populateDomFromSettings() {
		const settings = await settingsP;
		const languages = settings.languages || {};

		const addedLanguages = document.getElementById("added-languages");
		if (addedLanguages) {
			addedLanguages.innerHTML = "";
			const entries = Object.entries(languages);
			if (entries.length === 0) {
				const row = document.createElement("tr");
				const cell1 = document.createElement("td");

				cell1.innerText = "No configured languages";
				cell1.colSpan = 100;
				row.appendChild(cell1);
				addedLanguages.appendChild(row);
			} else {
				for (const [value, text] of entries) {
					const row = document.createElement("tr");
					const cell1 = document.createElement("td");
					const cell2 = document.createElement("td");

					cell1.innerText = value;
					cell2.innerText = text;
					row.appendChild(cell1);
					row.appendChild(cell2);

					if (document.getElementById("add-language-button")) {
						const cell3 = document.createElement("td");
						const button = document.createElement("button");
						button.innerText = "Remove";
						button.type = "Button";

						button.addEventListener("click", () => {
							button.disabled = true;
							browser.storage.local.get("languages")
							.then(currentLanguages => {
								const languages = currentLanguages.languages || {};
								delete languages[value];

								return browser.storage.local.set({
									languages: {
										...languages,
									},
								})
							}).catch(e => logMessage(e.message))
							.finally(() => button.disabled = false);
						});

						cell3.appendChild(button);
						row.appendChild(cell3);
					}
					addedLanguages.appendChild(row);
				}
			}
		}

		const languageSelects = document.getElementsByClassName("lang-select");
		if (languageSelects.length > 0) {
			for (select of Array.from(languageSelects)) {
				select.innerHTML = "";
			}

			const entries = Object.entries(languages);
			if (entries.length === 0) {
				Array.from(languageSelects).forEach(select => {
					const option = document.createElement("option");
					option.value = null;
					option.innerText = "None";
					select.appendChild(option);
				});
			} else {
				for (const [value, text] of entries) {
					Array.from(languageSelects).forEach(select => {
						const option = document.createElement("option");
						option.value = value;
						option.innerText = text;
						select.appendChild(option);
					});
				}
			}
		}

		const addedModels = document.getElementById("added-models");
		if (addedModels) {
			addedModels.innerHTML = "";
			const toMB = val => `${(val / 1024 / 1024).toFixed(1)} MB`;
			const models = Object.entries(settings).filter(([key]) => key !== "languages");

			if (models.length === 0) {
				const row = document.createElement("tr");
				const cell1 = document.createElement("td");

				cell1.innerText = "No models added";
				cell1.colSpan = 100;
				row.appendChild(cell1);
				addedModels.appendChild(row);
			} else {
				for (const [key, value] of models) {
					const row1 = document.createElement("tr");
					const cell11 = document.createElement("td");
					const cell12 = document.createElement("td");
					const cell13 = document.createElement("td");
					cell11.innerText = key;
					cell11.rowSpan = 3;
					cell12.innerText = "Lex";
					cell13.innerText = toMB(value.lex.byteLength);
					row1.appendChild(cell11);
					row1.appendChild(cell12);
					row1.appendChild(cell13);

					if (document.getElementById("upload-model")) {
						const cell14 = document.createElement("td");
						cell14.rowSpan = 3;

						const button = document.createElement("button");
						button.innerText = "Remove";
						button.addEventListener("click", () => {
							button.disabled = true;
							browser.storage.local.remove(key)
								.catch(e => logMessage(e.message))
								.finally(() => button.disabled = false);
						});

						cell14.appendChild(button);
						row1.appendChild(cell14);
					}

					const row2 = document.createElement("tr");
					const cell21 = document.createElement("td");
					const cell22 = document.createElement("td");
					cell21.innerText = "Model";
					cell22.innerText = toMB(value.model.byteLength);
					row2.appendChild(cell21);
					row2.appendChild(cell22);

					const row3 = document.createElement("tr");
					const cell31 = document.createElement("td");
					const cell32 = document.createElement("td");
					cell31.innerText = "Vocabularies";
					cell32.innerText = toMB(value.vocabs.reduce((a, b) => a + b.byteLength, 0));
					row3.appendChild(cell31);
					row3.appendChild(cell32);

					addedModels.appendChild(row1);
					addedModels.appendChild(row2);
					addedModels.appendChild(row3);
				}
			}
		}
	}
})()