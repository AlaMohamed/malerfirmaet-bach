"""Extract Danish project texts from the .docx files under assets/projekter.

We can't open Word docs directly, so this script unzips each .docx and
pulls out the visible paragraphs from word/document.xml. Output is
printed to stdout, grouped by project folder, so the LLM editing
projects.ts can read the source-of-truth text and transcribe it
faithfully.

Run from repo root:
    python scripts/extract-project-texts.py
"""
from pathlib import Path
import re
import sys
import zipfile

REPO = Path(__file__).resolve().parent.parent
ASSETS = REPO / "assets" / "projekter"


def extract_text(docx_path: Path) -> str:
    """Return the paragraph-separated text of a .docx file."""
    with zipfile.ZipFile(docx_path) as z:
        with z.open("word/document.xml") as f:
            xml = f.read().decode("utf-8")
    paragraphs = re.findall(r"<w:p\b[^>]*>(.*?)</w:p>", xml, re.DOTALL)
    lines = []
    for p in paragraphs:
        # Re-assemble run-text fragments inside a paragraph.
        runs = re.findall(r"<w:t[^>]*>([^<]*)</w:t>", p)
        text = "".join(runs).strip()
        if text:
            lines.append(text)
    return "\n\n".join(lines)


def main() -> int:
    if not ASSETS.exists():
        print(f"Asset folder not found: {ASSETS}", file=sys.stderr)
        return 1
    for docx in sorted(ASSETS.rglob("*.docx")):
        rel = docx.relative_to(REPO)
        print("=" * 78)
        print(f"FILE: {rel}")
        print("=" * 78)
        try:
            print(extract_text(docx))
        except Exception as e:  # noqa: BLE001
            print(f"[error reading: {e}]")
        print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
