import pandas as pd
import time
import cleanData
import os

from multiprocessing import Pool

CSV_PATH = "./data/time_series.csv"
PARQUET_PATH = "./data/time_series_c.parquet"
OUTPUT_DIR = "./data/split"


def split_per_day(csv_path=CSV_PATH, output_dir=OUTPUT_DIR):
    os.makedirs(output_dir, exist_ok=True)
    # chunk_size=choose_chunk(csv_path)

    df = cleanData.read_file(csv_path)

    time_col = df.columns[0]
    value_col = df.columns[1]

    # להמיר את עמודות התאריך לפורמט
    df[time_col] = pd.to_datetime(df[time_col], errors='coerce')
    day_s = 'day'
    df[day_s] = df[time_col].dt.strftime("%Y-%m-%d")
    df_valid = df[df[day_s].notna()]

    file_pathes = []
    print(df.head())

    for day, group in df_valid.groupby(day_s, sort=False):
        file_path = os.path.join(output_dir, f"{day}.csv")
        file_pathes.append(file_path)
        cleanData.save_file(group.drop(columns=[day_s]), file_path, index=False)

    df_invalid = df[df[day_s].isna()]
    if not df_invalid.empty:
        file_path = os.path.join(output_dir, "invalid_dates.csv")
        cleanData.save_file(df_invalid.drop(columns=[day_s]), file_path, index=False)
        file_pathes.append(file_path)

    return file_pathes


def process_file(file_path):
    pid = os.getpid()
    start = time.time()
    print(f"[PID {pid}] start {file_path}")
    output_path = file_path.replace(".csv", "_hour.csv")
    df = cleanData.read_file(file_path)
    cleanData.manageCsv(df, output_path)
    end = time.time()
    print(f"[PID {pid}] end {file_path}. {end - start} seconds")
    return output_path


def cal_seperate_and_merge(files_pathes, new_path="./data/final_hour.csv"):
    max_processes = min(len(files_pathes), os.cpu_count())
    print("using", max_processes, "processes")
    with Pool(processes=max_processes) as pool:
        hour_files = pool.map(process_file, files_pathes)
    df_all = pd.concat([cleanData.read_file(f) for f in hour_files], ignore_index=True)

    cleanData.save_file(df_all, new_path, index=False)
    return new_path


def cal_seperate_and_merge_serial(files_pathes, new_path="./data/final_hour_serial.csv"):
    hour_files = []
    for path in files_pathes:
        output_path = process_file(path)
        hour_files.append(output_path)
    df_all = pd.concat([cleanData.read_file(f) for f in hour_files], ignore_index=True)
    cleanData.save_file(df_all, new_path, index=False)
    return new_path


if __name__ == '__main__':
    p = cal_seperate_and_merge(split_per_day())
    df = pd.read_csv(p)
    print(df.head())

    # df=pd.read_parquet(r"C:\Users\User\Documents\hadasim\prepareData\data\time_series.parquet")
    # print(df.head())
