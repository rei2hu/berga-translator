browser.runtime.onMessage.addListener(({ openSettingsWindow }) => {
	if (!openSettingsWindow) return;
	let popupURL = browser.runtime.getURL("extension/settings/settings.html");

	let creating = browser.tabs.create({
		url: popupURL,
	});
});