import json, re, sys, pathlib, collections
spec = json.load(open(sys.argv[1])); docs = pathlib.Path(sys.argv[2])
# spec templates -> regex; collect query params per template+method
tmpl = {}
for p, ops in spec["paths"].items():
    rx = "^" + re.sub(r"\{[^}]+\}", "[^/]+", p) + "$"
    q = set()
    for m, op in ops.items():
        if not isinstance(op, dict): continue
        for prm in op.get("parameters", []) + ops.get("parameters", []):
            if "$ref" in prm:
                prm = spec["components"]["parameters"][prm["$ref"].split("/")[-1]]
            if prm.get("in") == "query": q.add(prm["name"])
    tmpl[p] = (re.compile(rx), q, {m.upper() for m in ops if m in ("get","post","put","patch","delete")})
pat = re.compile(r"console\.neon\.tech/api/v2(/[A-Za-z0-9_{}\-/.$<>:]*)(\?[^\s'\"\\`)]*)?")
hits = collections.defaultdict(list)
for f in docs.rglob("*.md*"):
    for i, line in enumerate(f.read_text(errors="ignore").splitlines(), 1):
        for m in pat.finditer(line):
            path = m.group(1).rstrip("/.:")
            path = re.sub(r"\$\{?[A-Za-z_]+\}?|<[^>]+>", "X", path)  # shell vars / placeholders
            hits[(path, m.group(2) or "")].append(f"{f.relative_to(docs)}:{i}")
bad_path, bad_q, ok = [], [], 0
for (path, qs), where in sorted(hits.items()):
    match = [t for t, (rx, q, ms) in tmpl.items() if rx.match(path)]
    if not match: bad_path.append((path, where)); continue
    ok += 1
    names = [kv.split("=")[0] for kv in qs.lstrip("?").split("&") if kv]
    allq = set().union(*(tmpl[t][1] for t in match))
    miss = [n for n in names if n not in allq]
    if miss: bad_q.append((path, miss, where))
print(f"distinct path refs: {len(hits)}, matched: {ok}, unmatched paths: {len(bad_path)}, unknown query params: {len(bad_q)}")
for p, w in bad_path: print("PATH", p, "|", len(w), "refs |", w[0])
for p, miss, w in bad_q: print("QUERY", p, miss, "|", w[0])
