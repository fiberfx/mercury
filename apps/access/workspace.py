"""Create a local MX workspace using an existing, reviewed Mercury source tree."""
import argparse
import json
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('modules', type=Path, help='directory containing core, hyperscript, ui, hypergraph, reflect, testing and devtools')
parser.add_argument('--output', type=Path, help='workspace file at a common ancestor of the app and modules')
args = parser.parse_args()
app = Path(__file__).resolve().parent
modules = args.modules.resolve()
names = ('core', 'hyperscript', 'ui', 'hypergraph', 'reflect', 'testing', 'devtools')
for name in names:
    if not (modules / name / 'mx.mod').is_file():
        parser.error(f'Missing native module: {modules / name / "mx.mod"}')
members = [app, *(modules / name for name in names)]
output = (args.output or app / 'mx.work').resolve()
if any(not member.is_relative_to(output.parent) for member in members):
    parser.error('The workspace file must be above both the app and modules; use --output /shared/parent/access.work')
if output.exists():
    parser.error(f'Refusing to overwrite existing workspace: {output}')
# JSON quotes are also valid quoted MX paths.
output.write_text('mx 0.1.0\nuse (\n' + ''.join(' ' + json.dumps(str(member)) + '\n' for member in members) + ')\n')
print(output)
