#!/usr/bin/env python3
"""Build scrapbots index.html: concatenate src parts, embed fonts base64."""
import base64, pathlib

SRC = pathlib.Path('/home/z/my-project/scrapbots/src')
OUT = pathlib.Path('/home/z/my-project/scrapbots/index.html')

head = (SRC / 'head.html').read_text(encoding='utf-8')
parts = ['p1_core.js', 'p2_data.js', 'p3_art.js', 'p4_battle.js', 'p5_ui.js']
js = '\n'.join((SRC / p).read_text(encoding='utf-8') for p in parts)

fr = base64.b64encode(pathlib.Path('/tmp/vazirmatn-regular.woff2').read_bytes()).decode()
fb = base64.b64encode(pathlib.Path('/tmp/vazirmatn-bold.woff2').read_bytes()).decode()
head = head.replace('{{FONT_REGULAR}}', fr).replace('{{FONT_BOLD}}', fb)

html = head + js + '\n</script>\n</body>\n</html>\n'
OUT.write_text(html, encoding='utf-8')
print(f'Built {OUT} ({OUT.stat().st_size/1024:.0f} KB)')
