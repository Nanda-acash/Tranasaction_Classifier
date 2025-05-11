#!/usr/bin/env python
"""
Database migration helper script
"""
import os
import sys
import argparse
import subprocess

def run_migrations(args):
    """Run Alembic migrations"""
    command = ["alembic"]
    
    if args.upgrade:
        command.extend(["upgrade", args.upgrade])
    elif args.downgrade:
        command.extend(["downgrade", args.downgrade])
    elif args.revision:
        command.extend(["revision", "--autogenerate", "-m", args.revision])
    else:
        command.extend(["current"])
    
    subprocess.run(command)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Database migration helper")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--upgrade", help="Upgrade to specified revision, or 'head' for latest")
    group.add_argument("--downgrade", help="Downgrade to specified revision, or '-1' for previous")
    group.add_argument("--revision", help="Create a new revision with the given message")
    
    args = parser.parse_args()
    run_migrations(args)
