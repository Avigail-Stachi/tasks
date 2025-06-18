// See https://aka.ms/new-console-template for more information
using manage_files;
using System;
using System.Collections.Generic;
using System.IO;

class Program
{
    static void Main(string[] args)
    {
        const int N = 10;
        string dataDir = @"C:\Users\User\Documents\hadasim\manage_files\data";

        string csvPath = Path.Combine(dataDir, "time_series.csv");
        string parquetPath = Path.Combine(dataDir, "time_series.parquet");
        try
        {
            var listOfErrorsCommuns= Run1(dataDir,N);
           // Run2(csvPath, parquetPath);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"An error occurred: {ex.Message}");
        }
    }
    static List<(string errorCode, int count)> Run1(string dataDir, int N)
    {
        //split_and_count_errors.ReadOne();

        int numForThreads = Environment.ProcessorCount;
        List<string> filesNames = SplitAndCountErrors.MakeDirs(dataDir, numForThreads);

        var errorsCount = SplitAndCountErrors.CountErrorsAndMergeWithTPL(filesNames);
        Console.WriteLine($"in total there is: {errorsCount.Count} errors");
        Console.WriteLine($"count of {Math.Min(N, errorsCount.Count)} errors:");
        var listOfErrors = new List<(string errorCode, int count)>();

        if (N >= errorsCount.Count)
        {
            listOfErrors= errorsCount.Select(x => (x.Key, x.Value)).ToList();
            foreach (var e in listOfErrors)
            {
                Console.WriteLine($"{e.errorCode}: {e.count}");
            }
            return listOfErrors;

        }
        for(int i = 0; i < N; i++)
        {
            var max = errorsCount.Aggregate((a, b) => a.Value > b.Value ? a : b);
            listOfErrors.Add((max.Key,max.Value));
            errorsCount.TryRemove(max.Key,out _);
            Console.WriteLine($"{max.Key}: {max.Value}");
        }

        return listOfErrors;


    }
    static string Run2(string csvPath, string parquetPath)
    {

        return "cc";
    }
}



