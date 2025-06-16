import pandas as pd

import cleanData
import os

from multiprocessing import Pool

CSV_PATH="./data/time_series.csv"
OUTPUT_DIR = "./data/split"

# def choose_chunk(f_path=CSV_PATH):
#     mb=os.path.getsize(f_path)/(1024*1024)
#     return max(5000,min(int(mb*2000),300000))

def split_per_day(csv_path=CSV_PATH,output_dir=OUTPUT_DIR):
    os.makedirs(output_dir,exist_ok=True)
    #chunk_size=choose_chunk(csv_path)

    df=pd.read_csv(csv_path)

    time_col=df.columns[0]
    value_col=df.columns[1]

    #להמיר את עמודות התאריך לפורמט
    df[time_col]=pd.to_datetime(df[time_col], errors='coerce')
    day_s='day'
    df[day_s]=df[time_col].dt.strftime("%Y-%m-%d")
    df_valid=df[df[day_s].notna()]

    file_pathes=[]

    for day,group in df_valid.groupby(day_s,sort=False):
        file_path=os.path.join(output_dir,f"{day}.csv")
        file_pathes.append(file_path)
        group.drop(columns=[day_s]).to_csv(file_path,index=False)

    df_invalid=df[df[day_s].isna()]
    if not df_invalid.empty:
        file_path=os.path.join(output_dir,"invalid_dates.csv")
        df_invalid.drop(columns=[day_s]).to_csv(file_path,index=False)
        file_pathes.append(file_path)

    return file_pathes

def process_file(file_path):
    output_path=file_path.replace(".csv","_hour.csv")
    df=pd.read_csv(file_path)
    cleanData.manageCsv(df,output_path)
    return output_path

def cal_seperate_and_merge(files_pathes,new_path="./data/final_hour.csv"):
    max_proccesses=min(len(files_pathes),os.cpu_count())

    with Pool(processes=max_proccesses) as pool:
        hour_files=pool.map(process_file,files_pathes)
    df_all=pd.concat([pd.read_csv(f) for f in hour_files],ignore_index=True)
    df_all.to_csv(new_path,index=False)



if __name__=='__main__':
    cal_seperate_and_merge(split_per_day())