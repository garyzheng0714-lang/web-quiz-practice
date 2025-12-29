import pandas as pd

file_path = '/Users/macmini_gary/local_trae/错题本/选择题题库200题20251220.xlsx'

try:
    df = pd.read_excel(file_path)
    print("Columns:", df.columns.tolist())
    print("First 3 rows:")
    print(df.head(3).to_dict())
except Exception as e:
    print("Error:", e)
