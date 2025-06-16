// See https://aka.ms/new-console-template for more information
using manage_files;
using System;
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
            Run1(dataDir,N);
            Run2(csvPath, parquetPath);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"An error occurred: {ex.Message}");
        }
    }
    static void Run1(string dataDir,int N)
    {
        //split_and_count_errors.ReadOne();

        int numForThreads = Environment.ProcessorCount;
        List<string> filesNames= SplitAndCountErrors.MakeDirs(dataDir, numForThreads);

        var errorsCount= SplitAndCountErrors.CountErrorsAndMergeWithTPL(filesNames);
        Console.WriteLine($"count of {Math.Min(N,errorsCount.Count)} errors:");
        foreach(var e in errorsCount.OrderByDescending(x=>x.Value).Take(N))
        {
            Console.WriteLine($"{e.Key}: {e.Value}");
        }
        Console.WriteLine($"in total there is: {errorsCount.Count} errors");



    }
    static string Run2(string csvPath, string parquetPath)
    {

        return "cc";
    }
}



