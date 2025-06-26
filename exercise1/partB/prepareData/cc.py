import pandas as pd
import time


df = pd.read_csv(
    r"C:\Users\User\Documents\hadasim\prepareData\data\time_series.csv",
    parse_dates=[0])

df['value'] = df['value'].astype('float32')

start=time.time()
df.to_parquet(
    r"C:\Users\User\Documents\hadasim\prepareData\data\time_series_c.parquet",
    index=False,
    engine="pyarrow"
)
end=time.time()
print(end-start)