from itertools import chain
import json
import sys

def convert_file(name, infile, outfile, scale):
    with open(infile) as f:
        in_obj = json.loads(f.read())
    [rigidBody] = in_obj['rigidBodies']
    shapes = rigidBody['shapes']
    polygons = (s['vertices'] for s in shapes)
    n = len(shapes)
    shifted_polygons = [
        list(chain.from_iterable((p['x'] * scale, p['y'] * scale) for p in poly))
        for poly in polygons
    ]
    out_json = {name: {'shape': shifted_polygons[0]}}
    with open(outfile, 'w') as f:
        f.write(json.dumps(
            out_json,
            sort_keys=True,
            indent=4,
            separators=(',', ': ')
        ))

if __name__ == "__main__":
    name = sys.argv[1]
    in_f = sys.argv[2]
    out_f = sys.argv[3]
    scale = sys.argv[4]
    convert_file(name, in_f, out_f)

