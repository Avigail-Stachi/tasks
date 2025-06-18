import pandas as pd
df = pd.read_csv("./data/time_series.csv")


df.to_parquet("./data/time_series_c.parquet", engine='pyarrow')
