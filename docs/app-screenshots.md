# Field app screenshots

The phone screens on the landing page are the field app itself, taken from the
iPhone simulator in each language with the platform's example study on the
device: `public/site/app/{interviews,record}-{es,en,pt}.webp`.

They come from a scripted run rather than by hand, so they can be taken again
whenever the app changes. The flow and its runner live with the app, in the
companion repository's `scripts/screenshots/`, and produce the full set the
store listings use as well. Two of those screens are used here, scaled to half
the simulator's 1206 × 2622 so they stay sharp on high-density screens:

```bash
magick 01-interviews.png -resize 603x -quality 82 public/site/app/interviews-es.webp
magick 03-record.png -resize 603x -quality 82 public/site/app/record-es.webp
```

Everything on screen is the example study's invented data. The plant in the
field record is a CC0 photograph of _Tagetes erecta_ by Kryesmin on Wikimedia
Commons (`File:Tagetes_erecta_(flowers)_01.jpg`).
