import json, re, sys, pathlib, collections
spec = json.load(open(sys.argv[1])); docs = pathlib.Path(sys.argv[2])
kebab = lambda s: s.replace("-", "").lower()
ops = {}
for p, o in spec["paths"].items():
    for m, op in o.items():
        if isinstance(op, dict) and "operationId" in op:
            ops[kebab(op["operationId"])] = (m.upper(), p, op.get("deprecated", False))
pat = re.compile(r"/docs/reference/api/([a-z0-9-]+)/([a-z0-9-]+)")
refs = collections.defaultdict(list)
for f in docs.rglob("*.md*"):
    for i, line in enumerate(f.read_text(errors="ignore").splitlines(), 1):
        for m in pat.finditer(line):
            refs[m.group(2).replace("-", "")].append(f"{f.relative_to(docs)}:{i}")
miss = {k: v for k, v in refs.items() if k not in ops}
dep = {k: v for k, v in refs.items() if k in ops and ops[k][2]}
print(f"distinct operation links: {len(refs)}, in spec: {len(refs)-len(miss)}, not in spec: {len(miss)}, to deprecated ops: {len(dep)}")
for k, v in sorted(miss.items()): print("MISSING", k, "|", len(v), "refs |", v[0])
for k, v in sorted(dep.items()): print("DEPRECATED", k, ops[k][:2], "|", len(v), "refs |", v[0])
