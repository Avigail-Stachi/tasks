
import pandas as pd
import numpy as np
import re
CSV_PATH="./data/time_series.csv"

def manageCsv(csv_path=CSV_PATH):
    df = pd.read_csv(csv_path)
    df=clean_data(df)

    return  df
def clean_data(df):


    time_col='timestamp'
    value_col='value'

    # למחוק שורות ריקות כולל רווחים וכו
    df=df.replace(r'^\s*$',np.nan,regex=True)

    df[time_col] = pd.to_datetime(df[time_col], errors='coerce')
    df[value_col] = pd.to_numeric(df[value_col], errors='coerce')

    df=df.dropna(how='all').drop_duplicates()

    # if df.isnull().values.any():
    #     print("missing values in cols:")
    #     print(df.isnull().sum())
    # else:
    #     print("no missing values")

    num_rows = len(df)
    df=df.dropna()
    num_rows_removed = num_rows - len(df)
    if num_rows_removed > 0:
        print(f"removed {num_rows_removed} rows, NaN and NaT")

    # df = df.groupby(time_col, as_index=False)[value_col].sum()  # ממיין

    df = df.groupby(time_col, as_index=False, sort=False)[value_col].sum()


    return df

print(pd.read_csv(CSV_PATH).head())

print(manageCsv().head())