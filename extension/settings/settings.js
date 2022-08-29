(() => {
	const log = document.getElementById("log");
	let timeout;
	function logMessage(message, duration = 5000) {
		log.innerText = message;
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => log.innerText = "", duration);
	}

	let settingsP = browser.storage.local.get()
		.then(settings => settings.languages ? settings : browser.storage.local.set({ languages: { en: "English" } }))
		.catch(e => logMessage(`Failed to load settings: ${e.message}`));
	populateDomFromSettings();

	browser.storage.local.onChanged.addListener(changes => {
		const newSettings = Object.entries(changes).map(([key, values]) => [key, values.newValue]);
		settingsP = settingsP.then(settings => ({ ...settings, ...Object.fromEntries(newSettings)}));
		populateDomFromSettings();
	});

	async function populateDomFromSettings() {
		const settings = await settingsP;
		const fromSelect = document.getElementById("from-lang");
		const toSelect = document.getElementById("to-lang");
		const addedLanguages = document.getElementById("added-languages");
		addedLanguages.innerHTML = "";
		if (fromSelect) fromSelect.innerHTML = "";
		if (toSelect) toSelect.innerHTML = "";

		for (const [value, text] of Object.entries(settings.languages || {})) {
			for (const select of [fromSelect, toSelect]) {
				if (!select) continue;
				const option = document.createElement("option");
				option.value = value;
				option.innerText = text;
				select.appendChild(option);
			}
			const row = document.createElement("tr");
			const cell1 = document.createElement("td");
			const cell2 = document.createElement("td");
			const cell3 = document.createElement("td"); // TODO: remove row button

			cell1.innerText = value;
			cell2.innerText = text;
			row.appendChild(cell1);
			row.appendChild(cell2);
			row.appendChild(cell3);
			addedLanguages.appendChild(row);
		}

		const addedModels = document.getElementById("added-models");
		addedModels.innerHTML = "";
		const toMB = val => `${(val / 1024 / 1024).toFixed(1)} MB`;
		for (const [key, value] of Object.entries(settings)) {
			if (key === "languages") continue;

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

	document.getElementById("upload-model")?.addEventListener("click", () => {
		const model = document.getElementById("model").files[0];
		const lex = document.getElementById("lex").files[0];
		const vocabs = document.getElementById("vocabs").files;
		const fromLang = document.getElementById("from-lang").value;
		const toLang = document.getElementById("to-lang").value;

		if (!fromLang || !toLang) {
			logMessage("Missing languages");
			return;
		}

		if (fromLang === toLang) {
			logMessage("Pick two different languages");
			return;
		}

		if (!model || !lex || vocabs.length === 0) {
			logMessage("Missing files");
			return;
		}

		const vocabsArr = [];
		for (let i = 0; i < vocabs.length; i++) {
			vocabsArr.push(vocabs[i]);
		}

		Promise.all([model.arrayBuffer(), lex.arrayBuffer(), ...vocabsArr.map(vocab => vocab.arrayBuffer())])
			// storing as top level so we don't have to override/copy any previous uploads
			// probably expensive to do so but I didn't check
			.then(([model, lex, ...vocabs]) =>
				browser.storage.local.set({
					[`${fromLang}-${toLang}`]: {
						model,
						lex,
						vocabs,
					},
				}))
			.catch(e => logMessage(e.message));
	});

	document.getElementById("add-language")?.addEventListener("click", () => {
		const langId = document.getElementById("language-id").value;
		const langName = document.getElementById("language-name").value;

		if (langId.length !== 2) {
			logMessage("Id must be 2 characters long"); // why?
			return;
		}

		if (!langName) {
			logMessage("Missing language name");
			return;
		}

		browser.storage.local.get("languages")
			.then(currentLanguages =>
				browser.storage.local.set({
					languages: {
						...(currentLanguages || {}),
						[langId]: langName,
					}
				})
			).catch(e => logMessage(e.message));
	});

	document.getElementById("reset")?.addEventListener("click", () => {
		if (confirm("Are you sure you want to clear all models and languages?")) {
			browser.storage.local.clear();
		}
	});

	document.getElementById("open-settings")?.addEventListener("click", () => {
		browser.runtime.sendMessage({ openSettingsWindow: true });
	});
})()