# berga-translator

A browser extension that provides client-sided translations via [The Bergamot Project](https://browser.mt/).
Also uses [fastText](https://fasttext.cc/) to guess the initial language of the provided text.

## Usage:

1. Highlight text on page,
2. Right click and select "Translate Selection"
3. Wait and a "window" with the translation should appear directly over the highlighted text (it will be literally
over it as in hide the selected text, I've dragged the window upwards in the screenshot)
![image](https://user-images.githubusercontent.com/11600812/187097549-30ee5159-7fe2-4ec0-b35a-be66437ccdf3.png)
4. Drag it around, change the languages, or close it.

## Configuring more languages (and thoughts):

I've considered putting this on the extension store (?), but at its core the main bulk of the work is offloaded
to two projects and I need to check the licenses. Also a large thing I want to figure out is how to let the user
add their own models for the extension to detect and use.

To use it in its current form, you can use it as a temporary extension:
1. Go to about:debugging#/runtime/this-firefox (or about:debugging and click "This Firefox")
2. Click "Load Temporary Add-on"
3. Select the manifest.json file
4. Try it out

### Configuring more languages
Models are taken from [firefox-translations-models](https://github.com/mozilla/firefox-translations-models) and placed
in the [models directory](extension/translation/models) (just download the entire xxen or enxx folder and put it in).
You then need to update the [models.json](extension/translation/models/models.json) file to include some details like
what the abbreviation stands for and the actual names of the files (since they aren't fully consistent).

For example, the model.json has `esen` (spanish to english), `fren` (french to english), and `enfr` (english to french)
so my models directory looks like
```
models
│   models.json
├───enfr
│       lex.50.50.enfr.s2t.bin
│       model.enfr.intgemm.alphas.bin
│       vocab.fren.spm
├───esen
│       lex.50.50.esen.s2t.bin
│       model.intgemm.alphas.bin
│       vocab.esen.spm
└───fren
        lex.50.50.fren.s2t.bin
        model.fren.intgemm.alphas.bin
        vocab.fren.spm
```
