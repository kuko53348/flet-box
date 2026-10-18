"""Regenerate the snippet JSON files from the snippet dictionaries.

The dictionaries in FletBox_snippets_creator/ are the source of truth; the four
JSON files next to this script are what the editor actually loads. They used to
be edited by hand, which is how they drifted: broken JavaScript, snippets for
widgets that no longer exist, and 28 prefixes claimed by two files at once.

    python3 tools/snippets-creator-flet-box/build_snippets.py           # write
    python3 tools/snippets-creator-flet-box/build_snippets.py --check   # CI guard
"""

import ast
import collections
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from FletBox_snippets_creator.FletBox_create_attributes_widgets import (  # noqa: E402
    attrs_all_placeholders_complete as ATTRIBUTES,
)
from FletBox_snippets_creator.FletBox_create_modules_widgets import only_modules as MODULES  # noqa: E402
from FletBox_snippets_creator.FletBox_create_widgets import only_controls as WIDGETS  # noqa: E402

# (file, label, dictionary) in load order. The label is part of every key and of
# each description, so it is the only thing that tells the two "widgets" files apart.
CATEGORIES = [
    ("FletBox_attribute_widgets.json", "FletBox widgets", ATTRIBUTES),
    ("FletBox_widgets.json", "FletBox widgets", WIDGETS),
    ("FletBox_modules_widgets.json", "FletBox modules widgets", MODULES),
]

SOURCES = {
    "FletBox_attribute_widgets.json": "FletBox_snippets_creator/FletBox_create_attributes_widgets.py",
    "FletBox_widgets.json": "FletBox_snippets_creator/FletBox_create_widgets.py",
    "FletBox_modules_widgets.json": "FletBox_snippets_creator/FletBox_create_modules_widgets.py",
}

AGGREGATE = "FletBox.json"


def snippet(label, prefix, code):
    return {
        "prefix": prefix,
        "description": "Make a %s %s widget" % (label, prefix),
        "body": code.split("\n"),
    }


def duplicate_keys(path):
    """Keys written twice in a snippet dictionary.

    Python keeps the last one silently, so a duplicated entry is a snippet that
    was authored and never ships. Read from the AST because the imported dict has
    already collapsed them.
    """
    tree = ast.parse(path.read_text(encoding="utf-8"))
    seen = collections.Counter()
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign) and isinstance(node.value, ast.Dict):
            for key in node.value.keys:
                if isinstance(key, ast.Constant) and isinstance(key.value, str):
                    seen[key.value] += 1
    return sorted(k for k, n in seen.items() if n > 1)


def build():
    """Return {filename: contents}, cross-dictionary prefix collisions, and per-file
    duplicated keys."""
    files = {}
    aggregate = {}
    owners = {}
    collisions = []
    duplicates = []

    for filename, label, snippets in CATEGORIES:
        duplicates.extend((filename, key) for key in duplicate_keys(HERE / SOURCES[filename]))
        contents = {}
        for prefix, code in snippets.items():
            contents["%s %s" % (label, prefix)] = snippet(label, prefix, code)
            if prefix in owners:
                collisions.append((prefix, owners[prefix], filename))
            else:
                owners[prefix] = filename
                # The aggregate can hold one entry per prefix, so the first file
                # to claim it wins; the other is reported instead of shipping.
                aggregate["%s %s" % (label, prefix)] = snippet(label, prefix, code)
        files[filename] = contents

    files[AGGREGATE] = aggregate
    return files, collisions, duplicates


def render(contents):
    # ensure_ascii keeps the non-ASCII bodies (\u30a2..., emoji) escaped exactly as
    # the committed files have them; neither carries a trailing newline.
    return json.dumps(contents, indent=2)


def main():
    check = "--check" in sys.argv[1:]
    files, collisions, duplicates = build()

    total = sum(len(v) for filename, v in files.items() if filename != AGGREGATE)
    print(
        "%s %d snippets in %d categories -> %d entries in %s"
        % ("checked" if check else "built", total, len(CATEGORIES), len(files[AGGREGATE]), AGGREGATE)
    )

    if collisions:
        print("%d prefix(es) claimed by two dictionaries:" % len(collisions))
        for prefix, first, second in collisions:
            print("  · %s  (%s loses to %s)" % (prefix, second, first))

    if duplicates:
        print("%d key(s) written twice, so the earlier snippet never ships:" % len(duplicates))
        for filename, prefix in duplicates:
            print("  · %s  (%s)" % (prefix, filename))

    stale = [
        filename
        for filename, contents in files.items()
        if not (HERE / filename).exists()
        or (HERE / filename).read_text(encoding="utf-8") != render(contents)
    ]

    if check:
        if stale:
            print("STALE: %s" % ", ".join(stale))
            print("run: python3 tools/snippets-creator-flet-box/build_snippets.py")
            return 1
        return 1 if (collisions or duplicates) else 0

    for filename, contents in files.items():
        (HERE / filename).write_text(render(contents), encoding="utf-8")
        print("  %s (%d entries)" % (filename, len(contents)))
    return 1 if (collisions or duplicates) else 0


if __name__ == "__main__":
    raise SystemExit(main())
