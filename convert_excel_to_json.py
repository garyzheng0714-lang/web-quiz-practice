import pandas as pd
import json

file_path = '/Users/macmini_gary/local_trae/错题本/选择题题库200题20251220.xlsx'
output_path = '/Users/macmini_gary/local_trae/错题本/questions.json'

try:
    df = pd.read_excel(file_path)
    questions = []
    for index, row in df.iterrows():
        options = []
        if pd.notna(row['选项A']): options.append(f"A. {row['选项A']}")
        if pd.notna(row['选项B']): options.append(f"B. {row['选项B']}")
        if pd.notna(row['选项C']): options.append(f"C. {row['选项C']}")
        if pd.notna(row['选项D']): options.append(f"D. {row['选项D']}")
        
        question = {
            "id": int(row['单选题型']) if pd.notna(row['单选题型']) else index + 1,
            "question": row['题目标题'],
            "options": options,
            "answer": row['正确答案'].strip() if pd.notna(row['正确答案']) else "",
            "explanation": row['答案解析'] if pd.notna(row['答案解析']) else "暂无解析",
            "score": int(row['分值']) if pd.notna(row['分值']) else 1
        }
        questions.append(question)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully converted {len(questions)} questions to {output_path}")

except Exception as e:
    print("Error:", e)
