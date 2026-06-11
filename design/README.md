# Brand assets

Social/preview images are generated from the HTML sources here via headless Chrome,
then copied into `public/`:

```sh
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --force-device-scale-factor=1 \
  --virtual-time-budget=3000 --window-size=1200,630 \
  --screenshot="$PWD/og.png" "file://$PWD/og.html" && mv og.png ../public/og.png
"$CHROME" --headless=new --disable-gpu --force-device-scale-factor=1 \
  --virtual-time-budget=3000 --window-size=180,180 \
  --screenshot="$PWD/icon.png" "file://$PWD/icon.html" && mv icon.png ../public/apple-touch-icon.png
```

`public/favicon.svg` is hand-authored (it's the live SVG favicon).
