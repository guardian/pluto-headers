#!/usr/bin/env python3
import re

import requests
import requests.utils
import argparse
import logging
import urllib.parse
from pprint import pprint
from typing import List
import base64
import binascii
import json

logging.basicConfig(level=logging.WARN, format="{asctime} {levelname} {funcName} - {message}", style='{')
logger = logging.getLogger(__name__)
logger.level = logging.INFO


class ProjectInformation(object):
    def __init__(self, id:int, name:str, namespaced_name:str):
        self.id = id
        self.name = name
        self.namespaced_name = namespaced_name

    @staticmethod
    def from_server_json(jsoncontent:dict):
        try:
            return ProjectInformation(jsoncontent["id"], jsoncontent["name"], jsoncontent["name_with_namespace"])
        except KeyError as e:
            logger.error("Could not create project information from server response, was missing {0}".format(e))
            raise ValueError("Incorrect json content")


class FileInformation(object):
    def __init__(self, id:str, mode:str, name:str, path:str, type:str):
        self.id = id
        self.mode = mode
        self.name = name
        self.path = path
        self.type = type

    @staticmethod
    def from_server_json(jsoncontent:dict):
        try:
            return FileInformation(jsoncontent["id"], jsoncontent["mode"], jsoncontent["name"], jsoncontent["path"], jsoncontent["type"])
        except KeyError as e:
            logger.error("Could not create file information from server response, was missing {0}".format(e))
            raise ValueError("Incorrect json content")


class LinkNavigator(object):
    def __init__(self, response_obj):
        listed_content = requests.utils.parse_header_links(response_obj.headers.get("link"))
        self.links = dict([ (link["rel"], link["url"])  for link in listed_content])

    def next(self):
        if "next" in self.links:
            return self.links["next"]
        else:
            return None


def find_owned_projects(token:str) -> List[ProjectInformation]:
    url = "https://gitlab.com/api/v4/projects?owned=true"
    response = requests.get(url, headers={"PRIVATE-TOKEN": token})
    logger.debug("Server response: {0}".format(response.status_code))
    if response.status_code != 200:
        raise Exception("Server returned {0} {1}".format(response.status_code, response.text))
    return [ProjectInformation.from_server_json(entry) for entry in response.json()]


def find_packagejson(project_id:str, token:str, page_size:int=100) -> List[FileInformation]:
    """
    try to find a package.json file in the given repo
    :param project_id:
    :return:
    """
    page = 0
    url = "https://gitlab.com/api/v4/projects/{project_id}/repository/tree?recursive=true&per_page={s}".format(
        project_id=urllib.parse.quote(project_id, safe=''),
        s=page_size
    )
    results = []
    while True:
        page +=1
        logger.debug("URL is {0}".format(url))
        response = requests.get(url, headers={"PRIVATE-TOKEN": token, "Content-Type": "application/json"})
        if response.status_code != 200:
            raise Exception("Server returned {0} {1}".format(response.status_code, response.text))

        page_content = [FileInformation.from_server_json(entry) for entry in response.json()]

        results = results + list(filter(lambda f: f.name=="package.json", page_content))

        nav = LinkNavigator(response)
        url = nav.next()
        if url is None:
            break

    return results


def retrieve_file(file:FileInformation, project_id:str, token:str, branch_or_ref:str="master") -> str:
    url = "https://gitlab.com/api/v4/projects/{project_id}/repository/files/{filepath}?ref={branch}".format(
        project_id=urllib.parse.quote(project_id, safe=''),
        filepath=urllib.parse.quote(file.path, safe=''),
        branch=urllib.parse.quote(branch_or_ref)
    )
    logger.debug("URL is {0}".format(url))
    response = requests.get(url, headers={'PRIVATE-TOKEN': token, "Content-Type": "application/json"})
    if response.status_code != 200:
        raise Exception("Server returned {0} {1}".format(response.status_code, response.text))

    try:
        file_content = base64.b64decode(response.json()["content"])
        return file_content.decode("UTF-8")
    except UnicodeError as e:
        logger.error("File {0} was not in unicode format: {1}".format(file.path, e))
        raise ValueError("File was not in the right format")
    except KeyError:
        logger.error("Invalid response from server, no file content present for {0}".format(file.path))
        raise ValueError("No file content present in response")
    except binascii.Error as e:
        logger.error("File data for {0} was incorrectly encoded: {1}".format(file.path, e))
        raise ValueError("Incorrect encoding")


def update_plutoheaders_version(file:FileInformation, project_id:str, token:str, to_version:str, branch_or_ref:str="master") -> (bool, str):
    # matcher = re.compile(r"""^(\s+"pluto-headers":\s+"[\w\d:/-]+)#([\w\d\.]+)".""")
    matcher = re.compile(r"""^([\w\d:/.-]+)#([\w\d\.]+)$""")
    content = retrieve_file(file, project_id, token, branch_or_ref)

    parsed_packagejson = json.loads(content)
    if "dependencies" not in parsed_packagejson:
        logger.info("{0} has no listed dependencies".format(project_id))
        return False, ""
    if "pluto-headers" in parsed_packagejson["dependencies"]:
        matches = matcher.match(parsed_packagejson["dependencies"]["pluto-headers"])
        if matches is not None:
            logger.info("Current version is {0}, want {1}".format(matches.group(2), to_version))
            if matches.group(2)==to_version:
                logger.info("Versions already match, no changes required")
                return False, ""
            new_value = "{0}#{1}".format(matches.group(1), to_version)

            # Now, of course we _could_ just render the dictionary back to json here.  But this would screw up any
            # existing formatting or ordering in package.json, which we don't want. So instead we do a simple string-replacement.
            updated_text = re.sub(re.escape(parsed_packagejson["dependencies"]["pluto-headers"]), new_value, content)
            return True, updated_text
        else:
            logger.info("pluto-headers is imported differently - {0} is not the right format".format(parsed_packagejson["dependencies"]["pluto-headers"]))
            return False, ""
    else:
        logger.info("This package does not import pluto-headers")
        return False, ""


def create_branch(project_id:str, token:str, branch_name:str, source_ref:str="master"):
    url = "https://gitlab.com/api/v4/projects/{project_id}/repository/branches?branch={b}&ref={s}".format(
        project_id=project_id,
        b=urllib.parse.quote(branch_name, safe=''),
        s=urllib.parse.quote(source_ref, safe='')
    )

    response = requests.post(url, headers={'PRIVATE-TOKEN': token, 'Accept': "application/json"})
    if response.status_code==400:
        response_content = response.json()
        if "message" in response_content and response_content["message"] == "Branch already exists":
            logger.info(f"Branch {branch_name} already existed, using that one")
            return
        raise Exception("Server returned {0} {1}".format(response.status_code, response.text))
    elif response.status_code > 200 and response.status_code>299:
        raise Exception("Server returned {0} {1}".format(response.status_code, response.text))
    logger.info(f"Created branch {branch_name}")


def push_file(file:FileInformation, project_id:str, token:str, branch_name:str, commit_msg:str, new_content:str):
    url = "https://gitlab.com/api/v4/projects/{project_id}/repository/files/{f}".format(
        project_id=urllib.parse.quote(project_id, safe=''),
        f=urllib.parse.quote(file.path, safe='')
    )
    request_content = {
        "branch": branch_name,
        "content": new_content,
        "commit_message": commit_msg
    }

    response = requests.put(url,data=json.dumps(request_content),headers={
        "Content-Type": "application/json",
        "PRIVATE-TOKEN": token,
        "Accept": "application/json"
    })
    if response.status_code > 200 and response.status_code>299:
        raise Exception("Server returned {0} {1}".format(response.status_code, response.text))
    logger.info(f"Updated {file.path} in branch {branch_name}")


def create_merge_request(project_id:str, token:str, title:str, description:str, branch_name:str, target_branch:str="master"):
    url = f"https://gitlab.com/api/v4/projects/{project_id}/merge_requests"
    request_content = {
        "source_branch": branch_name,
        "target_branch": target_branch,
        "title": title,
        "description": description,
        "remove_source_branch": True,
    }

    response = requests.post(url,
                             data=json.dumps(request_content, indent=4, sort_keys=True),
                             headers={
                                "Content-Type": "application/json",
                                "PRIVATE-TOKEN": token,
                                "Accept": "application/json"
                            })
    if response.status_code==409:
        logger.info("This merge request already existed")
    elif response.status_code > 200 and response.status_code>299:
        raise Exception("Server returned {0} {1}".format(response.status_code, response.text))
    logger.info(f"Created new merge request {title}")


def find_wanted_version()->str:
    import os.path
    my_path = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.abspath(os.path.join(my_path, ".."))
    logger.info("Running in {0}, script path is {1}, repo root is {2}".format(os.getcwd(), my_path, repo_root))

    with open(os.path.join(repo_root, "package.json")) as f:
        package_json_conntent = json.load(f)

    return "v" + package_json_conntent["version"]


def process_repo(repo_id:str, token: str, wanted_version:str, dry_run:bool):
    hits = find_packagejson(repo_id, token)
    for h in hits:
        logger.info("Found file {0} - {1}".format(h.id, h.path))
        did_update, maybe_content = update_plutoheaders_version(h, repo_id, token, wanted_version)
        if did_update:
            if dry_run:
                logger.info(f"Changes would be made to {h.path}")
                break
            desc = f"""
            Updates pluto-headers to {wanted_version}.

            This merge request was created automatically by rollout_updated_version in the pluto-headers repo.
            """.lstrip()
            new_branch_name = f"plutoheaders-{wanted_version}"
            create_branch(repo_id, token, new_branch_name)
            push_file(h, repo_id, token, new_branch_name, f"Updating pluto-headers to {wanted_version}", maybe_content)
            create_merge_request(repo_id, token, "Update pluto-headers version", desc, new_branch_name)
        else:
            logger.info(f"No updates required for {repo_id}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Creates merge requests on all other prexit components for an update of this component")
    parser.add_argument("--token",type=str,dest="token", help="gitlab api token")
    parser.add_argument("--repo",type=str,dest="repo", help="numeric id of the repo to act on")
    parser.add_argument("--list-repos", dest="list_repo", action=argparse.BooleanOptionalAction, default=False)
    parser.add_argument("--all-my-repos", dest="all_repo", action=argparse.BooleanOptionalAction, default=False)
    parser.add_argument("--dry-run", dest="dry_run", help="Don't make any commits to the repos", action=argparse.BooleanOptionalAction, default=False)
    args = parser.parse_args()

    wanted_version = find_wanted_version()

    if args.list_repo:
        projects = find_owned_projects(args.token)
        for p in projects:
            logger.info("Found project {0} - {1}".format(p.id, p.namespaced_name))
        exit(0)

    if args.all_repo:
        projects = find_owned_projects(args.token)
        for p in projects:
            logger.info("Found project {0} - {1}".format(p.id, p.namespaced_name))
            process_repo(str(p.id), args.token, wanted_version, args.dry_run)
    elif args.repo:
        process_repo(args.repo, args.token, wanted_version,  args.dry_run)
    else:
        print("You must specify either --list-repos, --repo {repo-id} or --all-my-repos.\n"+
              "To find a repo-id, run with the --list-repos option.\n"+
              "For other options, including --token, run with --help.")
