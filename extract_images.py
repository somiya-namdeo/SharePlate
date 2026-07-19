import json
import os
import glob
import base64

os.makedirs('assets/readme', exist_ok=True)

img_count = 0
for nb_file in glob.glob('notebooks/*.ipynb'):
    with open(nb_file, 'r', encoding='utf-8') as f:
        nb = json.load(f)
        for i, cell in enumerate(nb.get('cells', [])):
            if cell['cell_type'] == 'code':
                for out in cell.get('outputs', []):
                    if out.get('output_type') == 'display_data':
                        data = out.get('data', {})
                        if 'image/png' in data:
                            img_data = data['image/png']
                            img_bytes = base64.b64decode(img_data)
                            name = os.path.basename(nb_file).split('.')[0]
                            filepath = f"assets/readme/{name}_fig{img_count}.png"
                            with open(filepath, "wb") as imgf:
                                imgf.write(img_bytes)
                            img_count += 1
print(f"Extracted {img_count} images.")
