using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Threading;
using System.Collections.Concurrent;

namespace manage_files
{
    class SplitAndCountErrors
    {
        public static void ReadOne()
        {
            using StreamReader sr = new StreamReader(@"C:\Users\User\Documents\hadasim\manage_files\data\logs1.txt");

            Console.WriteLine(sr.ReadLine());
        }
        public static void ReadAll()
        {
            using StreamReader sr = new StreamReader(@"C:\Users\User\Documents\hadasim\manage_files\data\logs1.txt");

            string? line;
            while ((line = sr.ReadLine()) != null)
            {
                Console.WriteLine(line);
            }
        }
        public static List<string> MakeDirs(string dataDir, int num)
        {

            //נתיבים 
            string splitErrorDir = Path.Combine(dataDir, "split_errors");
            string filePath = Path.Combine(dataDir, "logs1.txt");

            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException("the file doesn't exist ", filePath);
            }

            //אם לא קיימות אז ליצור אותן
            Directory.CreateDirectory(dataDir);
            Directory.CreateDirectory(splitErrorDir);

            //int numOfLines = File.ReadAllLines(filePath).Count();
            int numOfLines = 0;
            using (var lineCount = File.OpenText(filePath))
            {
                while (lineCount.ReadLine() != null)
                    numOfLines++;
            }
            List<string> filesNames = new List<string>();


            int baseNumOfLine = numOfLines / num;
            int lineLeft = numOfLines % num;

            using (var reader = new StreamReader(filePath))
            {
                for (int i = 0; i < num; i++)
                {

                    int linesToWrite = baseNumOfLine + (lineLeft <= 0 ? 0 : 1);
                    if (lineLeft > 0)
                        lineLeft--;
                    string outputFilePath = Path.Combine(splitErrorDir, $"file_{i + 1}.txt");
                    filesNames.Add(outputFilePath);

                    using (var writer = new StreamWriter(outputFilePath,false))
                    {

                        for (int j = 0; j < linesToWrite; j++)
                        {
                            string? line = reader.ReadLine();
                            if (line == null) break;
                            writer.WriteLine(line);
                        }

                    }


                }

            }
            return filesNames;

        }

        public static Dictionary<string, int> CountErrorsFromFile(string filePath)
        {
            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException("the file doesn't exist ", filePath);
            }


            var errorsCount = new Dictionary<string, int>();
            int errorIndex;
            string errorCode;
            string start = "Error: ";

            using (var reader = new StreamReader(filePath))
            {
                string? line;
                while ((line = reader.ReadLine()) != null)
                {
                    errorIndex = line.IndexOf(start);
                    if (errorIndex >= 0)
                    {
                        errorCode = line.Substring(errorIndex + start.Length);
                        if (errorsCount.ContainsKey(errorCode))
                            errorsCount[errorCode]++;
                        else
                            errorsCount[errorCode] = 1;
                    }

                }

            }
            return errorsCount;
        }
        public static ConcurrentDictionary<string, int> CountErrorsAndMergeWithTPL(List<string> filesNames)
        {
            var countAllFiles = new ConcurrentDictionary<string, int>();


            Parallel.ForEach(filesNames, fileName =>
            {
                var countErrorsOfFile = CountErrorsFromFile(fileName);

                foreach (var c in countErrorsOfFile)
                {
                    string errorCode = c.Key;
                    int count = c.Value;

                    countAllFiles.AddOrUpdate(errorCode, count, (key, val) => val + count);

                }
                Console.WriteLine($"thread finished for file{fileName} on thread {Thread.CurrentThread.ManagedThreadId}");

            });

            return countAllFiles;
        }

        //public static ConcurrentDictionary<string, int> CountErrorsAndMergeWithThreads(List<string> filesNames, int num)
        //{
        //    var countAllFiles = new ConcurrentDictionary<string, int>();


        //    int numForCount = Math.Min(num, filesNames.Count);
        //    List<Thread> threadsList = new List<Thread>();

        //    for (int i = 0; i < numForCount; i++)
        //    {
        //        string fileName = filesNames[i];

        //        Thread threadVar = new Thread(() =>
        //        {
        //            Dictionary<string, int> countErrorsOfFile = CountErrorsFromFile(fileName);
        //            foreach (var c in countErrorsOfFile)
        //            {
        //                string errorCode = c.Key;
        //                int count = c.Value;

        //                countAllFiles.AddOrUpdate(errorCode, count, (key, val) => val + count);

        //            }
        //            Console.WriteLine($"thread finished for file{fileName} on thread {Thread.CurrentThread.ManagedThreadId}");
        //        }
        //        );

        //        threadVar.Start();
        //        threadsList.Add(threadVar);



        //    }
        //    foreach (var t in threadsList)
        //        t.Join();

        //    return countAllFiles;
        //}
        //public static Dictionary<string, int> CountErrorsAndMerge(List<string> filesNames, int num)
        //{
        //    var countAllFiles = new Dictionary<string, int>();
        //    Dictionary<string, int> countErrorsOfFile;
        //    string? fileName;

        //    int numForCount = Math.Min(num, filesNames.Count);

        //    for (int i = 0; i < numForCount; i++)
        //    {
        //        fileName = filesNames[i];
        //        countErrorsOfFile = CountErrorsFromFile(fileName);
        //        foreach (var c in countErrorsOfFile)
        //        {
        //            string errorCode = c.Key;
        //            int count = c.Value;

        //            if (countAllFiles.ContainsKey(errorCode))
        //                countAllFiles[errorCode]+=count;
        //            else
        //                countAllFiles[errorCode] = count;

        //        }

        //    }

        //    return countAllFiles;
        //}

    }
}
