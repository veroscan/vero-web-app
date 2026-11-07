#!/usr/bin/env bash
# Full parity run: DOM, behaviour, then visual at 1440 and 390 in reduced and normal motion.
# Needs the original site on :4324 and the export (npm run build, npm run start) on :4326.
# One Chromium at a time (each script takes .browser.lock). About an hour on a 2-core machine.
# Logs go to .parity/ (also screenshots and diff images of every pair that differs by more than 0.1%).
set -u
cd "$(dirname "$0")/.."
mkdir -p .parity
python tools/dom_parity.py | tee .parity/dom.log
node tools/behaviour.mjs | tee .parity/behaviour.log
node tools/parity.mjs --width 1440 --motion reduced | tee .parity/visual-1440-reduced.log
node tools/parity.mjs --width 390 --motion reduced | tee .parity/visual-390-reduced.log
node tools/parity.mjs --width 1440 --motion normal --steps 8 | tee .parity/visual-1440-normal.log
node tools/parity.mjs --width 390 --motion normal --steps 8 | tee .parity/visual-390-normal.log
echo finished > .parity/ALL_DONE
