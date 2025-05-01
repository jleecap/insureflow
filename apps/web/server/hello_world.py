# hello_world.py

import sys

def main():
    print("Hello World from Python! 🎉")

    if len(sys.argv) > 1:
        blob_name = sys.argv[1]
        print(f"Received blob name: {blob_name}")

if __name__ == "__main__":
    main()
