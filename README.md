# ![image](berga.png) berga-translator

A browser extension that provides client-sided translations via [The Bergamot Project](https://browser.mt/).
Also uses [fastText](https://fasttext.cc/) to guess the initial language of the provided text.

## Permissions:

## Usage:

1. Highlight text on page,
2. Right click and select "Translate Selection"
3. Wait and a "window" with the translation should appear directly over the highlighted text (it will be literally
over it as in hide the selected text, I've dragged the window upwards in the screenshot)

![image](https://user-images.githubusercontent.com/11600812/187097549-30ee5159-7fe2-4ec0-b35a-be66437ccdf3.png)

4. Drag it around, change the languages, or close it.

## Permissions:
- contextMenus: for the Translate Selection option
- storage/unlimitedStorage: to save uploaded models and other settings

## Settings:

### Settings View Panel
Clicking the extension icon brings up a panel that shows you your current settings for the extension, these settings
may be modified on the page that will be opened when clicking "Open Settings"

### Languages

Languages dictates the options you will have in selects/dropdown menus. The identifier is a unique pair of characters
used to identify the language internally. You can add them here.

### Models

Models are the thing that do the actual translation; they can be sourced from the [Firefox Translations Models](https://github.com/mozilla/firefox-translations-models) repository. You can upload models that you download from there, here.

## Credits:
- [The Bergamot Project](https://browser.mt/): machine translation
- [The Bergamot Project's Test Page](https://github.com/browsermt/bergamot-translator/tree/main/wasm/test_page): reference material
- [fastText](https://fasttext.cc/): text classification
- [sakura](https://github.com/oxalorg/sakura): drop in css which made the UI look ok

