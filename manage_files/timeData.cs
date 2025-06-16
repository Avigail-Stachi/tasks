using Microsoft.Data.Analysis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CsvHelper;
using System.Globalization;

namespace manage_files
{
    class timeData
    {
        static string prepareData(string csvPath)
        {
            DataFrame df = DataFrame.LoadCsv(csvPath);
            string outputFileNAme=Path.GetFileNameWithoutExtension(csvPath) + "_clean.csv";
            string? outputDir = Path.GetDirectoryName(csvPath);
            if (outputDir == null)
            {
                outputDir=Directory.GetCurrentDirectory();
                Console.WriteLine("path to directory doesnt found. the file will be saved in the currend directory:");
                Console.WriteLine(outputDir);
            }
            string outputPath = Path.Combine(outputDir, outputFileNAme);


            df = removeDuplicates(df);

            saveDfToCsv(df, outputPath);
            return outputPath;
        }
        static void saveDfToCsv(DataFrame df,string outputPath)
        {
            using (var writer = new StreamWriter(outputPath))
            using (var csv = new CsvWriter(writer, CultureInfo.InvariantCulture))
            {
                foreach (var col in df.Columns)
                {
                    csv.WriteField(col.Name);
                }
                csv.NextRecord();
                for (long rowI = 0; rowI < df.Rows.Count; rowI++)
                {
                    var row = df.Rows[rowI];
                    foreach (var val in row)
                    {
                        csv.WriteField(val);
                    }
                    csv.NextRecord();
                }
            }
        }

        static DataFrame removeDuplicates(DataFrame df)
        {
            string nameCol1 = "timestamp";
            string nameCol2 = "value";
            var timestampCol = df.Columns[nameCol1];
            var valueCol = df.Columns[nameCol2];

            var dic = new HashSet<(string, double)>();

            var newTimestampCol = new StringDataFrameColumn(nameCol1);
            var newValueCol = new DoubleDataFrameColumn(nameCol2);


            for (long i = 0; i < df.Rows.Count; i++)
            {
                string ts = timestampCol[i]?.ToString() ?? "";

                double val = double.NaN;
                if (valueCol[i] != null)
                {
                    if (!double.TryParse(valueCol[i].ToString(), out val))
                        val = double.NaN;
                }

                bool isEmptyRow = string.IsNullOrWhiteSpace(ts) && double.IsNaN(val);

                if (!isEmptyRow)
                {
                    var key = (ts, val);
                    if (!dic.Contains(key))
                    {
                        dic.Add(key);
                        newTimestampCol.Append(ts);
                        newValueCol.Append(val);
                    }
                }

            }
            var newDf = new DataFrame();
            newDf.Columns.Add(newTimestampCol);
            newDf.Columns.Add(newValueCol);
            return newDf;

        }
    }
}
