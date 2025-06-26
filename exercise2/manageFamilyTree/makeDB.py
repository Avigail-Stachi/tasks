import sqlite3
import os

DB_PATH = './data/familyTree.db'
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)


def create_db(path=DB_PATH):
    if os.path.exists(path):
        os.remove(path)
    conn=sqlite3.connect(path)
    conn.execute('PRAGMA foreign_keys = ON;')
    cur=conn.cursor()
    # טבלת אנשים
    cur.execute('''
        CREATE TABLE People (
            Person_Id INTEGER PRIMARY KEY,
            Personal_Name TEXT NOT NULL,
            Family_Name TEXT NOT NULL,
            Gender TEXT CHECK(Gender IN ('Male', 'Female')) NOT NULL,
            Father_Id INTEGER,
            Mother_Id INTEGER,
            Spouse_Id INTEGER,
            
            FOREIGN KEY(Father_Id) REFERENCES People(Person_Id),
            FOREIGN KEY(Mother_Id) REFERENCES People(Person_Id),
            FOREIGN KEY(Spouse_Id) REFERENCES People(Person_Id)
        );
      ''')
    # טבלת קשרים
    cur.execute('''
        CREATE VIEW IF NOT EXISTS FirstDegreeRelatives AS
        SELECT
            p1.Person_Id,
            p1.Father_Id as Relative_Id,
            'Father' as Connection_Type
        FROM
            People as p1
        WHERE
            p1.Father_Id IS NOT NULL
        
        UNION ALL
        
        SELECT
            p1.Person_Id,
            p1.Mother_Id as Relative_Id,
            'Mother' as Connection_Type
        FROM
            People as p1
        WHERE
            p1.Mother_Id IS NOT NULL
            
            
        UNION ALL
        
        SELECT
            p1.Person_Id,
            p1.Spouse_Id as Relative_Id,
            'Spouse' as Connection_Type
        FROM
            People as p1
        WHERE
            p1.Spouse_Id IS NOT NULL
            
        UNION ALL
        
        SELECT
            p1.Person_Id,
            c1.Person_Id AS Relative_Id,
            CASE
                WHEN c1.Gender = 'Male' THEN 'Son'
                WHEN c1.Gender = 'Female' THEN 'Daughter'
                ELSE 'Child'
            END AS Connection_Type
        FROM
            People AS p1
        JOIN
            People AS c1 ON (c1.Father_Id = p1.Person_Id OR c1.Mother_Id = p1.Person_Id)
        WHERE
            c1.Father_Id = p1.Person_Id OR c1.Mother_Id = p1.Person_Id
            
        UNION ALL
        
        SELECT
            p1.Person_Id,
            s1.Person_Id AS Relative_Id,
            CASE
                WHEN s1.Gender = 'Male' THEN 'Brother'
                WHEN s1.Gender = 'Female' THEN 'Sister'
                ELSE 'Sibling'
            END AS Connection_Type
        FROM
            People AS p1
        JOIN
            People AS s1 ON (
                (p1.Father_Id IS NOT NULL AND s1.Father_Id = p1.Father_Id) OR
                (p1.Mother_Id IS NOT NULL AND s1.Mother_Id = p1.Mother_Id)
            )
        WHERE
            s1.Person_Id != p1.Person_Id
 
        
    ''')

    #
    #     UNION ALL
    #
    #     SELECT
    #         p1.Spouse_Id AS Person_Id,
    #         p1.Person_Id AS Relative_Id,
    #         'Spouse' AS Connection_Type
    #     FROM
    #         People AS p1
    #     WHERE
    #         p1.Spouse_Id IS NOT NULL
            
        
    conn.commit()
    conn.close()

def populate_db(path=DB_PATH):
    conn = sqlite3.connect(path)
    cur=conn.cursor()
    conn.execute('PRAGMA foreign_keys = ON;')

    def insert_person(Person_Id,Personal_Name,Family_Name,Gender,Father_Id=None,Mother_Id=None,Spouse_Id=None):
        try:
            cur.execute('''
                INSERT INTO People (Person_Id,Personal_Name,Family_Name,Gender,Father_Id,Mother_Id,Spouse_Id)
                VALUES (?, ?, ?, ?, ?, ?, ?);
            ''', (Person_Id,Personal_Name,Family_Name,Gender,Father_Id,Mother_Id,Spouse_Id))
            print(f"Inserted person:{Person_Id} {Personal_Name} {Family_Name}")
        except sqlite3.IntegrityError as e:
            print(f"Error inserting person {Person_Id}: {e}")


    insert_person(1, 'David', 'Levi', 'Male')  #אבא
    insert_person(2, 'Sara', 'Levi', 'Female')  # אמא
    insert_person(3, 'Tomer', 'Levi', 'Male')  # בן
    insert_person(4, 'Noa', 'Levi', 'Female')  # בת

    # מישהו לא קשור
    insert_person(5, 'Ron', 'Cohen', 'Male')

    # דבורה מצביעה על שי בתור בן זוג, ושי לא מצביע עליה בחזרה
    insert_person(111, 'Dvora', 'Golan', 'Female')
    insert_person(222, 'Shai', 'Dadon', 'Male')

    print("update realationships")
    try:
        cur.execute("UPDATE People SET Spouse_Id = 2 WHERE Person_Id = 1;")
        cur.execute("UPDATE People SET Spouse_Id = 1 WHERE Person_Id = 2;")
        cur.execute("UPDATE People SET Father_Id = 1, Mother_Id = 2 WHERE Person_Id = 3;")
        cur.execute("UPDATE People SET Father_Id = 1, Mother_Id = 2 WHERE Person_Id = 4;")

        #קשר זוגי לא מסונכרן
        cur.execute("UPDATE People SET Spouse_Id = 222 WHERE Person_Id = 111;")

        conn.commit()
        print("successfully updated relationships")
    except sqlite3.IntegrityError as e:
        print(f"Error updating relationships: {e}")
        conn.rollback()


    conn.commit()
    conn.close()
if __name__=="__main__":
    create_db()
    populate_db()




