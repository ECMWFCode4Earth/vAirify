import json


def write_to_file(data_to_write, file_to_write: str):
    with open(file_to_write, "w", encoding="utf-8") as f:
        json.dump(data_to_write, f)
