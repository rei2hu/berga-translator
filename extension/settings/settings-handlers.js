(() => {
	const log = document.getElementById("log");
	let timeout;
	function logMessage(message, duration = 5000) {
		if (!log) return;

		log.innerText = message;
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => log.innerText = "", duration);
	}

	const uploadModelButton = document.getElementById("upload-model");
	if (uploadModelButton) {
		uploadModelButton.addEventListener("click", () => {
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

		uploadModelButton.disabled = true;
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
			.catch(e => logMessage(e.message))
			.finally(() => uploadModelButton.disabled = false);
		});
	}

	const addLanguageForm = document.getElementById("add-language-form");
	if (addLanguageForm) {
		const addLanguageButton = document.getElementById("add-language-button");

		addLanguageForm.addEventListener("submit", e => {
			e.preventDefault();

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

			addLanguageButton.disabled = true;
			browser.storage.local.get("languages")
				.then(currentLanguages =>
					browser.storage.local.set({
						languages: {
							...(currentLanguages.languages || {}),
							[langId]: langName,
						}
					})
				).catch(e => logMessage(e.message))
				.finally(() => addLanguageButton.disabled = false);
		});
	}

	const resetButton = document.getElementById("reset-settings");
	if (resetButton) {
		resetButton.addEventListener("click", () => {
			if (confirm("Are you sure you want to clear all models and languages?")) {
				browser.storage.local.clear();
			}
		});
	}

	const openSettingsButton = document.getElementById("open-settings");
	if (openSettingsButton) {
		openSettingsButton.addEventListener("click", () => {
			browser.runtime.sendMessage({ openSettingsWindow: true });
		});
	}
})()