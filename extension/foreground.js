(function setup() {
	const modelsP =
		fetch(browser.runtime.getURL("extension/translation/models/models.json"))
			.then(res => res.json())
			.then(res => res.languages);

	const stylesheet = document.createElement("link");
	stylesheet.type = "text/css";
	stylesheet.rel = "stylesheet";
	stylesheet.media = "all";
	stylesheet.href = browser.runtime.getURL("extension/style.css");
	document.body.appendChild(stylesheet);

	browser.runtime.onMessage.addListener(({ type, data }) => {
		(async () => {
			const models = await modelsP;
			const popup = createTranslationPopup(data, models);
			document.body.appendChild(popup);
		})();
	});

	function createTranslationPopup({ message, from, to }, models) {
		const selection = getSelection();
		const originalText = selection.toString(); // assume highlighted stuff is still the same...
		const rect = selection.getRangeAt(0).getBoundingClientRect(); // no multi selection

		const popup = document.createElement("div");
		popup.className = "berga-popup berga-popup_style-reset";
		popup.style.left = rect.x + window.pageXOffset + "px";
		popup.style.top = rect.y + window.pageYOffset + "px";
		// oofies
		popup.innerHTML = `
			<header class="berga-popup_header">
				<div>
					<select class="berga-popup_from-lang"></select> &rarr;
					<select class="berga-popup_to-lang"></select>
					<i class="berga-popup_loading-icon"></i>
				</div>
				<div class="berga-popup_close-button">×</div>
			</header>
			<hr>
			<p class="berga-popup_translation"></p>
		`;

		const header = popup.querySelector(".berga-popup_header");
		const paragraph = popup.querySelector(".berga-popup_translation");
		const fromSelect = popup.querySelector(".berga-popup_from-lang");
		const toSelect = popup.querySelector(".berga-popup_to-lang");
		const closeButton = popup.querySelector(".berga-popup_close-button");
		const loadingIcon = popup.querySelector(".berga-popup_loading-icon");

		for (const [value, text] of Object.entries(models)) {
			for (const select of [fromSelect, toSelect]) {
				const option = document.createElement("option");
				option.value = value;
				option.innerText = text;
				select.appendChild(option);
			}
		}

		paragraph.style.width = rect.width + 12 + "px"; // 5 * 2 for margins
		fromSelect.value = from;
		toSelect.value = to;
		paragraph.innerText = message;

		const requestTranslation = async () => {
			const from = fromSelect.value;
			const to = toSelect.value;

			loadingIcon.style.display = "inline-block";
			paragraph.innerText = "-";
			const result = await browser.runtime.sendMessage({ message: originalText, from, to });
			loadingIcon.style.display = "none";
			paragraph.innerText = result;
		};
		// maybe a confirm button instead if models load too slowly
		fromSelect.addEventListener("change", requestTranslation);
		toSelect.addEventListener("change", requestTranslation);

		const clickPopupHeader = event => {
			if (event.target.tagName === "SELECT") return;
			event.preventDefault();

			header.removeEventListener("mousedown", clickPopupHeader);
			let startX = event.clientX;
			let startY = event.clientY;
			const dragPopup = event => {
				popup.style.left = popup.offsetLeft - startX + event.clientX + "px";
				popup.style.top = popup.offsetTop - startY + event.clientY + "px";
				startX = event.clientX;
				startY = event.clientY;
			};
			document.body.addEventListener("mousemove", dragPopup);
			document.body.addEventListener("mouseup", function stopDragPopup() {
				document.body.removeEventListener("mousemove", dragPopup);
				document.body.removeEventListener("mouseup", stopDragPopup);
				header.addEventListener("mousedown", clickPopupHeader);
			});
		};
		header.addEventListener("mousedown", clickPopupHeader);

		closeButton.addEventListener("click", function closeOnClick() {
			closeButton.removeEventListener("click", closeOnClick);
			header.removeEventListener("mousedown", clickPopupHeader);
			fromSelect.removeEventListener("change", requestTranslation);
			toSelect.removeEventListener("change", requestTranslation);
			popup.remove();
		});

		return popup;
	}
})();