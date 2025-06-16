
import pandas as pd
import numpy as np
import re

def manageCsv(df,path_new_df):

    df=clean_data(df)
    #print(df.head())
    df=avg_for_hour(df,True)
    if path_new_df:
        df.to_csv(path_new_df,index=False)

def clean_data(df):

    time_col=df.columns[0]
    value_col=df.columns[1]
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


def avg_for_hour(df,is_clean=False):
    if is_clean ==False:
        clean_data(df)
    time_col=df.columns[0]
    value_col=df.columns[1]
    df['start_time']=df[time_col].dt.floor('h')
    df=df.groupby('start_time',as_index=False,sort=False)[value_col].mean()
    df.rename(columns={value_col: 'average'},inplace=True)

    return df


#
# CSV_PATH="./data/time_series.csv"
#
# print(pd.read_csv(CSV_PATH).head())
#
# print(manageCsv(CSV_PATH).head())