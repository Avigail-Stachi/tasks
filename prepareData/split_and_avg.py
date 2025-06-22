import pandas as pd
import time
import cleanData
import os

from multiprocessing import Pool

from cleanData import clean_data

CSV_PATH = "./data/time_series.csv"
PARQUET_PATH = "./data/time_series_c.parquet"
OUTPUT_DIR = "./data/split"


def split_chunk_by_day(df):
    time_col = df.columns[0]
    # להמיר את עמודות התאריך לפורמט
    df[time_col] = pd.to_datetime(df[time_col], errors='coerce')
    day_s = 'day'
    df[day_s] = df[time_col].dt.strftime("%Y-%m-%d")
    df_valid = df[df[day_s].notna()]

    list_df = []
    # file_pathes = []
    # print(df.head())

    for day, group in df_valid.groupby(day_s, sort=False):
        # file_path = os.path.join(output_dir, f"{day}.csv")
        # file_path.append(file_path)
        # cleanData.save_file(group.drop(columns=[day_s]), file_path, index=False)
        list_df.append(group.drop(columns=[day_s]))

    df_invalid = df[df[day_s].isna()]
    if not df_invalid.empty:
        # file_path = os.path.join(output_dir, "invalid_dates.csv")
        # cleanData.save_file(df_invalid.drop(columns=[day_s]), file_path, index=False)
        # file_pathes.append(file_path)
        list_df.append(df_invalid.drop(columns=[day_s]))

    return list_df


def split_per_day(file_path=CSV_PATH, chunk_size=10000):
    if file_path.lower().endswith(".parquet"):
        return split_chunk_by_day(cleanData.read_file(file_path))
    elif file_path.lower().endswith(".csv"):
        chunks = list(cleanData.read_file(file_path, chunk_size))
        max_processes = min(len(chunks), os.cpu_count())
        with Pool(processes=max_processes) as pool:
            listt = pool.map(split_chunk_by_day, chunks)
        return [df for sub_list in listt for df in sub_list]
    else:
        raise ValueError("unsupported file path")


def process_file(file_path):
    pid = os.getpid()
    start = time.time()
    # print(f"[PID {pid}] start {file_path}")
    output_path = file_path.replace(".csv", "_hour.csv")
    df = cleanData.read_file(file_path)
    cleanData.manageCsv(output_path, df)
    end = time.time()
    # print(f"[PID {pid}] end {file_path}. {end - start} seconds")
    return output_path


def process_df(df):
    pid = os.getpid()
    start = time.time()
    # print(f"[PID {pid}] start")
    # output_path = file_path.replace(".csv", "_hour.csv")
    # df = cleanData.read_file(file_path)
    df = cleanData.manageCsv(df)
    end = time.time()
    # print(f"[PID {pid}] end. {end - start} seconds")
    return df


def cal_separate_and_merge(list_df, new_path="./data/final_hour.csv"):
    max_processes = min(len(list_df), os.cpu_count())
    print("using", max_processes, "processes")
    with Pool(processes=max_processes) as pool:
        list_df = pool.map(process_df, list_df)
    df_all = pd.concat(list_df, ignore_index=True)

    if new_path.lower().endswith(".parquet"):
        df=df_all[['start_time','average']]
    else:
        df_all['sum'] = df_all['average'] * df_all['count']

        df = df_all.groupby('start_time', as_index=False,sort=False).agg({
            'sum': 'sum',
            'count': 'sum'
        })

        df['average'] = df['sum'] / df['count']

    cleanData.save_file(df[['start_time', 'average']], new_path, index=False)
    return new_path, df[['start_time', 'average']]


def cal_separate_and_merge_serial(list_df, new_path="./data/final_hour_serial.csv"):
    new_list = []
    for d in list_df:
        df = process_df(d)
        new_list.append(df)
    df_all = pd.concat(new_list, ignore_index=True)
    cleanData.save_file(df_all, new_path, index=False)
    return new_path


# def cal_seperate_and_merge_serial(files_pathes, new_path="./data/final_hour_serial.csv"):
#     hour_files = []
#     for path in files_pathes:
#         output_path = process_file(path)
#         hour_files.append(output_path)
#     df_all = pd.concat([cleanData.read_file(f) for f in hour_files], ignore_index=True)
#     cleanData.save_file(df_all, new_path, index=False)
#     return new_path


def run2(path=CSV_PATH, new_path=None):
    if path.lower().endswith(".parquet"):
        ends = ".parquet"
    elif path.lower().endswith(".csv"):
        ends = ".csv"
    else:
        raise ValueError("unsupported file path")
    if new_path is None:
        new_path = "./data/final_hour" + ends
    return cal_separate_and_merge(split_per_day(path), new_path)


def main():
    print("parquet\n\n")
    start1 = time.time()
    p, df = run2(PARQUET_PATH)
    end1 = time.time()
    # df = df.sort_values(by='start_time')
    print(df.head())
    print(end1 - start1)
    print("csv\n\n")
    start2 = time.time()
    p, df = run2()
    end2 = time.time()
    # df = df.sort_values(by='start_time')
    print(df.head())
    print(end2 - start2)
    # print("suppose to")
    # df = cleanData.read_file(r"C:\Users\User\Documents\hadasim\prepareData\data\time_series.parquet")
    # print(df.head())


if __name__ == '__main__':
    main()
