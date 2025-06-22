import pandas as pd
import numpy as np

def save_file(df, file_path, **kwargs):
    if file_path.lower().endswith(".csv"):
        return df.to_csv(file_path, **kwargs)
    elif file_path.lower().endswith(".parquet"):
        return df.to_parquet(file_path, **kwargs)
    else:
        raise ValueError("unsupported file path")

def read_file(file_path, chunk_size=10000):
    if file_path.lower().endswith(".csv"):
        return pd.read_csv(file_path, chunksize=chunk_size, parse_dates=[0])
    elif file_path.lower().endswith(".parquet"):
        return pd.read_parquet(file_path)
    else:
        raise ValueError("unsupported file path")

def clean_data(df):
    time_col = df.columns[0]
    value_col = df.columns[1]
    # למחוק שורות ריקות כולל רווחים וכו
    #df = df.replace(r'^\s*$', np.nan, regex=True)

    df[time_col] = pd.to_datetime(df[time_col], errors='coerce')
    df[value_col] = pd.to_numeric(df[value_col], errors='coerce')

    df = df.dropna(how='all').drop_duplicates().dropna(subset=[time_col, value_col])

    return df


def avg_for_hour(df, is_clean=False):
    # ,include_count=False
    if not is_clean:
        df = clean_data(df)

    time_col = df.columns[0]
    value_col = df.columns[1]
    df['start_time'] = df[time_col].dt.floor('h')

    df=df.groupby('start_time',as_index=False,sort=False).agg(
        total_sum=(value_col,'sum'),
        count=(value_col,'count')
    )
    df['average'] = df['total_sum'] / df['count']

    return df[['start_time', 'average', 'count']]

#
# CSV_PATH="./data/time_series.csv"
#
# print(pd.read_csv(CSV_PATH).head())
#
# print(manageCsv(CSV_PATH).head())