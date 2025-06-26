import sqlite3
import os
from pydoc import describe

import makeDB


def display_people_table(path=makeDB.DB_PATH):
    conn=sqlite3.connect(path)
    cur=conn.cursor()
    print("people table:")
    cur.execute("SELECT * FROM People ORDER BY Person_Id;")
    rows=cur.fetchall()
    if not rows:
        print("no data in pepole table")
    else:
        column_names=[description[0] for  description in cur.description]
        print(column_names)
        for row in rows:
            print(row)

    conn.close()

def display_first_degree_relatives(path=makeDB.DB_PATH):
    conn = sqlite3.connect(path)
    cur = conn.cursor()
    print("FirstDegreeRelatives table:")
    cur.execute("SELECT * FROM FirstDegreeRelatives ORDER BY Person_Id, Relative_Id;")
    rows = cur.fetchall()
    if not rows:
        print("no data in FirstDegreeRelatives view")
    else:
        column_names = [description[0] for description in cur.description]
        print(column_names)
        for row in rows:
            print(row)

    conn.close()

def fix_spouse_relationships(path=makeDB.DB_PATH):
    conn = sqlite3.connect(path)
    cur = conn.cursor()
    try:
        cur.execute('''
            SELECT 
                p1.Person_Id AS Person_A_Id,
                p1.Spouse_Id AS Person_B_Id
            FROM
                People AS p1
            JOIN
                People AS p2 ON p1.Spouse_Id = p2.Person_Id
            WHERE
                p1.Spouse_Id IS NOT NULL AND
                (p2.Spouse_Id IS NULL OR p2.Spouse_Id != p1.Person_Id);
        ''')
        rows_to_change=cur.fetchall()
        if not rows_to_change:
            print("there arent spouse relationships found to fix")
            conn.close()
            return
        print(f"found {len(rows_to_change)} spouse relationships to fix")

        for person_a_id,person_b_id in rows_to_change:
            cur.execute("UPDATE People SET Spouse_Id = ? WHERE Person_Id = ?;", (person_a_id, person_b_id))
        conn.commit()
        print("spouse relationships fixed")
    except sqlite3.Error as e:
        print("error fixing spouse relationships ")
        conn.rollback()
    finally:
        conn.close()
if __name__ == "__main__":
    display_people_table()
    display_first_degree_relatives()
    fix_spouse_relationships()
    display_people_table()
    display_first_degree_relatives()