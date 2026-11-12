# Second guard: refuse anything but GET before a request leaves the harness.
import schemathesis


@schemathesis.hook
def before_call(ctx, case, **kwargs):
    if case.method.upper() != "GET":
        raise RuntimeError(f"GET-only guard: refused {case.method} {case.path}")
