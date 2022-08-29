browser.contextMenus.create({
	id: "berga-translate-selection",
	title: "Translate Selection",
	contexts: ["selection"]
});

// TODO: what doesn't have to be a string?
const modelConfig = {
	"beam-size": "1",
	"normalize": "1.0",
	"word-penalty": "0",
	"max-length-break": "128",
	"mini-batch-words": "1024",
	"workspace": "128",
	"max-length-factor": "2.0",
	"skip-cost": "false",
	"cpu-threads": "0",
	"quiet": "true",
	"quiet-translation": "true",
	"gemm-precision": "int8shiftAlphaAll",
	"alignment": "soft"
};

let settingsP = browser.storage.local.get();
browser.storage.local.onChanged.addListener(changes => {
	const newSettings = Object.entries(changes).map(([key, values]) => [key, values.newValue]);
	settingsP = settingsP.then(settings => ({ ...settings, ...Object.fromEntries(newSettings)}));
});

const loadedModels = {};
const fastTextP =
	fetch(browser.runtime.getURL("extension/detection/fasttext_wasm.wasm"))
		.then(res => res.arrayBuffer())
		.then(wasm => loadFastText(wasm))
		.then(ft => ft.loadModel(browser.runtime.getURL("extension/detection/lid.176.ftz")));
const bergamotP =
	fetch(browser.runtime.getURL("extension/translation/bergamot-translator-worker.wasm"))
		.then(res => res.arrayBuffer())
		.then(wasm => new Promise(resolve => {
			const module = loadEmscriptenGlueCode({
				onRuntimeInitialized: () => resolve(module),
				wasmBinary: wasm,
			})
		}));
const bergamotServiceP = bergamotP.then(module => new module.BlockingService({ cacheSize: 20000 }));

const getModel = async (from, to) => {
	const bergamot = await bergamotP;
	const models = await settingsP; // models are keyed by id here (also has languages)
	const id = `${from}-${to}`;

	if (!(id in models)) return null;
	if (id in loadedModels) return loadedModels[id];

	const model = models[id].model;
	const shortList = models[id].lex;
	const vocabs = models[id].vocabs;

	const prepareAlignedMemoryFromBuffer = (buffer, alignmentSize) => {
		var byteArray = new Int8Array(buffer);
		var alignedMemory = new bergamot.AlignedMemory(byteArray.byteLength, alignmentSize);
		const alignedByteArrayView = alignedMemory.getByteArrayView();
		alignedByteArrayView.set(byteArray);
		return alignedMemory;
	}

	const [alignedModel, alignedShort, ...alignedVocabs] = await Promise.all([
		prepareAlignedMemoryFromBuffer(model, 256),
		prepareAlignedMemoryFromBuffer(shortList, 64),
		...vocabs.map(vocab => prepareAlignedMemoryFromBuffer(vocab, 64))
	]);

	const vocabsList = new bergamot.AlignedMemoryList();
	for (const vocab of alignedVocabs) {
		vocabsList.push_back(vocab);
	}

	const config = Object.entries(modelConfig).map(([k, v]) => `${k}: ${v}`).join("\n");
	loadedModels[id] = new bergamot.TranslationModel(config, alignedModel, alignedShort, vocabsList, null);
	return loadedModels[id];
}

const translate = async (message, from, to) => {
	if (from === to) return message;

	const bergamot = await bergamotP;
	const bergamotService = await bergamotServiceP;

	const input = new bergamot.VectorString();
	input.push_back(message);

	const options = new bergamot.VectorResponseOptions();
	options.push_back({
		qualityScores: true,
		alignment: true,
		html: false,
	});

	let translated;
	if (from !== "en" && to !== "en") {
		const model1 = await getModel(from, "en");
		const model2 = await getModel("en", to);
		if (!model1 || !model2) return "Cannot perform this translation due to missing models";
		translated = bergamotService.translateViaPivoting(model1, model2, input, options);
	} else {
		const model = await getModel(from, to);
		if (!model) return "Cannot perform this translation due to missing models";
		translated = bergamotService.translate(model, input, options);
	}

	const result = [];
	for (let i = 0; i < translated.size(); i++) {
		const response = translated.get(i);
		result.push(response.getTranslatedText());
	}

	return result.join(" ");
}

// request translation via popup
browser.runtime.onMessage.addListener(({ message, from, to }, info) => {
	if (!message || !from || !to) return;
	return translate(message, from, to);
});

browser.contextMenus.onClicked.addListener((event, tab) => {
	if (event.menuItemId !== "berga-translate-selection") return;

	const cleanedText = event.selectionText
		.trim()
		/*
		.replace(/[\r\n\t]/g, " ")
		.replace(/\s\s+/g, " ")
		*/
		.toLowerCase();

	(async () => {
		const fastText = await fastTextP;
		const [score, lang] = fastText.predict(cleanedText).get(0);
		const from = lang.replace("__label__", "");

		const result = await translate(cleanedText, from, "en");
		browser.tabs.sendMessage(tab.id, { type: "translation-result", data: { message: result, from, to: "en" } });
	})();
});
