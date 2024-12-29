"""Retrieves public information about organization contributors.

Note:
    Used instead of https://github.com/github/contributors to get more customized
    information.
"""

import datetime
import json
import os
from typing import Dict, List

from github import Github

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
        login: The GitHub username of the contributor.
        name: The name of the contributor.
        avatar_url: The URL of the contributor's avatar.
        location: The location of the contributor.
        company: The company of the contributor.
        bio: The bio of the contributor.
        blog_url: The URL of the contributor's blog.
        twitter_username: The Twitter username of the contributor.
        org_member: Whether the contributor is a member of the organization.
        contributions: The number of contributions to source repositories.
        yearly_contributions: The number of contributions in the last year.
    """

    def __init__(
        self,
        login: str,
        name: str,
        avatar_url: str,
        location: str,
        company: str,
        bio: str,
        blog_url: str,
        twitter_username: str,
        org_member: bool,
    ):
        self.login = login
        self.name = name
        self.avatar_url = avatar_url
        self.location = location
        self.company = company
        self.bio = bio
        self.blog_url = blog_url
        self.twitter_username = twitter_username
        self.org_member = org_member
        self.contributions = 0
        self.yearly_contributions = 0

    def add_contributions(self, contributions: int):
        """Adds contributions to the contributor.

        Args:
            contributions: The number of contributions to add.
        """
        self.contributions += contributions

    def add_yearly_contributions(self, contributions: int):
        """Adds yearly contributions to the contributor.

        Args:
            contributions: The number of contributions to add.
        """
        self.yearly_contributions += contributions

    def to_dict(self) -> Dict[str, any]:
        """Returns a dictionary representation of the object."""
        return {
            "login": self.login,
            "name": self.name,
            "avatar_url": self.avatar_url,
            "location": self.location,
            "company": self.company,
            "bio": self.bio,
            "blog_url": self.blog_url,
            "twitter_username": self.twitter_username,
            "org_member": self.org_member,
            "contributions": self.contributions,
            "yearly_contributions": self.yearly_contributions,
        }


def save_to_json(data: Dict[str, any], filename: str):
    """Saves data to a JSON file.

    Args:
        data: The data to save.
        filename: The name of the file to save the data to.
    """
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, "w") as f:
        json.dump(data, f, indent=2)


def get_public_org_members(org_name: str) -> List[str]:
    """Retrieves the public members of an organization.

    Args:
        org_name: The name of the organization.

    Returns:
        A list of the organization's public members.
    """
    org = github_client.get_organization(org_name)
    members = org.get_public_members()
    return [member.login for member in members]


def get_public_source_repos(org_name: str) -> List:
    """Retrieves the public repositories of an organization, excluding forks.

    Args:
        org_name: The name of the organization.

    Returns:
        A list of the organization's public repositories that are not forks.
    """
    org = github_client.get_organization(org_name)
    repos = org.get_repos(type="public")
    return [repo for repo in repos if not repo.fork]


def get_contributions_between_dates(
    repo: str, contributor_login: str, start_date: datetime, end_date: datetime
) -> int:
    """Retrieves the number of contributions for a contributor between the given start and end dates.

    Args:
        repo: The repository object.
        contributor_login: The login of the contributor.
        start_date: The start date for the date range.
        end_date: The end date for the date range.

    Returns:
        The number of contributions between the given dates.
    """
    commits = repo.get_commits(
        author=contributor_login, since=start_date, until=end_date
    )
    return commits.totalCount


def get_org_contributors_info(org_name: str) -> List[Dict[str, any]]:
    """Retrieves information about organization contributors.

    Args:
        org_name (str): The name of the organization.

    Returns:
        A list of dictionaries containing contributor information.
    """
    print("Retrieving public organization members...")
    public_members = get_public_org_members(org_name)
    print("Retrieving public repositories...")
    public_repos = get_public_source_repos(org_name)

    # Get contributors info.
    end_date = datetime.datetime.now()
    start_date = end_date - datetime.timedelta(days=365)
    contributors_info: Dict[str, ContributorInfo] = {}
    print("Retrieving contributors info...")
    for repo in public_repos[:1]:
        for contributor in repo.get_contributors():
            if contributor.login not in contributors_info:
                contributors_info[contributor.login] = ContributorInfo(
                    login=contributor.login,
                    name=contributor.name,
                    avatar_url=contributor.avatar_url,
                    location=contributor.location,
                    company=contributor.company,
                    bio=contributor.bio,
                    blog_url=contributor.blog,
                    twitter_username=contributor.twitter_username,
                    org_member=contributor.login in public_members,
                )

            contributors_info[contributor.login].add_contributions(
                contributions=contributor.contributions
            )
            yearly_contributions = get_contributions_between_dates(
                repo, contributor.login, start_date, end_date
            )
            contributors_info[contributor.login].add_yearly_contributions(
                yearly_contributions
            )
        print(f"Retrieved contributors info for: {repo.full_name}")

    return [contributor.to_dict() for contributor in contributors_info.values()]


if __name__ == "__main__":
    print(f"Retrieving contributors info for {ORG_NAME}...")
    contributors_info = get_org_contributors_info(ORG_NAME)

    script_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(script_dir, "data/contributors_info.json")
    save_to_json(contributors_info, file_path)
    print(
        f"Retrieved contributions for {len(contributors_info)} contributors and saved "
        f"to {file_path}"
    )
