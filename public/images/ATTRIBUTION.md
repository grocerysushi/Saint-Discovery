# Sacred art

El Greco, *Saint Francis Receiving the Stigmata*, 1585–1590.
The Walters Art Museum, accession 37.424. Public domain / CC0 museum image.

Museum: https://art.thewalters.org/object/37.424/
Image record: https://commons.wikimedia.org/wiki/File:El_Greco_-_Saint_Francis_Receiving_the_Stigmata_-_Walters_37424.jpg
Original: https://upload.wikimedia.org/wikipedia/commons/d/d2/El_Greco_-_Saint_Francis_Receiving_the_Stigmata_-_Walters_37424.jpg

## Saint Adrian daily card

Icon of Saints Adrian and Natalia of Nicomedia, unknown icon painter.
Public domain. Local web-optimized reproduction: `saint-adrian.webp`.
Source: https://commons.wikimedia.org/wiki/File:Martyrs_Adrian_and_Natalia._Icon._Church_of_the_Holy_Martyrs_Adrian_and_Natalia._Moscow.jpg

Other daily artwork URLs, author credits, licenses, and original file pages are
recorded in `lib/data/saint-images.json` and attributed on each daily card.
Regenerate the metadata with `node scripts/build-saint-images.mjs`.

## Generated saint illustrations

Files under `generated-saints/` are original AI-generated artistic
interpretations prepared for Saint Discovery. They are not historical portraits
or authenticated likenesses. The homepage labels these as AI-generated.

The corresponding asset records live in `lib/data/saint-generated-images.json`,
separately from the historical artwork index. Historical images take priority.
New reviewed illustrations can be imported with:

    node scripts/import-generated-saints.mjs <folder-containing-slug-named-images>

Images are bundled with the site; visitors never trigger image-generation API
calls and no image-generation API key is needed in production.
