#!/usr/bin/env python3
"""
Document Integrity Checker (minimal, dependency-tolerant)
"""

import os
import json
import re
import time
import urllib.request
import sys
from pathlib import Path

ROOT = Path(os.getcwd())

EXTS_MD = {'.md', '.markdown'}
EXTS_PDF = {'.pdf'}
EXTS_DOCX = {'.docx'}
EXTS_TXT = {'.txt'}
EXTS_JSON = {'.json'}
EXTS_YAML = {'.yaml', '.yml'}
EXTS_HTML = {'.html', '.htm'}

link_pattern_md = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
link_pattern_html = re.compile(r"<a\s+[^>]*href=\"([^\"]+)\"", re.IGNORECASE)

def is_utf8_file(path):
    try:
        with path.open('rb') as f:
            data = f.read()
        data.decode('utf-8')
        return True
    except Exception:
        return False

def is_non_empty(path):
    try:
        return path.stat().st_size > 0
    except Exception:
        return False

def check_json(path):
    try:
        with path.open('r', encoding='utf-8') as f:
            json.load(f)
        return True, "OK"
    except Exception as e:
        return False, str(e)

yaml_lib = None
try:
    import yaml as yaml_lib  # type: ignore
except Exception:
    yaml_lib = None

def check_yaml(path):
    if yaml_lib is None:
        return True, "yaml lib not installed; skipping"
    try:
        with path.open('r', encoding='utf-8') as f:
            yaml_lib.safe_load(f)
        return True, "OK"
    except Exception as e:
        return False, str(e)

PdfReader = None
try:
    from PyPDF2 import PdfReader as PdfReader  # type: ignore
except Exception:
    PdfReader = None

def check_pdf(path):
    if PdfReader is None:
        return False, "PyPDF2 not installed"
    try:
        reader = PdfReader(str(path))
        for i in range(min(3, len(reader.pages))):
            _ = reader.pages[i].extract_text()
        return True, "OK"
    except Exception as e:
        return False, str(e)

Doc = None
try:
    from docx import Document as Doc  # type: ignore
except Exception:
    Doc = None

def check_docx(path):
    if Doc is None:
        return False, "python-docx not installed"
    try:
        Doc(str(path))
        return True, "OK"
    except Exception as e:
        return False, str(e)

def check_txt_utf8(path):
    if not is_non_empty(path):
        return False, "empty file"
    try:
        with path.open('r', encoding='utf-8') as f:
            _ = f.read(1024)
        return True, "OK"
    except Exception as e:
        return False, str(e)

def extract_md_links(path):
    links = []
    try:
        with path.open('r', encoding='utf-8') as f:
            text = f.read()
        for m in link_pattern_md.finditer(text):
            links.append(m.group(1))
    except Exception:
        pass
    return links

def extract_html_links(path):
    links = []
    try:
        with path.open('r', encoding='utf-8') as f:
            text = f.read()
        for m in link_pattern_html.finditer(text):
            links.append(m.group(1))
    except Exception:
        pass
    return links

def url_alive(url):
    try:
        req = urllib.request.Request(url, method='HEAD')
        with urllib.request.urlopen(req, timeout=5) as resp:
            code = resp.getcode()
            return 200 <= code < 400
    except Exception:
        try:
            with urllib.request.urlopen(url, timeout=7) as resp:
                code = resp.getcode()
                return 200 <= code < 400
        except Exception:
            return False

def check_links_in_file(path, ext):
    issues = []
    links = []
    if ext in EXTS_MD:
        links = extract_md_links(path)
    elif ext in EXTS_HTML:
        links = extract_html_links(path)
    for link in links:
        if link.startswith('http://') or link.startswith('https://'):
            if not url_alive(link):
                issues.append(f"broken_url: {link}")
    return (len(issues) == 0, issues)

def main():
    results = []
    total = 0
    issues_found = []

    for root, dirs, files in os.walk(ROOT):
        for name in files:
            path = Path(root) / name
            total += 1
            ext = path.suffix.lower()
            key = {"path": str(path), "ext": ext}
            ok = True
            notes = []
            if not is_non_empty(path):
                ok = False
                notes.append("empty")
            if not is_utf8_file(path):
                ok = False
                notes.append("not_utf8")

            if ext in EXTS_JSON:
                ok_json, detail = check_json(path)
                if not ok_json:
                    ok = False
                    notes.append("json_error: "+detail)
            if ext in EXTS_YAML:
                ok_yaml, detail = check_yaml(path)
                if not ok_yaml:
                    ok = False
                    notes.append("yaml_error: "+detail)
            if ext in EXTS_PDF:
                ok_pdf, detail = check_pdf(path)
                if not ok_pdf:
                    ok = False
                    notes.append("pdf_error: "+detail)
            if ext in EXTS_DOCX:
                ok_docx, detail = check_docx(path)
                if not ok_docx:
                    ok = False
                    notes.append("docx_error: "+detail)
            if ext in EXTS_TXT:
                ok_txt, detail = check_txt_utf8(path)
                if not ok_txt:
                    ok = False
                    notes.append("txt_error: "+detail)
            if ext in EXTS_MD:
                ok_links, link_notes = check_links_in_file(path, ext)
                if not ok_links:
                    ok = False
                    notes.extend(link_notes)
            if ext in EXTS_HTML:
                ok_links, link_notes = check_links_in_file(path, ext)
                if not ok_links:
                    ok = False
                    notes.extend(link_notes)

            key["ok"] = str(ok)
            key["notes"] = "; ".join(notes)
            results.append(key)
            if not ok:
                issues_found.append(key)

    print("Document Integrity Check Summary")
    print(f"Scanned: {total} files; Issues: {len(issues_found)}")
    if issues_found:
        print("\nIssues detail:")
        for r in issues_found:
            print(f"- {r['path']}")
            if r['notes']:
                for n in r['notes'].split(';'):
                    n = n.strip()
                    if n:
                        print(f"  - {n}")
    else:
        print("All documents seem OK (within the capabilities of this checker).")

    return 0

if __name__ == '__main__':
    start = time.time()
    code = main()
    elapsed = time.time() - start
    print(f"\nDone in {elapsed:.2f}s")
    sys.exit(code)
