import pandas as pd
import numpy as np
import re


def save_file(df, file_path, **kwargs):
    if file_path.lower().endswith(".csv"):
        return df.to_csv(file_path, **kwargs)
    elif file_path.lower().endswith(".parquet"):
        return df.to_parquet(file_path, **kwargs)
    else:
        raise ValueError("unsupported file path")


def read_file(file_path, chunk_size=10000):
    if file_path.lower().endswith(".csv"):
        return pd.read_csv(file_path,chunksize=chunk_size)
    elif file_path.lower().endswith(".parquet"):
        return pd.read_parquet(file_path)
    else:
        raise ValueError("unsupported file path")


def manageCsv(df, path_new_df=None):

    df = avg_for_hour(df)
    if path_new_df:
        save_file(df, path_new_df, index=False)
    return df


def clean_data(df):
    time_col = df.columns[0]
    value_col = df.columns[1]
    # למחוק שורות ריקות כולל רווחים וכו
    df = df.replace(r'^\s*$', np.nan, regex=True)

    df[time_col] = pd.to_datetime(df[time_col], errors='coerce')
    df[value_col] = pd.to_numeric(df[value_col], errors='coerce')

    df = df.dropna(how='all').drop_duplicates()

    # if df.isnull().values.any():
    #     print("missing values in cols:")
    #     print(df.isnull().sum())
    # else:
    #     print("no missing values")

    #num_rows = len(df)
    df = df.dropna()
    #num_rows_removed = num_rows - len(df)
    # if num_rows_removed > 0:
    #     print(f"removed {num_rows_removed} rows, NaN and NaT")

    # df = df.groupby(time_col, as_index=False)[value_col].sum()  # ממיין

    df = df.groupby(time_col, as_index=False, sort=False)[value_col].agg(
        ['mean','count']
    )
    df.rename(columns={'mean':value_col},inplace=True)

    return df


def avg_for_hour(df, is_clean=False):
    # ,include_count=False
    if not is_clean:
        df = clean_data(df)
    # if include_count==True:

    time_col = df.columns[0]
    value_col = df.columns[1]
    df['start_time'] = df[df.columns[0]].dt.floor('h')
    df['sum']=df[value_col]*df['count']

    df=df.groupby('start_time',as_index=False,sort=False).agg({
        'sum':'sum',
        'count':'sum'
    })
    df['average'] = df['sum'] / df['count']

    return df[['start_time', 'average', 'count']]

#
# CSV_PATH="./data/time_series.csv"
#
# print(pd.read_csv(CSV_PATH).head())
#
# print(manageCsv(CSV_PATH).head())
