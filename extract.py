import json
import glob
import re

for nb_file in glob.glob('notebooks/*.ipynb'):
    print(f"\n================ {nb_file} ================\n")
    with open(nb_file, 'r', encoding='utf-8') as f:
        nb = json.load(f)
        for cell in nb.get('cells', []):
            source = "".join(cell.get('source', []))
            
            # Print Markdown cells that might contain explanations or results
            if cell['cell_type'] == 'markdown':
                if any(kw in source.lower() for kw in ['accuracy', 'precision', 'recall', 'f1', 'rmse', 'mae', 'r2', 'roc', 'architecture', 'dataset', 'result']):
                    print("--- MARKDOWN ---")
                    print(source)
            
            # Print output cells that contain text/plain (like print statements with metrics)
            if cell['cell_type'] == 'code':
                outputs = cell.get('outputs', [])
                for out in outputs:
                    if out.get('output_type') == 'stream':
                        text = "".join(out.get('text', []))
                        if any(kw in text.lower() for kw in ['accuracy', 'precision', 'recall', 'f1', 'rmse', 'mae', 'r2', 'roc', 'score']):
                            print("--- METRICS OUTPUT ---")
                            print(text)
                    elif out.get('output_type') == 'execute_result' or out.get('output_type') == 'display_data':
                        data = out.get('data', {})
                        text = "".join(data.get('text/plain', []))
                        if any(kw in text.lower() for kw in ['accuracy', 'precision', 'recall', 'f1', 'rmse', 'mae', 'r2', 'roc', 'score']):
                            print("--- RESULT OUTPUT ---")
                            print(text)
