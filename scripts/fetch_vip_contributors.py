"""Fetches orchestrators with a GitHub account from the Livepeer Explorer API and stores
them in a JSON file so we can showcase them in the contributors spotlight.
"""

import requests
import json
import os
from typing import Dict

FILE_DIR = os.path.dirname(os.path.abspath(__file__))


def save_to_json(data: Dict[str, any], filename: str):
    """Saves data to a JSON file.

    Args:
        data: The data to save.
        filename: The name of the file to save the data to.
    """
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, "w") as f:
        json.dump(data, f, indent=2)


if __name__ == "__main__":
    print("Fetching orchestrators with GitHub accounts...")
    # Fetch orchestrator profile data.
    response = requests.get("https://explorer.livepeer.org/api/ens-data")
    data = response.json()

    # Filter the data to get orchestrators with a GitHub account and use GitHub as the key.
    filtered_data = {
        item["github"]: {
            "name": item["name"],
            "url": f"https://explorer.livepeer.org/accounts/{item['id']}/orchestrating",
        }
        for item in data
        if item.get("github") and item["github"].strip() != ""
    }

    # Save the filtered data to a JSON file.
    file_path = os.path.join(FILE_DIR, "assets/vip_info.json")
    save_to_json(filtered_data, file_path)
    print(f"Stored orchestrators with GitHub accounts in {file_path}")
