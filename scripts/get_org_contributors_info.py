"""Retrieves public information about organization contributors.

Note:
    Used instead of https://github.com/github/contributors to get more customized information.
"""

import json
import os
from typing import Dict, List

from github import Github, PaginatedList

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
ORG_NAME = os.getenv("ORG_NAME")

if not GITHUB_TOKEN:
    raise ValueError("GITHUB_TOKEN environment variable not set")
if not ORG_NAME:
    raise ValueError("ORG_NAME environment variable not set")

github_client = Github(GITHUB_TOKEN)


class ContributorInfo:
    """A class to represent information about a GitHub contributor.

    Attributes:
        login (str): The GitHub username of the contributor.
        name (str): The name of the contributor.
        avatar_url (str): The URL of the contributor's avatar.
        location (str): The location of the contributor.
        company (str): The company of the contributor.
        org_member (bool): Whether the contributor is a member of the organization.
        source_contributions (int): The number of contributions to source repositories.
        fork_contributions (int): The number of contributions to forked repositories
    """

    def __init__(
        self,
        login: str,
        name: str,
        avatar_url: str,
        location: str,
        company: str,
        org_member: bool,
    ):
        self.login = login
        self.name = name
        self.avatar_url = avatar_url
        self.location = location
        self.company = company
        self.org_member = org_member
        self.source_contributions = 0
        self.fork_contributions = 0

    def add_contributions(self, contributions: int, is_fork: bool = False):
        """Adds contributions to the contributor.

        Args:
            contributions (int): The number of contributions to add.
            is_fork (bool, optional): Whether the contributions are to a forked
                repository. Defaults to False.
        """
        if is_fork:
            self.fork_contributions += contributions
        else:
            self.source_contributions += contributions

    def to_dict(self) -> Dict[str, any]:
        """Returns a dictionary representation of the object."""
        return {
            "login": self.login,
            "name": self.name,
            "avatar_url": self.avatar_url,
            "location": self.location,
            "company": self.company,
            "org_member": self.org_member,
            "source_contributions": self.source_contributions,
            "fork_contributions": self.fork_contributions,
        }


def save_to_json(data: Dict[str, any], filename: str):
    """Saves data to a JSON file.

    Args:
        data: The data to save.
        filename: The name of the file to save the data to.
    """
    with open(filename, "w") as f:
        json.dump(data, f, indent=2)


def get_public_org_members(org_name: str) -> List[str]:
    """Retrieves the public members of an organization.

    Args:
        org_name (str): The name of the organization.

    Returns:
        A list of the organization's public members.
    """
    org = github_client.get_organization(org_name)
    members = org.get_public_members()
    return [member.login for member in members]


def get_org_repos(org_name: str, type="public") -> PaginatedList:
    """Retrieves the repositories of an organization.

    Args:
        org_name (str): The name of the organization.
        type (str, optional): The type of repositories to retrieve. Defaults to "public".

    Returns:
        A list of the organization's repositories.
    """
    org = github_client.get_organization(org_name)
    repos = org.get_repos(type=type)
    return repos


def get_org_contributors_info(org_name: str) -> List[Dict[str, ContributorInfo]]:
    """Retrieves information about organization contributors.

    Args:
        org_name (str): The name of the organization.

    Returns:
        A list of dictionaries containing contributor information.
    """
    public_members = get_public_org_members(org_name)
    public_repos = get_org_repos(org_name)

    # Get contributors info.
    contributors_info: Dict[str, ContributorInfo] = {}
    for repo in public_repos:
        for contributor in repo.get_contributors():
            if contributor.login not in contributors_info:
                contributors_info[contributor.login] = ContributorInfo(
                    login=contributor.login,
                    name=contributor.name,
                    avatar_url=contributor.avatar_url,
                    location=contributor.location,
                    company=contributor.company,
                    org_member=contributor.login in public_members,
                )

            contributors_info[contributor.login].add_contributions(
                contributions=contributor.contributions, is_fork=repo.fork
            )

    return [contributor.to_dict() for contributor in contributors_info.values()]


if __name__ == "__main__":
    print(f"Retrieving contributors info for {ORG_NAME}...")
    contributors_info = get_org_contributors_info(ORG_NAME)

    save_to_json(contributors_info, "contributors_info.json")
    print(
        f"Retrieved contributions for {len(contributors_info)} contributors and saved to contributors_info.json"
    )
