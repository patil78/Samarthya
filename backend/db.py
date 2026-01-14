import mysql.connector
from mysql.connector import Error

def get_connection():
    try:
        conn = mysql.connector.connect(
            host="gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
            port=4000,
            user="2p6u58mMBxe8vS4.root",
            password="Z9A4YzsaLtwXXHmZ",  # <-- IMPORTANT: Use the password for this cloud database
            database="samarthya_db",
            ssl_ca="isrgrootx1.pem"  # Path to the SSL certificate file
        )
        if conn.is_connected():
            print("Connected: true")
            return conn
    except Error as e:
        print("Error connecting to MySQL:", e)
        return None

# Run only when executing this file directly
if __name__ == "__main__":
    connection = get_connection()
    if connection:
        connection.close()
        print("Connection closed.")
