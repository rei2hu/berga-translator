# ![image](berga.png) berga-translator

A browser extension that provides client-sided translations via [The Bergamot Project](https://browser.mt/).
Also uses [fastText](https://fasttext.cc/) to guess the initial language of the provided text. Available on
[addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/berga-translator/).

## Differences from the official Firefox Translations extension
There are a few differences between this extension and the official [Firefox Translations](https://github.com/mozilla-extensions/firefox-translations)
extension:
1. This extension focuses on translating user-selected parts of text
    - The official extension attempts to translate the entire page
2. This extension lets you change what languages to translate between
    - The official extension does not let you change the language and only works if it initially, properly detects a page's language
3. This extension allows you to upload and save models to it
    - The official extension downloads the models off Google Cloud (I think) each time it needs it.

## Permissions:
- contextMenus: for the Translate Selection option
- storage/unlimitedStorage: to save uploaded models and other settings

## Usage:

1. Highlight text on page,
2. Right click and select "Translate Selection"
3. Wait and a "window" with the translation should appear directly over the highlighted text (it will be literally
over it as in hide the selected text, I've dragged the window upwards in the screenshot)

![image](https://user-images.githubusercontent.com/11600812/187097549-30ee5159-7fe2-4ec0-b35a-be66437ccdf3.png)
![imagen](https://user-images.githubusercontent.com/11600812/187571099-e7233d83-a7f5-433d-92f3-4bc9f33fa578.png)

4. Drag it around, change the languages, or close it.

## Settings:

### Settings View Panel
Clicking the extension icon brings up a panel that shows you the languages and models you've added so far,
these settings may be modified on the page that will be opened when clicking "Settings"

![image](https://user-images.githubusercontent.com/11600812/187570187-97669f80-6770-4fc6-b8f5-cf4860704dd3.png)


### Languages

Languages dictates the options you will have in selects/dropdown menus. The identifier is a unique pair of characters
used to identify the language internally while the name is the user-friendly name that you will see.

![image](https://user-images.githubusercontent.com/11600812/187570664-d1426282-fab6-4cd7-a297-85a44e755539.png)


### Models

Models are the thing that do the actual translation; they can be sourced from the [Firefox Translations Models](https://github.com/mozilla/firefox-translations-models) repository. Here you can keep track of the models you've added so far, how much space each one takes up,
and upload more.

![imagen](https://user-images.githubusercontent.com/11600812/187570776-bc4248ac-4f33-4301-9ca1-393af4084c6b.png)

## Credits:
- [The Bergamot Project](https://browser.mt/): machine translation
- [The Bergamot Project's Test Page](https://github.com/browsermt/bergamot-translator/tree/main/wasm/test_page): reference material
- [fastText](https://fasttext.cc/): text classification
- [sakura](https://github.com/oxalorg/sakura): drop in css which made the UI look ok

