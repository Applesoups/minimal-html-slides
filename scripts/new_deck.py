#!/usr/bin/env python3
"""Copy the portable starter and builder into a fresh authoring directory."""
from pathlib import Path
import argparse,shutil
p=argparse.ArgumentParser(description=__doc__);p.add_argument('destination',type=Path);a=p.parse_args();dest=a.destination.resolve()
if dest.exists() and any(dest.iterdir()):p.error('Destination is not empty; choose a fresh directory.')
source=Path(__file__).resolve().parents[1]/'assets/template'
shutil.copytree(source,dest,dirs_exist_ok=True,ignore=shutil.ignore_patterns('template.html','preview.png'))
shutil.copyfile(Path(__file__).with_name('build.py'),dest/'build.py')
print(f'Created {dest}\nEdit deck.json, then run: python3 build.py deck.json --output slides.html')
